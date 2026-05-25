import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = resolve(__dirname, '../../../..')
const skills = '.agents/skills/'
const output = resolve(__dirname, '../output/deepagents-skills-flow.excalidraw')

const skillCheckPath = resolve(
  projectRoot,
  '.agents/skills/excalidraw-diagram-generator/SKILL.md',
)
if (!existsSync(skillCheckPath)) {
  throw new Error(
    '未找到 excalidraw-diagram-generator，请先在项目根目录执行:\n  npx skills add github/awesome-copilot --skill excalidraw-diagram-generator -y',
  )
}

mkdirSync(dirname(output), { recursive: true })

const backend = await LocalShellBackend.create({
  rootDir: projectRoot,
  virtualMode: false,
  inheritEnv: true,
})

const agent = createAgent({
  model,
  tools: [],
  systemPrompt:
    '按 skills 库完成任务，需要时 read_file 对应 SKILL.md。中文回答。',
  middleware: [
    createSkillsMiddleware({ backend, sources: [skills] }),
    createFilesystemMiddleware({ backend }),
  ],
})

const prompt = [
  '画一张流程图，描述本项目的 skills-agent 工作流：',
  '用户 Prompt → createAgent → createSkillsMiddleware → createFilesystemMiddleware → 模型回复。',
  `保存为 ${output}。要求：`,
  '- 顶部大标题 + 副标题',
  '- 每个主节点 numbered（①②…）且框内 2～3 行中文说明',
  '- 右侧一列「说明：…」补充细节',
  '- 箭头上标注阶段名（如 invoke、wrapModelCall）',
  '- 底部图例（颜色含义 + 如何运行 demo）',
].join('\n')

console.log('用户:', prompt)

function chunkText(event) {
  const chunk = event.data?.chunk
  if (!chunk) return ''
  // AIMessageChunk.content
  if (chunk.content != null) {
    if (typeof chunk.content === 'string') return chunk.content
    if (Array.isArray(chunk.content)) {
      return chunk.content
        .map(p => (typeof p === 'string' ? p : (p?.text ?? '')))
        .join('')
    }
  }
  // 某些版本把 text 放在 chunk.text 或 event.data.text
  if (typeof chunk.text === 'string') return chunk.text
  if (typeof event.data?.text === 'string') return event.data.text
  return ''
}

const stream = await agent.streamEvents(
  { messages: [new HumanMessage(prompt)] },
  { recursionLimit: 100 },
)

let skillsMetadata
console.log('\n--- 流式输出 ---\n')

try {
  for await (const event of stream) {
    if (event.event === 'on_chat_model_stream') {
      const text = chunkText(event)
      if (text) process.stdout.write(text)
    }
    if (event.event === 'on_tool_start') {
      const name = event.name?.split('/').pop() ?? event.name
      process.stdout.write(`\n\n→ ${name}\n\n`)
    }
    if (event.event === 'on_chain_end' && event.data?.output?.skillsMetadata) {
      skillsMetadata = event.data.output.skillsMetadata
    }
  }
} catch (e) {
  console.error('\n\n[错误]', e.cause?.message ?? e.message)
  throw e
}

console.log('\n')
console.log(
  'skills:',

  skillsMetadata?.map(s => s.name),
)
if (existsSync(output)) {
  console.log('图表:', output)
  console.log('打开: https://excalidraw.com → Open → 选择该文件')
} else {
  console.log('未生成:', output)
}

await backend.close()
