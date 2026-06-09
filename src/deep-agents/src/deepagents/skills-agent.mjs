import 'dotenv/config'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { model } from '@/shared/model.mjs'
import { createAgent, HumanMessage } from 'langchain'
import {
  LocalShellBackend,
  createFilesystemMiddleware,
  createSkillsMiddleware,
} from 'deepagents'

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

// 清除旧输出文件，确保 write_file 可以写入
if (existsSync(output)) rmSync(output)
mkdirSync(dirname(output), { recursive: true })

const backend = await LocalShellBackend.create({
  rootDir: projectRoot,
  virtualMode: false,
  inheritEnv: true,
})

const agent = createAgent({
  model,
  tools: [],
  systemPrompt: `你是 Excalidraw 图表生成助手。中文回答。
禁止读取任何文件或探索目录，直接按以下规范生成 .excalidraw JSON 并用 write_file 写入。

## 输出格式
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [ ... 所有元素 ... ],
  "appState": { "viewBackgroundColor": "#ffffff", "gridSize": 20 },
  "files": {}
}

## 三种元素模板

### 矩形节点（type: rectangle）
必需属性：id, type, x, y, width(≥200), height(≥80), angle:0, strokeColor, backgroundColor, fillStyle:"solid", strokeWidth:2, strokeStyle:"solid", roughness:1, opacity:100, groupIds:[], frameId:null, index, roundness:{"type":3}, seed(随机数), version:1, versionNonce(随机数), isDeleted:false, boundElements:null, updated:1706659200000, link:null, locked:false
文字属性（⚠️ 必须有实际中文内容，严禁留空）：text, fontSize:20, fontFamily:5, textAlign:"center", verticalAlign:"middle"
示例 text 值："①用户输入\\n构建 HumanMessage\\n传入 agent.streamEvents"

### 箭头（type: arrow）
必需属性：同上基础属性 + points:[[0,0],[宽度,0]], startBinding:null, endBinding:null, lastCommittedPoint:null, startArrowhead:null, endArrowhead:"arrow"
箭头标签（⚠️ 必须填写）：label:"invoke", labelFontSize:14, labelFontFamily:5

### 独立文本（type: text）
必需属性：同上基础属性 + text(必须非空), fontSize, fontFamily:5, textAlign:"center", verticalAlign:"top", containerId:null, originalText(与text相同), autoResize:true, lineHeight:1.25

## ⚠️ 关键规则（违反将导致图表空白）
1. **text 字段必须包含实际中文文字**，这是最重要的规则！空 text 会导致节点显示为空白框
2. **label 字段必须包含实际文字**，空 label 会导致箭头没有标注
3. 每个节点的 text 应包含：编号（①②③…）+ 名称 + 1-2 行功能说明，用 \\n 换行
4. 颜色规范：主节点 #a5d8ff（蓝）、关键节点 #b2f2bb（绿）、警告 #ffc9c9（红）、高亮 #ffd43b（黄）
5. 布局：节点水平间隔 280px，垂直间隔 120px
6. seed 和 versionNonce 每个元素用不同随机数
7. 直接用 write_file 一次性写入完整 JSON`,
  middleware: [
    createSkillsMiddleware({ backend, sources: [skills] }),
    createFilesystemMiddleware({ backend }),
  ],
})

const relativeOutput = output.replace(projectRoot + '/', '')

const prompt = [
  '画一张流程图，描述本项目的 skills-agent 工作流：',
  '用户 Prompt → createAgent → createSkillsMiddleware → createFilesystemMiddleware → 模型回复。',
  `保存为 ${relativeOutput}。要求：`,
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

let currentToolName = ''

try {
  for await (const event of stream) {
    if (event.event === 'on_chat_model_stream') {
      const chunk = event.data?.chunk
      // 流式文本输出
      const text = chunkText(event)
      if (text) process.stdout.write(text)
      // 流式 tool_call 参数输出（能看到 JSON 逐字生成）
      if (chunk?.tool_call_chunks?.length > 0) {
        const args = chunk.tool_call_chunks[0].args
        if (args) process.stdout.write(args)
      }
    }
    if (event.event === 'on_tool_start') {
      currentToolName = event.name?.split('/').pop() ?? event.name
      process.stdout.write(`\n\n⚙️  [${currentToolName}] 执行中...\n`)
    }
    if (event.event === 'on_tool_end') {
      const output = event.data?.output
      const content =
        typeof output === 'string'
          ? output
          : typeof output?.content === 'string'
            ? output.content
            : JSON.stringify(output ?? '')
      const preview = content.length > 150 ? content.slice(0, 150) + '...' : content
      process.stdout.write(`   ✅ ${currentToolName} 完成: ${preview}\n`)
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
