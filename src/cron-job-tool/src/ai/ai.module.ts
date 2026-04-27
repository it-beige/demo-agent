import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import { TavilySearch } from '@langchain/tavily';
import { z } from 'zod';
import { UserService } from './user.service';
import { MailerService } from '@nestjs-modules/mailer';
import {
  renderMarkdownEmail,
  markdownToPlainText,
} from '../utils/mail-template.util';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    UserService,
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
      provide: 'QUERY_USER_TOOL',
      useFactory: (userService: UserService) => {
        const queryUserArgsSchema = z.object({
          userId: z.string().describe('用户 ID，例如: 001, 002, 003'),
        });

        return tool(
          async ({ userId }: { userId: string }) => {
            const user = userService.findOne(userId);

            if (!user) {
              const availableIds = userService
                .findAll()
                .map((u) => u.id)
                .join(', ');

              return `用户 ID ${userId} 不存在。可用的 ID: ${availableIds}`;
            }

            return `用户信息：\n- ID: ${user.id}\n- 姓名: ${user.name}\n- 邮箱: ${user.email}\n- 角色: ${user.role}`;
          },
          {
            name: 'query_user',
            description:
              '查询数据库中的用户信息。输入用户 ID，返回该用户的详细信息（姓名、邮箱、角色）。',
            schema: queryUserArgsSchema,
          },
        );
      },
      inject: [UserService],
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
                ? `综合答案: ${parsed.answer}\n\n`
                : '';

              const formatted = results
                .map(
                  (page: any, idx: number) =>
                    `引用: ${idx + 1}
标题: ${page.title}
URL: ${page.url}
摘要: ${page.content}
相关度: ${page.score ?? 'N/A'}
发布时间: ${page.publishedDate ?? '未知'}`,
                )
                .join('\n\n');

              return answerLine + formatted;
            } catch (e) {
              return `Tavily 搜索请求失败，原因是: ${(e as Error).message}`;
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
  ],
})
export class AiModule {}

