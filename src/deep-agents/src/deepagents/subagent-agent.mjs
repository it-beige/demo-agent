import 'dotenv/config'
import { z } from 'zod'
import { createAgent, HumanMessage, tool } from 'langchain'
import { createSubAgentMiddleware } from 'deepagents'
import { setMaxListeners } from 'node:events'
import { model } from '@/shared/model.mjs'

setMaxListeners(50) // 抑制子 Agent 并发导致的 listener 警告

/** 四则运算 */
const calc = tool(
  ({ a, b, op }) => {
    const ops = {
      add: a + b,
      subtract: a - b,
      multiply: a * b,
      divide: b === 0 ? NaN : a / b,
    }
    const result = ops[op]
    if (Number.isNaN(result)) {
      return JSON.stringify({ error: '除数不能为 0' })
    }
    const symbols = { add: '+', subtract: '-', multiply: '×', divide: '÷' }
    return JSON.stringify({
      expression: `${a} ${symbols[op]} ${b}`,
      result,
    })
  },
  {
    name: 'calc',
    description: '计算两个数的加减乘除',
    schema: z.object({
      a: z.number().describe('左操作数'),
      b: z.number().describe('右操作数'),
      op: z
        .enum(['add', 'subtract', 'multiply', 'divide'])
        .describe('运算类型'),
    }),
  },
)

/** 平均分：总数 ÷ 份数 */
const divideEvenly = tool(
  ({ total, parts }) => {
    if (parts <= 0) {
      return JSON.stringify({ error: '份数须大于 0' })
    }
    const each = total / parts
    const exact = Number.isInteger(each)
    return JSON.stringify({
      total,
      parts,
      each,
      exact,
      note: exact
        ? `每人 ${each}（整除）`
        : `每人 ${each}（不能整除，应用题可说明余数）`,
    })
  },
  {
    name: 'divide_evenly',
    description: '把总数平均分成若干份，求每份多少',
    schema: z.object({
      total: z.number().nonnegative().describe('总数'),
      parts: z.number().int().positive().describe('分成几份'),
    }),
  },
)

/** 按模板生成同类练习题（只改数字） */
const makeSimilarProblem = tool(
  ({ template, seed }) => {
    const n = (seed % 7) + 3
    const problems = {
      divide_then_add: {
        stem: `小红有 ${n * 6} 张贴纸，平均分给 ${n} 个小组，又买了 2 包每包 ${n + 2} 张的。每个小组现在一共有多少张？`,
        hint: '先平均分，再加上后来买的，注意单位是「每个小组」',
      },
      share_candy: {
        stem: `小刚有 ${n * 4} 块糖，要分给 ${n} 位同学，妈妈又买了 3 袋每袋 ${n} 块的。每位同学现在能分到多少块？`,
        hint: '与分糖题类似：先平分，再加上新增',
      },
      group_buy: {
        stem: `班里有 ${n} 个小组，每组先分到 ${n * 5} 支铅笔，老师又补了 2 盒每盒 ${n + 1} 支。每个小组现在有多少支？`,
        hint: '先算每组原有，再加上后来补的',
      },
    }
    const picked = problems[template] ?? problems.share_candy
    return JSON.stringify({ template, ...picked })
  },
  {
    name: 'make_similar_problem',
    description:
      '生成一道同类应用题。template: divide_then_add | share_candy | group_buy',
    schema: z.object({
      template: z
        .enum(['divide_then_add', 'share_candy', 'group_buy'])
        .describe('题目模板'),
      seed: z.number().int().describe('随机种子，用于变换数字'),
    }),
  },
)

const subagents = [
  {
    name: 'math-solver',
    description:
      '解小学应用题：用 calc、divide_evenly 列式计算，给出最终答案与算式。有具体数字时先用此 Agent。',
    systemPrompt: [
      '你是解题子 Agent。',
      '必须用 calc、divide_evenly 完成计算，不要心算。',
      '输出：题目理解、分步算式、最终答案（带单位「块/人」等）。',
    ].join('\n'),
    tools: [calc, divideEvenly],
  },
  {
    name: 'kid-tutor',
    description:
      '把 math-solver 的解法讲给家长听，方便辅导孩子。description 里会有完整解题过程。',
    systemPrompt: [
      '你是辅导讲解子 Agent，面向小学生家长。',
      '根据 description 中的解题过程，用短句、比喻或分步提问方式讲解（不要堆公式）。',
      '说明：先想什么、再算什么、怎么检查答案。不使用工具。',
    ].join('\n'),
    tools: [],
  },
  {
    name: 'practice-maker',
    description:
      '出不低于 10 道同类练习题。用 make_similar_problem 生成题干，轮换不同 template 和 seed 保证题目多样性。',
    systemPrompt: [
      '你是出题子 Agent。',
      '调用 make_similar_problem 至少 10 次，每次使用不同 template 或不同 seed，确保题目多样化。',
      '每道题给出：编号、题干、解题提示（一句话）。',
      '按难度从易到难排列。',
    ].join('\n'),
    tools: [makeSimilarProblem],
  },
  {
    name: 'scoring-expert',
    description:
      '资深评分专家，对 math-solver 的解题过程和 practice-maker 出的练习题答案进行评分。description 里会包含完整解题过程和练习题列表。',
    systemPrompt: [
      '你是一位资深小学数学评分专家，拥有 20 年教学经验。',
      '根据 description 中的解题过程和练习题，进行专业评分。',
      '评分维度：',
      '  1. 解题正确性（满分 40 分）：答案是否正确、算式是否完整',
      '  2. 过程规范性（满分 30 分）：步骤是否清晰、单位是否标注',
      '  3. 表达清晰度（满分 20 分）：讲解是否易于理解',
      '  4. 拓展价值（满分 10 分）：是否有检验步骤、是否有多种解法思路',
      '输出格式：',
      '  - 总分：XX/100',
      '  - 各维度得分及简评',
      '  - 亮点（1-2 条）',
      '  - 改进建议（1-2 条）',
      '语气：专业但亲和，鼓励为主。不使用工具。',
    ].join('\n'),
    tools: [],
  },
]

const agent = createAgent({
  model,
  tools: [],
  systemPrompt: [
    '你是小学数学辅导主 Agent，通过 task 委派子 Agent，自己不解题、不讲题、不出题、不评分。',
    '【重要】你必须严格按照顺序执行，每次只调用一个 task，等它返回结果后再调用下一个：',
    '  第1步：调用 math-solver 解题',
    '  第2步：拿到 solver 的完整解题过程后，调用 kid-tutor（把 solver 过程写进 description）',
    '  第3步：调用 practice-maker 出题',
    '  第4步：拿到练习题列表后，调用 scoring-expert（把解题过程和练习题列表写进 description）',
    '每次只调用一个 task 工具，绝不批量调用。',
    '最后向家长汇总：答案、辅导要点、10 道练习题、专家评分。中文。',
  ].join('\n'),
  middleware: [
    createSubAgentMiddleware({
      defaultModel: model,
      subagents,
      generalPurposeAgent: false,
    }),
  ],
})

const prompt = [
  '孩子遇到这道题：',
  '「小明有 24 块糖，平均分给 6 个同学；',
  '妈妈又买了 3 包糖，每包 5 块。每个同学现在一共有多少块？」',
  '请先 math-solver 解题，再 kid-tutor 教家长怎么讲，',
  '然后 practice-maker 出不低于 10 道类似练习题，',
  '最后请 scoring-expert 对解题过程和练习题进行专业评分，并汇总给我。',
].join('')

function chunkText(chunk) {
  if (!chunk?.content) return ''
  if (typeof chunk.content === 'string') return chunk.content
  if (Array.isArray(chunk.content)) {
    return chunk.content
      .map(p => (typeof p === 'string' ? p : (p?.text ?? '')))
      .join('')
  }
  return ''
}

/* ── ANSI 颜色 ── */
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[97m',
  gray: '\x1b[90m',
  bgCyan: '\x1b[46m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
}

const LINE = '─'.repeat(64)
const DLINE = '═'.repeat(64)

/** 子 Agent 显示配置 */
const AGENT_UI = {
  'math-solver': { icon: '🧮', label: '解题专家', color: C.cyan },
  'kid-tutor': { icon: '📖', label: '辅导讲解', color: C.yellow },
  'practice-maker': { icon: '📝', label: '出题专家', color: C.green },
  'scoring-expert': { icon: '⭐', label: '评分专家', color: C.magenta },
}

/** 工具图标映射 */
const TOOL_ICON = {
  task: '🔗',
  calc: '🔢',
  divide_evenly: '➗',
  make_similar_problem: '📋',
}

/* ── 启动画面 ── */
console.log()
console.log(C.bold + C.bgCyan + C.white + ' 🎓 小学应用题辅导系统 ' + C.reset)
console.log(C.dim + LINE + C.reset)
console.log()

console.log(C.bold + C.blue + '📋 子 Agent 流水线' + C.reset)
const agents = Object.entries(AGENT_UI)
agents.forEach(([name, cfg], i) => {
  const arrow = i < agents.length - 1 ? '→' : ' '
  console.log(
    `  ${cfg.color}${cfg.icon} ${cfg.label.padEnd(10)}${C.reset} ${C.dim}(${name})${C.reset}  ${C.dim}${arrow}${C.reset}`,
  )
})
console.log()

console.log(C.bold + C.blue + '📝 题目' + C.reset)
console.log(C.dim + '  「小明有 24 块糖，平均分给 6 个同学；' + C.reset)
console.log(C.dim + '    妈妈又买了 3 包糖，每包 5 块。' + C.reset)
console.log(C.dim + '    每个同学现在一共有多少块？」' + C.reset)
console.log()

console.log(C.dim + LINE + C.reset)
console.log(C.bold + '⏳ 正在启动子 Agent 流水线...' + C.reset)
console.log()

const stream = await agent.streamEvents(
  { messages: [new HumanMessage(prompt)] },
  { recursionLimit: 200 },
)

/* ── 收集模式：先缓存，后按 Agent 分段打印 ── */
let currentAgent = null
let toolCount = 0
const startTime = Date.now()

/** 每个 Agent 的收集缓冲区 */
const agentBuffers = {}
const agentToolLogs = {} // 每个 Agent 的工具调用记录
const agentOrder = [] // Agent 出现顺序

/** 确保 Agent 缓冲区已初始化 */
function ensureAgent(name) {
  if (!agentBuffers[name]) {
    agentBuffers[name] = ''
    agentToolLogs[name] = []
    agentOrder.push(name)
  }
}

/** 从 task 工具调用的 input 中提取 subagent_type */
function extractSubagentType(event) {
  try {
    const input = event.data?.input
    if (typeof input === 'string') {
      const parsed = JSON.parse(input)
      return parsed.subagent_type ?? null
    }
    if (input?.input && typeof input.input === 'string') {
      const parsed = JSON.parse(input.input)
      return parsed.subagent_type ?? null
    }
  } catch {
    /* 解析失败忽略 */
  }
  return null
}

/** 进度指示器 */
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
let spinIdx = 0
let lastSpinTime = 0

function showProgress(agentName) {
  const now = Date.now()
  if (now - lastSpinTime < 150) return
  lastSpinTime = now
  const cfg = AGENT_UI[agentName] ?? {
    icon: '🤖',
    label: agentName,
    color: C.white,
  }
  const frame = SPINNER[spinIdx % SPINNER.length]
  spinIdx++
  process.stdout.write(
    `\r  ${cfg.color}${frame} ${cfg.icon} ${cfg.label} 工作中...${C.reset}   `,
  )
}

function clearProgress() {
  process.stdout.write('\r' + ' '.repeat(60) + '\r')
}

console.log(C.dim + '  正在收集各子 Agent 输出...' + C.reset)
console.log()

try {
  for await (const event of stream) {
    /* task 工具开始 → 切换当前 Agent */
    if (event.event === 'on_tool_start') {
      const raw = event.name?.split('/').pop() ?? event.name ?? ''
      if (raw === 'task') {
        const agentName = extractSubagentType(event)
        if (agentName && AGENT_UI[agentName]) {
          if (currentAgent) clearProgress()
          currentAgent = agentName
          ensureAgent(agentName)
          showProgress(agentName)
        }
        continue
      }
      toolCount++
      const icon = TOOL_ICON[raw] ?? '🔧'
      if (currentAgent) {
        agentToolLogs[currentAgent].push({ type: 'start', name: raw, icon })
      }
    }

    /* task 工具结束 → 清除当前 Agent */
    if (event.event === 'on_tool_end' && event.name === 'task') {
      clearProgress()
      currentAgent = null
      continue
    }

    /* 流式文本 → 缓存 */
    if (event.event === 'on_chat_model_stream') {
      const t = chunkText(event.data?.chunk)
      if (t) {
        if (currentAgent) {
          agentBuffers[currentAgent] += t
          showProgress(currentAgent)
        }
      }
    }

    /* 其他工具调用结束 → 记录结果 */
    if (event.event === 'on_tool_end' && event.name !== 'task') {
      try {
        const data =
          typeof event.data?.output === 'string'
            ? JSON.parse(event.data.output)
            : event.data?.output
        if (currentAgent && data) {
          agentToolLogs[currentAgent].push({ type: 'end', data })
        }
      } catch {
        /* 忽略 */
      }
    }
  }
} catch (e) {
  clearProgress()
  console.error(
    `\n\n${C.bold}❌ 错误: ${e.cause?.message ?? e.message}${C.reset}`,
  )
  throw e
}

clearProgress()

/* ── 按 Agent 分段打印 ── */
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

console.log()
console.log(C.bold + C.bgMagenta + C.white + ' ✅ 辅导流程完成 ' + C.reset)
console.log(C.dim + DLINE + C.reset)

for (const name of agentOrder) {
  const cfg = AGENT_UI[name] ?? { icon: '🤖', label: name, color: C.white }
  const text = agentBuffers[name]?.trim()
  const tools = agentToolLogs[name] ?? []

  // Agent 标题
  console.log()
  console.log(C.dim + LINE + C.reset)
  console.log(
    cfg.color +
      C.bold +
      `  ${cfg.icon}  ${cfg.label}` +
      C.reset +
      C.dim +
      `  (${name})` +
      C.reset,
  )
  console.log(C.dim + LINE + C.reset)
  console.log()

  // 工具调用记录
  if (tools.length > 0) {
    for (const t of tools) {
      if (t.type === 'start') {
        console.log(
          `  ${C.dim}│${C.reset} ${t.icon} ${C.bold}${C.blue}${t.name}${C.reset}`,
        )
      } else if (t.type === 'end') {
        const d = t.data
        if (d?.expression) {
          console.log(
            `  ${C.dim}└─${C.reset} ${C.green}${d.expression} = ${d.result}${C.reset}`,
          )
        } else if (d?.note) {
          console.log(`  ${C.dim}└─${C.reset} ${C.green}${d.note}${C.reset}`)
        } else if (d?.stem) {
          console.log(`  ${C.dim}└─${C.reset} ${C.green}${d.stem}${C.reset}`)
        }
      }
    }
    console.log()
  }

  // Agent 文本输出
  if (text) {
    console.log(text)
    console.log()
  }
}

/* ── 执行统计 ── */
console.log(C.dim + DLINE + C.reset)
console.log()
console.log(C.bold + '📊 执行统计' + C.reset)
console.log()
for (const name of agentOrder) {
  const cfg = AGENT_UI[name] ?? { icon: '🤖', label: name, color: C.white }
  const toolN = (agentToolLogs[name] ?? []).filter(
    t => t.type === 'start',
  ).length
  console.log(
    `  ${cfg.color}✔ ${cfg.icon} ${cfg.label}${C.reset}` +
      (toolN > 0 ? `  ${C.dim}(${toolN} 次工具调用)${C.reset}` : ''),
  )
}

console.log()
console.log(C.dim + '  ┌────────────────────────────────────────┐' + C.reset)
console.log(
  C.dim +
    `  │  子 Agent: ${C.reset}${C.bold}${agentOrder.length}${C.reset}${C.dim} 个` +
    `    工具调用: ${C.reset}${C.bold}${toolCount}${C.reset}${C.dim} 次  │` +
    C.reset,
)
console.log(
  C.dim +
    `  │  总耗时:   ${C.reset}${C.bold}${elapsed}s${C.reset}${C.dim}${' '.repeat(Math.max(0, 24 - elapsed.length))}│` +
    C.reset,
)
console.log(C.dim + '  └────────────────────────────────────────┘' + C.reset)
console.log()
