import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Milvus } from "@langchain/community/vectorstores/milvus";
import { model, embeddings } from "@/shared/model.mjs";

// Milvus 向量存储配置
const MILVUS_ADDRESS = process.env.MILVUS_ADDRESS ?? "localhost:19530";
const vectorStore = await Milvus.fromExistingCollection(embeddings, {
  collectionName: process.env.MILVUS_COLLECTION ?? "rag_docs",
  clientConfig: {
    address: MILVUS_ADDRESS,
    timeout: 60000,
  },
});

// 检索器配置（增加超时时间）
const retriever = vectorStore.asRetriever({ 
  k: 4,
  filter: undefined,
  callbacks: [{
    handleRetrieverEnd: () => console.log("检索完成"),
  }],
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "你是客服助手。仅根据下面「上下文」回答；上下文没有的信息请明确说不知道，不要编造。\n\n上下文：\n{context}",
  ],
  ["human", "{question}"],
]);

const chain = RunnableSequence.from([prompt, model, new StringOutputParser()]);

const GraphState = Annotation.Root({
  question: Annotation,
  context: Annotation,
  answer: Annotation,
});

async function retrieve(state) {
  try {
    console.log(`正在检索: ${state.question}`);
    const docs = await retriever.invoke(state.question);
    console.log(`检索到 ${docs.length} 条结果`);
    return { context: docs };
  } catch (error) {
    console.error("检索失败:", error.message);
    return { context: [] };
  }
}

async function generate(state) {
  try {
    const contextText = state.context?.map((d) => d.pageContent).join("\n\n") ?? "";
    const answer = await chain.invoke({
      context: contextText,
      question: state.question,
    });
    return { answer };
  } catch (error) {
    console.error("生成失败:", error.message);
    return { answer: "抱歉，处理您的问题时遇到了错误，请稍后重试。" };
  }
}

const workflow = new StateGraph(GraphState)
  .addNode("retrieve", retrieve)
  .addNode("generate", generate)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", END);

export const ragApp = workflow.compile();

export async function ask(question) {
  const result = await ragApp.invoke({ question });
  return {
    answer: result.answer,
    context: result.context ?? [],
  };
}
