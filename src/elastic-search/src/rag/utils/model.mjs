import { loadEnvFromNearest } from "./config.util.mjs";
import { ChatOpenAI } from "@langchain/openai";
import DashScopeEmbeddings from "@/embeddings/dashscope-embeddings.mjs";
import { DashScopeRerank } from "../../rerank/dashscope-rerank.mjs";

// 加载环境变量（从调用方所在目录向上查找 .env 文件）
export const envFilePath = loadEnvFromNearest(import.meta.url);
console.log(`加载环境变量文件：${envFilePath}`);

export const model = new ChatOpenAI({
  model: process.env.MODEL,
  apiKey: process.env.API_KEY,
  temperature: 0.2,
  configuration: {
    baseURL: process.env.BASE_URL,
  },
});

// 使用阿里云原生 API 实现 Embedding（替代 OpenAIEmbeddings）
export const embeddings = new DashScopeEmbeddings({
  apiKey: process.env.EMBEDDING_API_KEY,
  model: process.env.EMBEDDING_MODEL,
  dimensions: parseInt(process.env.EMBEDDING_DIM) || 1536,
});

export const reranker = new DashScopeRerank();
