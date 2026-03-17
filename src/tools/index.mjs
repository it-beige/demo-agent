import { createExecuteCommandTool } from './command-execute.mjs'
import { createListDirectoryTool } from './directory-list.mjs'
import { createReadFileTool } from './file-read.mjs'
import { createWriteFileTool } from './file-write.mjs'

export {
  createExecuteCommandTool,
  createListDirectoryTool,
  createReadFileTool,
  createWriteFileTool,
}

export function createTools() {
  return [
    createReadFileTool(),
    createWriteFileTool(),
    createListDirectoryTool(),
    createExecuteCommandTool(),
  ]
}
