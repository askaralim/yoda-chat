import express from "express";

import { config } from "../config/env.js";
import { buildKnowledgeBase } from "../services/vectorService.js";
import { getAllContents, getAllBrands } from "../services/dataServices.js";

export const adminRouter = express.Router();

adminRouter.use((req, res, next) => {
  if (!config.admin.apiKey) {
    return res.status(503).json({ message: "Admin API key not configured" });
  }

  const headerKey = req.header("x-api-key");
  const queryKey = typeof req.query.apiKey === "string" ? req.query.apiKey : undefined;

  if (headerKey === config.admin.apiKey || queryKey === config.admin.apiKey) {
    return next();
  }

  return res.status(401).json({ message: "Unauthorized" });
});

adminRouter.post("/reindex", async (req, res, next) => {
  try {
    const rawTypes = req.body?.types;
    const normalizedTypes = Array.isArray(rawTypes)
      ? rawTypes
      : typeof rawTypes === "string"
        ? rawTypes.split(",").map((value: string) => value.trim()).filter(Boolean)
        : undefined;

    const allowContent = !normalizedTypes || normalizedTypes.includes("content");
    const allowBrand = !normalizedTypes || normalizedTypes.includes("brand");

    const items = [];

    if (allowContent) {
      const contents = await getAllContents();
      items.push(
        ...contents.map((content) => ({
          ...content,
          type: "content",
        })),
      );
    }

    if (allowBrand) {
      const brands = await getAllBrands();
      items.push(
        ...brands.map((brand) => ({
          ...brand,
          title: brand.name,
          type: "brand",
        })),
      );
    }

    if (items.length === 0) {
      return res.status(400).json({ message: "No items selected for ingestion" });
    }

    await buildKnowledgeBase(items);

    return res.status(202).json({
      message: "Ingestion triggered",
      totalItems: items.length,
      types: Array.from(new Set(items.map((item) => item.type))).sort(),
      normalizedTypes,
    });
  } catch (error) {
    return next(error);
  }
});

