import { tool } from '@langchain/core/tools'
import fs from 'node:fs/promises'
import { z } from 'zod'

export function createReadFileTool() {
  return tool(
    async ({ filePath }) => {
      const content = await fs.readFile(filePath, 'utf-8')
      console.log(
        `「工具调用」 file-read("${filePath}") - 成功读取${content.length}字节`,
      )
      return `文件内容:\n${content}`
    },
    {
      name: 'file-read',
      description:
        '用此工具来读取文件内容。当用户要求读取文件、查看代码、分析文件内容时，调用此工具。输入文件路径（可以是相对路径或绝对路径）。',
      schema: z.object({
        filePath: z.string().describe('要读取的文件路径'),
      }),
    },
  )
}
