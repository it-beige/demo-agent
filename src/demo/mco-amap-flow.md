# mco-amap Agent + MCP 工具调用流程图

对应文件：

- `src/mco-amap.mjs`
- `src/tool-runner.mjs`

## Flowchart

```mermaid
flowchart TD
    A[用户输入问题] --> B[runAmapAgent query]
    B --> C[createAmapClient]
    C --> D[创建 MultiServerMCPClient]
    D --> E[mcpClient.getTools]
    E --> F[组装 messages<br/>SystemMessage + HumanMessage]
    F --> G[runToolAgent]
    G --> H[model.bindTools tools]
    H --> I[model.invoke messages]

    I --> J{有 tool_calls 吗}
    J -- 否 --> K[返回最终 response]
    J -- 是 --> L[遍历 tool_calls]
    L --> M[找到对应 tool]
    M --> N[tool.invoke args]
    N --> O[MCP 工具执行<br/>例如 maps_text_search]
    O --> P[得到工具结果]
    P --> Q[封装成 ToolMessage]
    Q --> R[追加回 messages]
    R --> I

    K --> S[getResponseText]
    S --> T[打印最终中文回答]
    T --> U[mcpClient.close]
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User as 用户
    participant Agent as mco-amap.mjs
    participant Runner as runToolAgent
    participant Model as Chat Model
    participant MCP as Amap MCP Tool

    User->>Agent: 提问
    Agent->>Agent: createAmapClient()
    Agent->>MCP: getTools()
    Agent->>Runner: runToolAgent(model, tools, messages)
    Runner->>Model: invoke(messages)

    alt 模型需要工具
        Model-->>Runner: tool_calls
        Runner->>MCP: invoke(tool args)
        MCP-->>Runner: tool result
        Runner->>Model: ToolMessage + messages
        Model-->>Runner: final response
    else 模型不需要工具
        Model-->>Runner: final response
    end

    Runner-->>Agent: response
    Agent->>Agent: getResponseText(response.content)
    Agent-->>User: 最终中文回答
    Agent->>MCP: close()
```

## 简化记忆

1. 用户提问
2. Agent 连接 MCP 地图工具
3. Agent 把工具交给模型
4. 模型决定是否调用工具
5. 工具结果回填给模型
6. 模型输出最终答案
7. Agent 关闭 MCP 连接
