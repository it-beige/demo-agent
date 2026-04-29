# 第 17 章：Nest + 腾讯云 TTS/ASR 实现实时语音助手

> NestJS 集成 LangChain + 腾讯云语音服务，实现完整的实时语音交互系统。核心问题：**如何将流式 AI 对话与实时语音合成/识别结合，构建端到端的语音助手体验。**

---

## 📖 章节简介

- **文件**：`src/tts-stt-nest/` 目录下的完整 NestJS 项目
- **内容**：NestJS 集成 LangChain + 腾讯云 TTS/ASR SDK，实现实时语音交互系统
  - **语音识别（ASR）**：上传音频文件 → 腾讯云 ASR SDK → 返回识别文本
  - **流式 AI 对话**：SSE 逐字输出 + 事件总线触发 TTS 合成
  - **流式语音合成（TTS）**：WebSocket 中继 + MediaSource API 边合成边播放
  - **会话管理**：断线重连支持、pending chunks 缓冲机制、ready 状态机
  - **事件驱动架构**：AI 模块与 TTS 模块通过 EventEmitter2 解耦
  - **WebSocket 网关**：原生 ws 库适配器、薄封装模式（Gateway 委托给 Service）
- **重点**：双 WebSocket 中继（客户端 ↔ NestJS ↔ 腾讯云）、流式音频播放（MediaSource）、会话状态机设计、事件驱动解耦
- **核心问题**：如何将流式 AI 对话与实时语音合成/识别结合，构建端到端的语音助手体验

---

## 📁 涉及文件

### 核心文件（5 个文件）

- `src/tts-stt-nest/src/speech/tts-relay.service.ts`：TTS 中继服务（会话管理 + 腾讯云 WebSocket 转发 + 缓冲机制）
- `src/tts-stt-nest/src/gateways/tts.gateway.ts`：WebSocket 网关（`/tts` 端点 + 连接生命周期 + 薄封装）
- `src/tts-stt-nest/src/ai/ai.service.ts`：AI 流式服务（LangChain Chain + 事件发布 + AsyncGenerator）
- `src/tts-stt-nest/src/ai/ai.controller.ts`：SSE 控制器（`@Sse()` 装饰器 + Observable 转换）
- `src/tts-stt-nest/src/speech/speech.service.ts`：ASR 语音识别服务（腾讯云 ASR SDK + 文件上传）

### 配置与工具（4 个文件）

- `src/tts-stt-nest/src/speech/tts-config.builder.ts`：腾讯云 TTS 配置构建器（HMAC-SHA1 签名 + WebSocket URL 构建）
- `src/tts-stt-nest/src/speech/speech.module.ts`：语音模块（腾讯云 SDK 工厂提供者 + Relay 服务注入）
- `src/tts-stt-nest/src/gateways/ws-adapter.ts`：原生 ws 库适配器（替代 Socket.IO）
- `src/tts-stt-nest/src/common/stream-events.ts`：事件类型定义（AiTtsStreamEvent 联合类型）

### 前端页面（1 个文件）

- `src/tts-stt-nest/public/index.html`：单页语音助手前端（录音 + ASR + SSE 流式显示 + MediaSource 流式播放）

---

## 🚀 如何运行

> ⚠️ **前置条件**：需要先在根目录 `.env` 或项目 `.env` 中配置以下变量：
>
> ```env
> # OpenAI 兼容 API（用于 AI 对话）
> API_KEY=your_openai_api_key
> MODEL=gpt-4
> BASE_URL=https://api.openai.com/v1
>
> # 腾讯云 TTS/ASR（语音服务）
> TENCENT_SECRET_ID=your_secret_id
> TENCENT_SECRET_KEY=your_secret_key
> ```

### 1️⃣ 安装依赖

```bash
cd src/tts-stt-nest
pnpm install
```

---

### 2️⃣ 启动开发服务器

```bash
pnpm start:dev
```

这个示例会：

- 启动 NestJS 服务（默认监听 3000 端口，占用时自动切换）
- 注册 AI 流式端点 `POST /ai/chat/stream`（SSE 协议）
- 注册 ASR 识别端点 `POST /speech/asr/file`（文件上传）
- 注册 TTS WebSocket 端点 `/tts`（实时音频流）
- 托管前端测试页面到 `/index.html`

---

### 3️⃣ 打开语音助手页面

浏览器访问 `http://localhost:3000/index.html`，页面提供：

- 🎤 **录音按钮**：按住录音，松开后自动发送 ASR 识别
- 📝 **文字输入框**：也可直接输入文字提问
- 💬 **对话流显示**：SSE 逐字显示 AI 回答（打字机效果）
- 🔊 **语音播报**：MediaSource 流式播放 TTS 音频（边合成边播放）
- 🔄 **断线重连**：网络断开后自动复用 sessionId 恢复连接

---

### 4️⃣ 测试 AI 流式接口

```bash
curl -X POST http://localhost:3000/ai/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"query": "你好，请介绍一下自己"}'
```

**响应格式**（SSE 流式）：

```
data: 你

data: 好，

data: 我是

data: AI

data: 助手。

data: [DONE]
```

---

### 5️⃣ 测试 ASR 语音识别

```bash
curl -X POST http://localhost:3000/speech/asr/file \
  -F "file=@recording.wav"
```

**响应格式**：

```json
{
  "text": "今天天气怎么样"
}
```

---

### 6️⃣ 测试 TTS WebSocket 连接

使用 wscat 或浏览器开发者工具：

```bash
wscat -c ws://localhost:3000/tts
```

连接后，等待 AI 流式输出触发 TTS 事件，会自动收到 Base64 MP3 音频帧（ArrayBuffer 格式）。

**断线重连**（复用 sessionId）：

```bash
wscat -c ws://localhost:3000/tts?sessionId=previous-session-id
```

---

## 🗺️ 推荐学习顺序

详见 [推荐学习顺序 - Nest + TTS/ASR 语音助手学习路径](./../learning-path.md#-nest-ttsasr-语音助手学习路径)。

---

## ✏️ 动手练习

详见 [建议动手练习 - Nest + TTS/ASR 语音助手练习](./../exercises.md#-nest-ttsasr-语音助手练习)。

---

## 🧭 章节导航

| ⬅️ 上一章                                                 | 🏠 返回                                 | ➡️ 下一章                                                                              |
| --------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| [第 16 章 AGUI 协议：流式组件渲染](./16-agui-protocol.md) | [章节目录](./../../README.md#-章节目录) | [第 18 章 图形编排引擎：LangGraph 和多 Agent 架构](./18-langgraph-multi-agent.md) |
