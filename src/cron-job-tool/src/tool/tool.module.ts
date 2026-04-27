import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import { TavilySearch } from '@langchain/tavily';
import { z } from 'zod';
import { MailerService } from '@nestjs-modules/mailer';
import {
  renderMarkdownEmail,
  markdownToPlainText,
} from '../utils/mail-template.util';
import { EntityManager } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  providers: [
    {
      provide: 'CHAT_MODEL',
      useFactory: (configService: ConfigService) => {
        return new ChatOpenAI({
          temperature: 0.7,
          model: configService.get('MODEL'),
          apiKey: configService.get('API_KEY'),
          configuration: {
            baseURL: configService.get('BASE_URL'),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'SEND_MAIL_TOOL',
      useFactory: (mailerService: MailerService, configService: ConfigService) => {
        const sendMailArgsSchema = z.object({
          to: z
            .email()
            .describe('收件人邮箱地址，例如：someone@example.com'),
          subject: z.string().describe('邮件主题'),
          body: z
            .string()
            .min(1)
            .describe(
              '邮件正文，支持 Markdown 语法（标题、列表、粗体、链接、代码、表格、引用等），服务端会自动渲染为精美 HTML',
            ),
        });

        return tool(
          async ({ to, subject, body }: {
            to: string;
            subject: string;
            body: string;
          }) => {
            const fallbackFrom = configService.get<string>('MAIL_FROM');

            // 服务端将 Markdown 自动渲染为精美 HTML，并保留纯文本兜底
            const html = renderMarkdownEmail(body, subject);
            const text = markdownToPlainText(body);

            await mailerService.sendMail({
              to,
              subject,
              text,
              html,
              from: fallbackFrom,
            });

            return `邮件已发送到 ${to}，主题为「${subject}」`;
          },
          {
            name: 'send_mail',
            description:
              '发送电子邮件。需要提供收件人邮箱（to）、主题（subject）和正文（body）。' +
              '正文 body 支持 Markdown 语法（标题 # / 列表 - / 粗体 ** / 链接 [文本](url) / 代码 ``` / 表格 | / 引用 > 等），' +
              '服务端会自动渲染为精美 HTML 邮件，请优先使用 Markdown 写作让邮件更易读。',
            schema: sendMailArgsSchema,
          },
        );
      },
      inject: [MailerService, ConfigService],
    },
    {
      provide: 'WEB_SEARCH_TOOL',
      useFactory: (configService: ConfigService) => {
        const webSearchArgsSchema = z.object({
          query: z
            .string()
            .min(1)
            .describe('搜索关键词，例如：公司年报、某个事件等'),
          count: z
            .number()
            .int()
            .min(1)
            .max(20)
            .optional()
            .describe('返回的搜索结果数量，默认 10 条'),
        });

        return tool(
          async ({ query, count }: { query: string; count?: number }) => {
            const apiKey = configService.get<string>('TAVILY_API_KEY');
            if (!apiKey) {
              return 'Tavily Web Search 的 API Key 未配置（环境变量 TAVILY_API_KEY），请先在服务端配置后再重试。';
            }

            try {
              const tavilyTool = new TavilySearch({
                tavilyApiKey: apiKey,
                maxResults: count ?? 10,
                searchDepth: 'basic',
                includeAnswer: true,
              });

              const result: any = await tavilyTool.invoke({ query });

              const parsed =
                typeof result === 'string' ? JSON.parse(result) : result;

              const results: any[] = parsed?.results ?? [];
              if (!results.length) {
                return '未找到相关结果。';
              }

              const answerLine = parsed?.answer
                ? `综合答案：${parsed.answer}\n\n`
                : '';

              const formatted = results
                .map(
                  (page: any, idx: number) =>
                    `引用：${idx + 1}
标题：${page.title}
URL: ${page.url}
摘要：${page.content}
相关度：${page.score ?? 'N/A'}
发布时间：${page.publishedDate ?? '未知'}`,
                )
                .join('\n\n');

              return answerLine + formatted;
            } catch (e) {
              return `Tavily 搜索请求失败，原因是：${(e as Error).message}`;
            }
          },
          {
            name: 'web_search',
            description:
              '使用 Tavily Web Search API 搜索互联网网页。输入为搜索关键词（可选 count 指定结果数量，1-20），返回综合答案以及包含标题、URL、摘要、相关度等信息的结果列表。',
            schema: webSearchArgsSchema,
          },
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'DB_USERS_CRUD_TOOL',
      useFactory: (entityManager: EntityManager) => {
        const dbUsersCrudArgsSchema = z.object({
          action: z
            .enum(['create', 'read', 'update', 'delete', 'list'])
            .describe('操作类型'),
          userId: z.string().optional().describe('用户 ID（read/update/delete 需要）'),
          name: z.string().optional().describe('用户姓名（create/update 需要）'),
          email: z.string().email().optional().describe('用户邮箱（create/update 需要）'),
          role: z.enum(['admin', 'user']).optional().describe('用户角色（create/update 需要）'),
        });

        return tool(
          async (args: {
            action: 'create' | 'read' | 'update' | 'delete' | 'list';
            userId?: string;
            name?: string;
            email?: string;
            role?: 'admin' | 'user';
          }) => {
            try {
              if (args.action === 'list') {
                const users = await entityManager.find(User, {
                  order: { createdAt: 'DESC' },
                });
                return JSON.stringify(users, null, 2);
              }

              if (args.action === 'create') {
                if (!args.name || !args.email || !args.role) {
                  return '错误：create 操作需要提供 name、email 和 role';
                }

                const user = entityManager.create(User, {
                  name: args.name,
                  email: args.email,
                  role: args.role,
                });
                const saved = await entityManager.save(User, user);
                return `用户已创建：\n- ID: ${saved.id}\n- 姓名：${saved.name}\n- 邮箱：${saved.email}\n- 角色：${saved.role}`;
              }

              if (args.action === 'read') {
                if (!args.userId) {
                  return '错误：read 操作需要提供 userId';
                }

                const user = await entityManager.findOne(User, {
                  where: { id: Number(args.userId) },
                });

                if (!user) {
                  const availableIds = (await entityManager.find(User)).map((u) => u.id).join(', ');
                  return `用户 ID ${args.userId} 不存在。可用的 ID: ${availableIds || '无'}`;
                }

                return `用户信息：\n- ID: ${user.id}\n- 姓名：${user.name}\n- 邮箱：${user.email}\n- 角色：${user.role}`;
              }

              if (args.action === 'update') {
                if (!args.userId) {
                  return '错误：update 操作需要提供 userId';
                }

                const user = await entityManager.findOne(User, {
                  where: { id: Number(args.userId) },
                });

                if (!user) {
                  return `用户 ID ${args.userId} 不存在`;
                }

                if (args.name) user.name = args.name;
                if (args.email) user.email = args.email;
                if (args.role) user.role = args.role;

                const saved = await entityManager.save(User, user);
                return `用户已更新：\n- ID: ${saved.id}\n- 姓名：${saved.name}\n- 邮箱：${saved.email}\n- 角色：${saved.role}`;
              }

              if (args.action === 'delete') {
                if (!args.userId) {
                  return '错误：delete 操作需要提供 userId';
                }

                const result = await entityManager.delete(User, args.userId);
                if (result.affected === 0) {
                  return `用户 ID ${args.userId} 不存在`;
                }

                return `用户 ${args.userId} 已删除`;
              }

              return '错误：未知的操作类型';
            } catch (e) {
              return `数据库操作失败：${(e as Error).message}`;
            }
          },
          {
            name: 'db_users_crud',
            description:
              '对数据库 users 表进行 CRUD 操作。支持：\n' +
              '- create: 创建新用户（需要 name、email、role）\n' +
              '- read: 查询单个用户（需要 userId）\n' +
              '- update: 更新用户信息（需要 userId，可选 name/email/role）\n' +
              '- delete: 删除用户（需要 userId）\n' +
              '- list: 列出所有用户',
            schema: dbUsersCrudArgsSchema,
          },
        );
      },
      inject: [EntityManager],
    },
  ],
  exports: ['CHAT_MODEL', 'SEND_MAIL_TOOL', 'WEB_SEARCH_TOOL', 'DB_USERS_CRUD_TOOL'],
})
export class ToolModule {}
