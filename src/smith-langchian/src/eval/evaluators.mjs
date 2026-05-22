/**
 * OpenEvals 内置 RAG 指标
 */
import {
  createLLMAsJudge,
  RAG_GROUNDEDNESS_PROMPT,
  RAG_HELPFULNESS_PROMPT,
  RAG_RETRIEVAL_RELEVANCE_PROMPT,
} from "openevals";
import { model } from "@/shared/model.mjs";

const judge = model;

// 通义千问要求使用 json response_format 时，messages 中必须包含 "json" 关键词
const SYSTEM_HINT = "You are a strict evaluator. Respond in json format.";

// RAG_GROUNDEDNESS_PROMPT —— 忠实度：答案是否被检索上下文支撑，有无幻觉
const ragGroundednessJudge = createLLMAsJudge({
  prompt: RAG_GROUNDEDNESS_PROMPT,
  system: SYSTEM_HINT,
  feedbackKey: "rag_groundedness",
  judge,
  continuous: true,
});

// RAG_HELPFULNESS_PROMPT —— 回答有用性：是否切题、是否答非所问
const ragHelpfulnessJudge = createLLMAsJudge({
  prompt: RAG_HELPFULNESS_PROMPT,
  system: SYSTEM_HINT,
  feedbackKey: "rag_helpfulness",
  judge,
  continuous: true,
});

// RAG_RETRIEVAL_RELEVANCE_PROMPT —— 检索相关性：召回片段与问题是否相关
const ragRetrievalRelevanceJudge = createLLMAsJudge({
  prompt: RAG_RETRIEVAL_RELEVANCE_PROMPT,
  system: SYSTEM_HINT,
  feedbackKey: "rag_retrieval_relevance",
  judge,
  continuous: true,
});

/** 确保评估结果的 comment 字段是合法字符串（修复 LangSmith 422 错误） */
function sanitizeResult(result) {
  if (Array.isArray(result)) {
    return result.map(sanitizeResult);
  }
  if (result && typeof result === "object") {
    return {
      ...result,
      comment: typeof result.comment === "string" ? result.comment : (result.comment != null ? String(result.comment) : ""),
    };
  }
  return result;
}

export async function ragGroundednessEvaluator({ outputs }) {
  const result = await ragGroundednessJudge({
    context: { documents: outputs.context },
    outputs: { answer: outputs.answer },
  });
  return sanitizeResult(result);
}

export async function ragHelpfulnessEvaluator({ inputs, outputs }) {
  const result = await ragHelpfulnessJudge({ inputs, outputs: { answer: outputs.answer } });
  return sanitizeResult(result);
}

export async function ragRetrievalRelevanceEvaluator({ inputs, outputs }) {
  const result = await ragRetrievalRelevanceJudge({
    inputs,
    context: { documents: outputs.context },
  });
  return sanitizeResult(result);
}

export const ragEvaluators = [
  ragGroundednessEvaluator,
  ragHelpfulnessEvaluator,
  ragRetrievalRelevanceEvaluator,
];
