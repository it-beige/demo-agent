"""
Mem0 本地 REST API Server

为 mem0-local-api-demo.mjs 提供 REST API：
  POST   /memories          — 添加记忆
  GET    /memories           — 列出全部记忆
  POST   /search             — 搜索记忆
  DELETE /memories           — 删除全部记忆

启动：python server.py  (默认 8888 端口)
"""
import os
import sys
from dotenv import load_dotenv

# 向上查找 .env 文件并加载
def find_and_load_env():
    current = os.path.dirname(os.path.abspath(__file__))
    while current != os.path.dirname(current):
        env_path = os.path.join(current, ".env")
        if os.path.exists(env_path):
            load_dotenv(env_path)
            print(f"已加载环境变量: {env_path}")
            return
        current = os.path.dirname(current)

find_and_load_env()

API_KEY = os.environ.get("API_KEY", "")
BASE_URL = os.environ.get("BASE_URL", "")
MODEL = os.environ.get("MODEL", "qwen-plus")
EMBEDDING_API_KEY = os.environ.get("EMBEDDING_API_KEY", API_KEY)
EMBEDDING_BASE_URL = os.environ.get("EMBEDDING_BASE_URL", BASE_URL)
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "text-embedding-v3")
EMBEDDING_DIM = int(os.environ.get("EMBEDDING_DIM", "1024"))

from mem0 import Memory

config = {
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "embedding_model_dims": EMBEDDING_DIM,
        },
    },
    "llm": {
        "provider": "openai",
        "config": {
            "model": MODEL,
            "api_key": API_KEY,
            "openai_base_url": BASE_URL,
        },
    },
    "embedder": {
        "provider": "openai",
        "config": {
            "model": EMBEDDING_MODEL,
            "api_key": EMBEDDING_API_KEY,
            "openai_base_url": EMBEDDING_BASE_URL,
            "embedding_dims": EMBEDDING_DIM,
        },
    },
}

m = Memory.from_config(config)

from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI(title="Mem0 Local API")


@app.post("/memories")
async def add_memories(request: Request):
    body = await request.json()
    messages = body.get("messages", [])
    user_id = body.get("user_id")
    run_id = body.get("run_id")
    agent_id = body.get("agent_id")
    metadata = body.get("metadata")

    result = m.add(
        messages,
        user_id=user_id,
        run_id=run_id,
        agent_id=agent_id,
        metadata=metadata,
    )
    return JSONResponse(content=result)


@app.get("/memories")
async def get_memories(
    user_id: str = Query(None),
    run_id: str = Query(None),
    agent_id: str = Query(None),
):
    filters = {}
    if user_id:
        filters["user_id"] = user_id
    if run_id:
        filters["run_id"] = run_id
    if agent_id:
        filters["agent_id"] = agent_id
    result = m.get_all(filters=filters if filters else None)
    return JSONResponse(content=result)


@app.post("/search")
async def search_memories(request: Request):
    body = await request.json()
    query = body.get("query", "")
    filters = body.get("filters", {})
    top_k = body.get("top_k", 5)
    threshold = body.get("threshold")

    result = m.search(
        query,
        filters=filters if isinstance(filters, dict) and filters else None,
        top_k=top_k,
        threshold=threshold if threshold is not None else 0.1,
    )
    if isinstance(result, list):
        return JSONResponse(content={"results": result})
    return JSONResponse(content=result)


@app.delete("/memories")
async def delete_memories(
    user_id: str = Query(None),
    run_id: str = Query(None),
    agent_id: str = Query(None),
):
    result = m.delete_all(user_id=user_id, run_id=run_id, agent_id=agent_id)
    return JSONResponse(content=result)


if __name__ == "__main__":
    port = int(os.environ.get("MEM0_LOCAL_PORT", "8888"))
    print(f"Mem0 Local API Server 启动于 http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
