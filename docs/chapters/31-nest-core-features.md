# [NestJS·核心] NestJS 请求生命周期：Pipe / Guard / Interceptor / 异常过滤器 / JWT

> 用一个用户管理 + JWT 鉴权的最小服务，串起 NestJS 请求生命周期的五大切面：DTO 校验、管道转换（Pipe）、守卫鉴权（Guard）、拦截器包装响应（Interceptor）、全局异常兜底（Exception Filter），再叠加 `@nestjs/jwt` 完成签发与校验。
> **关键词**：Pipe、Guard、Interceptor、ExceptionFilter、自定义装饰器、JWT、请求生命周期

## 核心设计

NestJS 的一次请求会按固定顺序穿过多个「切面」，每个切面只管一件事，彼此解耦。理解这个顺序，是写对 Nest 后端的前提：

```
请求进入
   │
   ▼
┌────────────┐  Middleware        （本章未用，最外层）
├────────────┤
│  Guard     │  鉴权：能不能进？   → AuthGuard 校验 Token + 越权判断
├────────────┤
│ Interceptor│  前置：计时、日志   → TransformInterceptor 记录请求
├────────────┤
│  Pipe      │  转换/校验参数      → ParsePositiveIntPipe / ParseAgePipe
├────────────┤
│  Handler   │  控制器方法主体      → UserController
├────────────┤
│ Interceptor│  后置：包装响应体    → 统一成 { code, data, message }
└────────────┘
   │
   ▼ 任意环节抛异常
┌────────────┐
│  Filter    │  兜底：统一错误结构  → AllExceptionsFilter
└────────────┘
```

关键设计取舍：

- **职责单一**：鉴权只在 Guard、参数合法性只在 Pipe、响应形状只在 Interceptor、错误只在 Filter，控制器方法体保持纯业务。
- **全局 vs 局部**：`TransformInterceptor` 和 `AllExceptionsFilter` 在 `main.ts` 全局注册，一次生效全站；`AuthGuard` 和两个 Pipe 按需挂在具体路由上，避免误伤公开接口。
- **响应契约统一**：无论成功还是失败，前端拿到的都是 `{ code, data, message }` 同一结构——成功由 Interceptor 包装，失败由 Filter 兜底。

## 代码结构

```
src/nest-feature/
├── src/
│   ├── main.ts                         # 全局注册 Interceptor + Filter
│   ├── app.module.ts                   # 根模块，全局注册 JwtModule
│   ├── common/                         # 跨模块复用的切面
│   │   ├── pipes/
│   │   │   ├── parse-positive-int.pipe.ts   # 正整数校验（路径参数 id）
│   │   │   └── parse-age.pipe.ts            # 数字转换 + 范围校验（查询参数 age）
│   │   ├── guards/auth.guard.ts             # Token 鉴权 + 越权控制
│   │   ├── interceptors/transform.interceptor.ts  # 统一响应体 + 耗时日志
│   │   ├── filters/all-exceptions.filter.ts       # 全局异常兜底
│   │   ├── decorators/current-user.decorator.ts   # @CurrentUser() 取当前用户
│   │   └── interfaces/api-response.interface.ts   # ApiResponse / JwtPayload 类型
│   ├── auth/                           # 模拟鉴权服务（token → 用户）
│   ├── user/                           # 模块一：用户 CRUD
│   │   ├── dto/                        # CreateUserDto / UpdateUserDto
│   │   ├── entities/user.entity.ts
│   │   ├── user.controller.ts
│   │   └── user.service.ts             # 内存数组，无需数据库
│   └── jwt-test/                       # 模块二：JWT 签发与校验
├── curl-test.md                        # 用户模块 curl 用例
└── curl-test2.md                       # JWT 模块 curl 用例
```

## 技术栈

| 组件       | 技术                              | 作用                            |
| ---------- | --------------------------------- | ------------------------------- |
| 框架       | NestJS 11                         | 依赖注入 + 生命周期切面         |
| JWT        | `@nestjs/jwt`                     | Token 签发与校验                |
| DTO 派生   | `@nestjs/mapped-types`            | `PartialType` 生成更新 DTO      |
| 响应式     | `rxjs`（`map` / `tap`）           | 拦截器改写响应流                |
| 数据       | 内存数组                          | 免数据库，聚焦生命周期机制      |

---

## 模块一：user — CRUD + Pipe + Guard + 自定义装饰器

用户模块用一个内存数组当「数据库」，把参数校验、鉴权、越权控制三件事分别交给 Pipe、Guard、装饰器。

### DTO 与派生

```ts
export class CreateUserDto {
  username: string;
  name: string;
  age: number;
}

// 更新 DTO 复用创建 DTO，所有字段变可选
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

`PartialType` 自动把 `CreateUserDto` 的字段全部转为可选，避免手写一份重复的更新 DTO。

### Pipe：参数转换与校验

两个 Pipe 演示 Pipe 的两种典型用途——**类型转换**和**合法性校验**，都在进入控制器方法前完成：

| Pipe                   | 挂载位置                          | 职责                                       |
| ---------------------- | --------------------------------- | ------------------------------------------ |
| `ParsePositiveIntPipe` | `@Param('id', ...)`               | 字符串路径参数转正整数，非法直接抛 400     |
| `ParseAgePipe`         | `@Query('age', ...)`              | 字符串查询参数转数字，并校验 0~150 范围     |

```ts
// ParsePositiveIntPipe：严格到「字符串形态」也要是纯正整数
if (Number.isNaN(parsed) || parsed <= 0 || !Number.isInteger(parsed) || String(parsed) !== value) {
  throw new BadRequestException(`参数 ${metadata.data ?? 'id'} 必须是正整数，当前值: ${value}`);
}
```

`String(parsed) !== value` 这一步很关键：它能拦掉 `"1.0"`、`"01"`、`"1abc"` 这类 `parseInt` 会「宽容解析」的脏输入。

### Guard：鉴权 + 越权控制

`AuthGuard` 做两层判断——先验 Token，再验「这个用户有没有权访问这个 id」：

```ts
const token = this.extractToken(request.headers.authorization); // 取 Bearer Token
if (!token) throw new UnauthorizedException('请先登录，携带合法 Token');

const user = this.authService.validateToken(token);
if (!user) throw new UnauthorizedException('Token 无效或已过期');
request.user = user; // 挂到 request，供 @CurrentUser() 读取

// 越权控制：非管理员只能访问自己的 id
const targetId = request.params.id;
if (targetId !== undefined) {
  const id = Number.parseInt(targetId, 10);
  if (user.role !== 'admin' && user.id !== id) {
    throw new ForbiddenException('无权访问其他用户信息');
  }
}
```

`AuthService` 用一张 `tokenMap` 模拟「Token → 用户」映射（真实项目应换成 JWT 解析 + 数据库）：

| Token             | 用户     | 角色    |
| ----------------- | -------- | ------- |
| `admin-token-123` | admin    | admin   |
| `user-token-456`  | zhangsan | user    |

### 自定义参数装饰器

`@CurrentUser()` 把 Guard 挂到 `request.user` 上的当前用户，优雅地注入控制器方法，省去每次手写 `req.user`：

```ts
export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext): JwtPayload =>
    ctx.switchToHttp().getRequest<{ user: JwtPayload }>().user,
);

// 控制器里直接用
findOne(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() currentUser: JwtPayload) { ... }
```

> Guard 与装饰器的配合是有先后的：Guard 先执行并写入 `request.user`，`@CurrentUser()` 后执行才能读到——顺序颠倒就是 `undefined`。

---

## 模块二：jwt-test — 真正的 JWT 签发与校验

模块一的 `AuthService` 是「假 Token」，本模块用 `@nestjs/jwt` 换成真正的 JWT。`JwtModule` 在根模块 `app.module.ts` 里以 `global: true` 全局注册，各处直接注入 `JwtService`：

```ts
// app.module.ts
JwtModule.register({
  global: true,
  secret: 'jwt-test-secret-key',
  signOptions: { expiresIn: '1h' },
})
```

```ts
// jwt-test.service.ts
sign(payload: JwtTestPayload): string {
  return this.jwtService.sign(payload);            // 签发：payload → token
}

verify(token: string): JwtTestPayload {
  try {
    return this.jwtService.verify<JwtTestPayload>(token); // 校验：token → payload
  } catch {
    throw new UnauthorizedException('Token 无效或已过期');
  }
}
```

`POST /jwt-test/sign` 签发 Token，`GET /jwt-test/verify` 从 `Authorization: Bearer` 头取出 Token 校验，失败统一抛 401。

---

## 全局响应与异常

这两个切面在 `main.ts` 全局注册，是「响应契约统一」的两半：

```ts
app.useGlobalFilters(new AllExceptionsFilter());
app.useGlobalInterceptors(new TransformInterceptor());
```

- **`TransformInterceptor`（成功路径）**：用 `map` 把控制器返回值包成 `{ code: 200, data, message: '成功' }`，并用 `tap` 打印请求耗时日志。
- **`AllExceptionsFilter`（失败路径）**：`@Catch()` 捕获一切异常，`HttpException` 取其状态码与消息，其余未知错误兜底成 500 + `服务器内部错误`，最终同样输出 `{ code, data: null, message }`。

这样前端永远只需按一种结构解析响应，无需区分成功和失败两套格式。

## 运行方式

```bash
cd src/nest-feature
pnpm install
pnpm start:dev      # 默认 http://localhost:3000
```

用户模块 + Guard/Pipe 验证（完整用例见 `curl-test.md`）：

```bash
# 无 Token → 401
curl http://localhost:3000/user/2
# 普通用户查自己 → 200
curl -H "Authorization: Bearer user-token-456" http://localhost:3000/user/2
# 普通用户查他人 → 403（越权拦截）
curl -H "Authorization: Bearer user-token-456" http://localhost:3000/user/1
# 管理员查任意用户 → 200
curl -H "Authorization: Bearer admin-token-123" http://localhost:3000/user/2
# Pipe 拦非法 id → 400
curl -X DELETE http://localhost:3000/user/abc
```

JWT 模块验证（完整用例见 `curl-test2.md`）：

```bash
# 签发 → 返回 access_token
curl -X POST http://localhost:3000/jwt-test/sign \
  -H "Content-Type: application/json" \
  -d '{"sub": 1, "username": "testuser"}'
# 校验（<token> 换成上一步返回值）→ 200
curl http://localhost:3000/jwt-test/verify -H "Authorization: Bearer <token>"
```

## 扩展方向

- 用 `class-validator` + `ValidationPipe` 替换手写 DTO 校验，声明式约束字段
- 把 `AuthService` 的 `tokenMap` 换成 JWT 解析，与模块二打通成一套真实鉴权
- 引入 `@SetMetadata` + 自定义 `RolesGuard`，实现基于角色的接口级权限
- 用 `Reflector` 做 `@Public()` 装饰器，让全局 Guard 支持公开接口白名单
- 将内存数组替换为 TypeORM + 数据库，衔接[第 28 章](./28-postgresql-ai-database.md)

---

⬅️ [Mem0 记忆方案](./30-mem0-memory.md) ｜ [📚 目录](../../README.md#目录)
