import 'dotenv/config'
import {
  RunnableEach,
  RunnableLambda,
  RunnableSequence,
} from '@langchain/core/runnables'
import chalk from 'chalk'

const toUpperCase = RunnableLambda.from(input => input.toUpperCase())
const addGreeting = RunnableLambda.from(input => `你好，${input}！`)

// 即使处理时间不同，顺序也会保持
const asyncProcess = RunnableLambda.from(async item => {
  console.log(chalk.cyan(`Processing asyncProcess ${item}...`))
  return new Promise(resolve => setTimeout(() => resolve(item), 10 * 1000))
})

const processItem = RunnableSequence.from([
  toUpperCase,
  addGreeting,
  asyncProcess,
])

// 使用 RunnableEach 对数组中的每个元素应用这个链
const chain = new RunnableEach({
  bound: processItem,
})

const input = ['alice', 'bob', 'carol']
const result = await chain.invoke(input)

console.log('✅ RunnableEach - 数组元素处理:')
console.log('输入:', input)
console.log('输出:', result)
