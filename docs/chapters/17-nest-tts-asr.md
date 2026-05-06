# [语音·TTS/ASR] 腾讯云实时语音助手

> 端到端语音交互系统：录音 → ASR 转文字 → 流式 AI 对话 → TTS 合成语音 → 浏览器边合成边播放。
> **关键词**：ASR、TTS、腾讯云、WebSocket 中继、MediaSource、事件驱动

## 核心设计

这个 demo 的架构复杂度在"双 WebSocket 中继"：

- **ASR**：前端录音 → 上传音频 → 腾讯云 ASR SDK 识别 → 返回文本
- **AI 流式**：SSE 逐字输出 + EventEmitter2 发布 `start/chunk/end` 事件
- **TTS 中继**：NestJS 作为中继层，维护客户端 WebSocket（`/tts` 端点）和腾讯云 TTS WebSocket，将 AI 流式输出的文本片段实时转发给腾讯云合成，再回传 MP3 帧给前端
- **MediaSource**：前端收到音频帧后通过 `SourceBuffer` 追加到 `MediaSource`，实现边合成边播放，延迟远低于"全部合成完再播"

会话管理亮点：断线重连时复用 `sessionId`，`pendingChunks` 缓冲机制在重连后补发未消费的音频帧。`tts.gateway.ts` 采用薄封装模式——Gateway 只做连接管理，业务逻辑委托给 `tts-relay.service.ts`。

## 运行方式

需配置 `.env`：`API_KEY`/`MODEL`/`BASE_URL`（AI 对话）+ `TENCENT_SECRET_ID`/`TENCENT_SECRET_KEY`（腾讯云）。

```bash
cd src/tts-stt-nest
pnpm install
pnpm start:dev
```

浏览器打开 `http://localhost:3000/index.html`，按住录音按钮说话，松开后自动识别→AI 回复→语音播报。

各端点也可单独测试：

```bash
# SSE 流式 AI
curl -X POST http://localhost:3000/ai/chat/stream -H "Content-Type: application/json" -d '{"query":"你好"}'

# ASR 识别
curl -X POST http://localhost:3000/speech/asr/file -F "file=@recording.wav"

# WebSocket TTS
wscat -c ws://localhost:3000/tts
```

## 扩展方向

- 实现流式 ASR（WebSocket 实时识别），替代文件上传模式
- 给 TTS 中继增加会话超时自动清理机制
- 将 EventEmitter2 替换为 Redis Pub/Sub，支持多实例部署

---
⬅️ [AGUI 流式组件](./16-agui-protocol.md) ｜ [📚 目录](../../README.md#目录) ｜ [LangGraph 多 Agent ➡️](./18-langgraph-multi-agent.md)