// Handle full RAG logic (retrieve + LLM answer)
import { SystemMessage } from 'langchain';
import { openaiClient } from '../config/openai.js';
import { findSimilarChunks } from './vectorService.js';
import { logger } from '../utils/logger.js';
import { insertChatConversation } from './dataServices.js';
import { ChatConversation, ChatConversationChunk } from '../types/chatConversations.js';
import { ConversationMessage } from '../types/chatbot.js';

export async function answerUserQuery(
  userId: string,
  query: string,
  history: ConversationMessage[]
): Promise<string> {
  const retrievedChunks = await findSimilarChunks(query);

  const context =
    retrievedChunks.length > 0
      ? retrievedChunks
          .map((chunk, index) => {
            const title = chunk.metadata.title ? `【${chunk.metadata.title}】\n` : '';
            return `[知识片段 ${index + 1}]\n${title}${chunk.content}`;
          })
          .join('\n\n')
      : '';

  logger.debug('RAG context prepared', {
    query,
    hasContext: retrievedChunks.length > 0,
    chunkCount: retrievedChunks.length,
    chunks: retrievedChunks.map((chunk) => ({
      vectorId: chunk.id,
      chunkIndex: chunk.metadata.chunkIndex,
      chunkTitle: chunk.metadata.title,
      articleId: chunk.metadata.articleId,
      score: chunk.score,
    })),
  });

  const messages = await buildMessage(query, context, history);

  logger.debug('LLM messages prepared', { messages: JSON.stringify(messages) });

  const startTime = Date.now();

  const response = await openaiClient.invoke(messages);

  const latency = Date.now() - startTime;

  logger.info('LLM response', {
    latency,
    query,
    response: response.content,
  });

  const output = response.content;

  // contextIds: filter chunk.metadata.articleId remove duplicated value
  const contextIds = retrievedChunks
    .map((chunk) => chunk.metadata.articleId as string)
    .filter((value, index, self) => self.indexOf(value) === index);

  const conversation: ChatConversation = {
    userId: userId,
    question: query,
    answer: output as string,
    contextIds: contextIds,
    chunks: retrievedChunks.map((chunk) => ({
      chunkIndex: chunk.metadata.chunkIndex as number,
      chunkTitle: chunk.metadata.title as string,
      vectorId: chunk.id as string,
      score: chunk.score,
    })) as ChatConversationChunk[],
    latency: latency,
    createAt: new Date(),
    updateAt: new Date(),
  };

  logger.debug('Chat conversation prepared', {
    conversation,
  });

  const result = await insertChatConversation(conversation);

  logger.debug('Chat conversation inserted', {
    conversationId: result.id,
    latency: latency,
  });

  if (typeof output === 'string') {
    return output.trim();
  }

  if (Array.isArray(output)) {
    return output
      .map((block) => {
        if (typeof block === 'string') {
          return block;
        }
        if (
          block &&
          typeof block === 'object' &&
          'text' in block &&
          typeof block.text === 'string'
        ) {
          return block.text;
        }
        return '';
      })
      .join('')
      .trim();
  }

  return '';
}

async function buildMessage(query: string, context: string, history: ConversationMessage[]) {
  const enhancedContext = context || '当前知识库中没有检索到相关内容。';

  // const systemPrompt = new SystemMessage(
  //   '你是Taklip的AI助手，请用简洁、专业的中文回答用户的问题。不要输出任何其他内容，只输出回答。请遵循以下规则: 1. 基于上下文信息回答，不要编造不知道的内容 2. 如果上下文没有相关信息，请如实告知 3. 回答要专业、准确、友好 4. 适当使用表情符号让回答更生动 5. 如果用户问的是关于Taklip的内容，请优先使用Taklip的知识库回答，如果知识库没有相关信息，请如实告知',
  // );

  const systemPrompt = new SystemMessage(`# Role: Taklip专业购物顾问

    ## Core Identity
    你是Taklip的专属AI助手，专注于为用户提供专业、准确的商品选购建议。你拥有Taklip知识库的完整访问权限。
    
    ## Knowledge Priority
    1. **优先使用Taklip知识库**：用户问题必须基于上下文信息
    2. **知识边界说明**：如果上下文信息不足，明确告知用户"根据Taklip知识库，目前没有相关信息"
    3. **严禁编造**：绝不虚构商品参数、价格、功能等信息
    
    ## Response Style
    ### 语言要求
    - 使用**专业且友好**的中文
    - 保持**简洁明了**，避免冗长
    - 适当使用表情符号增强亲和力 😊
    
    ### 结构化输出
    - 复杂信息使用分段和项目符号
    - 对比类问题使用表格思维
    - 推荐类问题说明理由
    
    ## Context Handling
    你会收到：
    1. **相关上下文**：从Taklip知识库检索的专业内容
    2. **对话历史**：当前会话的完整记录
    
    请基于这些信息提供最准确的回答。`);

  // const conversationMessages = history.map((m) => ({
  //   role: m.role,
  //   content: m.content,
  // }));

  const conversationMessages =
    history.length > 0 ? formatConversationHistory(history) : '📝 这是本次对话的第一个问题';

  const userMessage = {
    role: 'user' as const,
    content: `## 知识库信息
    ${enhancedContext}

    ## 对话历史
    ${conversationMessages}

    ## 当前问题
    ${query}

    ## 回答要求
    请基于Taklip知识库信息，结合对话上下文，专业地回答用户问题。`,
  };

  return [systemPrompt, ...formatHistoryToMessages(history), userMessage];
  // return [systemPrompt, userMessage];
}

function formatConversationHistory(history: ConversationMessage[]): string {
  return history
    .map((msg) => `${msg.role === 'user' ? '👤 用户' : '🤖 助手'}: ${msg.message}`)
    .join('\n');
}

function formatHistoryToMessages(history: ConversationMessage[]): any[] {
  return history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.message,
  }));
}
