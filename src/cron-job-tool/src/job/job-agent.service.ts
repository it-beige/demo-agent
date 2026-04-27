import { Inject, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';

@Injectable()
export class JobAgentService {
  private readonly agentModel: any;

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
    const messages = [
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

    try {
      const response = await this.agentModel.invoke(messages);
      return response.content as string;
    } catch (error) {
      throw new Error(`JobAgent 执行失败：${(error as Error).message}`);
    }
  }
}
