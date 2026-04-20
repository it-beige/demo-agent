import 'dotenv/config'
import {
  RouterRunnable,
  RunnableLambda,
  RunnableSequence,
} from '@langchain/core/runnables'

// 创建两个简单的 RunnableLambda
const toUpperCase = RunnableLambda.from(text => text.toUpperCase())
const reverseText = RunnableLambda.from(text =>
  text.split('').reverse().join(''),
)

// 创建 RouterRunnable，根据 key 选择要调用的 runnable
const router = new RouterRunnable({
  runnables: {
    toUpperCase,
    reverseText,
  },
})

// 2. 后处理
const addPrefix = RunnableLambda.from(result => console.log(`结果: ${result}`))

// 3. 组合
const chain = RunnableSequence.from([router, addPrefix])

// 测试：调用 reverseText
const result1 = await chain.invoke({
  key: 'reverseText',
  input: 'Hello World',
})

// 测试：调用 toUpperCase
const result2 = await chain.invoke({
  key: 'toUpperCase',
  input: 'Hello World',
})
