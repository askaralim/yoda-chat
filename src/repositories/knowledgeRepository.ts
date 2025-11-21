// Knowledge repository - handles all database operations for content and brand knowledge

import { FieldPacket } from 'mysql2';
import { db } from '../config/db.js';
import { Content, Brand } from '../domain/types/dbContent.js';
import { CustomError } from '../middleware/errorHandler.js';

export class KnowledgeRepository {
  /**
   * Get all contents (articles) from the database
   * @returns Array of content items
   * @throws CustomError if no contents found
   */
  async getAllContents(): Promise<Content[]> {
    const [contents] = (await db.query(
      'SELECT id, title, description FROM content where deleted = 0'
    )) as [Content[], FieldPacket[]];
    if (!contents || contents.length === 0) {
      throw new CustomError('No contents found', 404);
    }
    return contents;
  }

  /**
   * Get a single content by ID
   * @param id - Content ID
   * @returns Content item if found
   * @throws CustomError if not found
   */
  async getContentById(id: string): Promise<Content> {
    const [rows] = (await db.query('SELECT id, title, description FROM content where id = ?', [
      id,
    ])) as [Content[], FieldPacket[]];
    if (!rows || rows.length === 0 || !rows[0]) {
      throw new CustomError('Content not found', 404);
    }
    return rows[0];
  }

  /**
   * Get all brands from the database
   * @returns Array of brand items
   * @throws CustomError if no brands found
   */
  async getAllBrands(): Promise<Brand[]> {
    const [brands] = (await db.query(
      'SELECT id, name, description FROM brand where deleted = 0'
    )) as [Brand[], FieldPacket[]];
    if (!brands || brands.length === 0) {
      throw new CustomError('No brands found', 404);
    }
    return brands;
  }

  /**
   * Get a single brand by ID
   * @param id - Brand ID
   * @returns Brand item if found
   * @throws CustomError if not found
   */
  async getBrandById(id: string): Promise<Brand> {
    const [brand] = (await db.query('SELECT id, name, description FROM brand where id = ?', [
      id,
    ])) as [Brand[], FieldPacket[]];
    if (!brand || brand.length === 0 || !brand[0]) {
      throw new CustomError('Brand not found', 404);
    }
    return brand[0];
  }

  /**
   * Get all articles (contents and brands combined)
   * @returns Combined array of content and brand items
   */
  async getAllArticles(): Promise<Array<Content | Brand>> {
    const [contents] = await db.query(
      'SELECT id, title, description FROM content where deleted = 0'
    );
    const [brands] = await db.query(
      'SELECT id, name AS title, description, company FROM brand where deleted = 0'
    );
    return [...(contents as Content[]), ...(brands as Brand[])];
  }
}

export const knowledgeRepository = new KnowledgeRepository();
