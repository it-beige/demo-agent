import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ConfigService } from '@nestjs/config';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { UserService } from './user.service';
import { JobModule } from '../job/job.module';
import { JobService } from '../job/job.service';
import { EntityManager } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ToolModule } from '../tool/tool.module';

@Module({
  imports: [JobModule, ToolModule],
  controllers: [AiController],
  providers: [
    AiService,
    UserService,
    {
      provide: 'QUERY_USER_TOOL',
      useFactory: (userService: UserService) => {
        const queryUserArgsSchema = z.object({
          userId: z.string().describe('用户 ID，例如：001, 002, 003'),
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

            return `用户信息：\n- ID: ${user.id}\n- 姓名：${user.name}\n- 邮箱：${user.email}\n- 角色：${user.role}`;
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
      provide: 'TIME_NOW_TOOL',
      useFactory: () => {
        const timeNowArgsSchema = z.object({});

        return tool(
          async () => {
            const now = new Date();
            return {
              iso: now.toISOString(),
              timestamp: now.getTime(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              local: now.toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
                hour12: false,
              }),
            };
          },
          {
            name: 'time_now',
            description:
              '获取当前服务器时间。返回 ISO 格式、时间戳、时区和本地时间（东八区）等信息。用于计算定时任务的执行时间。',
            schema: timeNowArgsSchema,
          },
        );
      },
      inject: [],
    },
    {
      provide: 'CRON_JOB_TOOL',
      useFactory: (jobService: JobService) => {
        const cronJobArgsSchema = z.object({
          action: z
            .enum(['list', 'add', 'toggle'])
            .describe('操作类型：list=查看列表，add=创建任务，toggle=启用/禁用'),
          type: z
            .enum(['cron', 'every', 'at'])
            .optional()
            .describe('任务类型（仅 add 操作需要）：cron=Cron 表达式，every=间隔执行，at=一次性执行'),
          instruction: z
            .string()
            .optional()
            .describe('任务描述（仅 add 操作需要），例如："给我发一个笑话到邮箱"'),
          cron: z
            .string()
            .optional()
            .describe('Cron 表达式（仅 type=cron 时需要），例如："0 */5 * * * *" 表示每 5 分钟'),
          everyMs: z
            .number()
            .int()
            .optional()
            .describe('间隔毫秒数（仅 type=every 时需要），例如：300000 表示每 5 分钟'),
          at: z
            .string()
            .optional()
            .describe('ISO 格式时间点（仅 type=at 时需要），例如："2026-04-27T10:30:00.000Z"'),
          jobId: z.string().optional().describe('任务 ID（仅 toggle 操作需要）'),
          isEnabled: z
            .boolean()
            .optional()
            .describe('启用状态（仅 toggle 操作需要），不传则自动切换'),
        });

        return tool(
          async (args: {
            action: 'list' | 'add' | 'toggle';
            type?: 'cron' | 'every' | 'at';
            instruction?: string;
            cron?: string;
            everyMs?: number;
            at?: string;
            jobId?: string;
            isEnabled?: boolean;
          }) => {
            try {
              if (args.action === 'list') {
                const jobs = await jobService.listJobs();
                return JSON.stringify(jobs, null, 2);
              }

              if (args.action === 'add') {
                if (!args.type || !args.instruction) {
                  return '错误：add 操作需要提供 type（任务类型）和 instruction（任务描述）';
                }

                if (args.type === 'cron' && !args.cron) {
                  return '错误：type=cron 需要提供 cron 表达式';
                }

                if (args.type === 'every' && (!args.everyMs || args.everyMs <= 0)) {
                  return '错误：type=every 需要提供有效的 everyMs（间隔毫秒数）';
                }

                if (args.type === 'at' && !args.at) {
                  return '错误：type=at 需要提供 at（ISO 格式时间点）';
                }

                const job = await jobService.addJob({
                  type: args.type,
                  instruction: args.instruction,
                  cron: args.type === 'cron' ? args.cron! : undefined,
                  everyMs: args.type === 'every' ? args.everyMs! : undefined,
                  at: args.type === 'at' ? new Date(args.at!) : undefined,
                  isEnabled: true,
                });

                return `定时任务已创建：\n- ID: ${job.id}\n- 类型：${job.type}\n- 描述：${job.instruction}\n- 状态：${job.isEnabled ? '已启用' : '已禁用'}`;
              }

              if (args.action === 'toggle') {
                if (!args.jobId) {
                  return '错误：toggle 操作需要提供 jobId';
                }

                const job = await jobService.toggleJob(args.jobId, args.isEnabled);
                return `定时任务 ${job.id} 已${job.isEnabled ? '启用' : '禁用'}`;
              }

              return '错误：未知的操作类型';
            } catch (e) {
              return `定时任务操作失败：${(e as Error).message}`;
            }
          },
          {
            name: 'cron_job',
            description:
              '创建和管理定时/周期任务。支持三种类型：\n' +
              '1. cron: 使用 Cron 表达式（例如 "0 */5 * * * *" 每 5 分钟）\n' +
              '2. every: 间隔执行（例如 everyMs=300000 每 5 分钟）\n' +
              '3. at: 一次性执行（例如 at="2026-04-27T10:30:00.000Z"）\n' +
              '操作包括：list（查看列表）、add（创建任务）、toggle（启用/禁用）。\n' +
              '重要：instruction 字段只需填写"要做什么"的自然语言描述，不要写成工具调用代码。',
            schema: cronJobArgsSchema,
          },
        );
      },
      inject: [JobService],
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
})
export class AiModule {}