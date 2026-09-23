import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';

@Injectable()
export class JobAgentService {
  private readonly logger = new Logger(JobAgentService.name);
  private readonly agentModel: any;
  private readonly maxIterations = 15;

  constructor(
    @Inject('CHAT_MODEL') model: ChatOpenAI,
    @Inject('SEND_MAIL_TOOL') private readonly sendMailTool: any,
    @Inject('WEB_SEARCH_TOOL') private readonly webSearchTool: any,
    @Inject('DB_USERS_CRUD_TOOL') private readonly dbUsersCrudTool: any,
  ) {
    // 绑定所有可用工具
    this.agentModel = model.bindTools([
      this.sendMailTool,
      this.webSearchTool,
      this.dbUsersCrudTool,
    ]);
  }

  /**
   * 执行定时任务
   * @param instruction 任务描述（自然语言）
   * @returns 执行结果
   */
  async runJob(instruction: string): Promise<string> {
    const messages: BaseMessage[] = [
      new SystemMessage(
        `你是一个任务执行助手，负责执行定时任务。用户会给你一个任务描述（instruction），你需要：
1. 理解任务意图
2. 调用合适的工具来完成（如 send_mail 发送邮件、web_search 搜索信息、db_users_crud 查询用户等）
3. 返回执行结果

注意：
- 不要回复多余的话，直接执行任务
- 如果需要搜索信息，先调用 web_search
- 如果需要发送邮件，使用 send_mail
- 如果需要查询/操作用户数据，使用 db_users_crud
- 执行完成后，用简洁的语言总结结果`,
      ),
      new HumanMessage(instruction),
    ];

    let iterations = 0;

    while (iterations < this.maxIterations) {
      iterations++;
      const aiMessage: AIMessage = await this.agentModel.invoke(messages);
      messages.push(aiMessage);

      const toolCalls = aiMessage.tool_calls ?? [];

      // 没有工具调用：说明这一轮就是最终结果
      if (!toolCalls.length) {
        return aiMessage.content as string;
      }

      // 有工具调用：依次真正执行，并把结果作为 ToolMessage 喂回，进入下一轮
      for (const toolCall of toolCalls) {
        const toolCallId = toolCall.id || '';
        const toolName = toolCall.name;

        let content: string;
        try {
          this.logger.log(`执行工具 ${toolName}`);
          if (toolName === 'send_mail') {
            content = await this.sendMailTool.invoke(toolCall.args);
          } else if (toolName === 'web_search') {
            content = await this.webSearchTool.invoke(toolCall.args);
          } else if (toolName === 'db_users_crud') {
            content = await this.dbUsersCrudTool.invoke(toolCall.args);
          } else {
            content = `未知工具：${toolName}`;
          }
        } catch (error) {
          content = `工具 ${toolName} 执行失败：${(error as Error).message}`;
        }

        messages.push(
          new ToolMessage({
            tool_call_id: toolCallId,
            name: toolName,
            content,
          }),
        );
      }
    }

    throw new Error(
      `JobAgent 达到最大迭代次数限制 (${this.maxIterations} 次)，可能是工具调用死循环。`,
    );
  }
}
