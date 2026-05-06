# 构建阶段：需要 devDependencies（含 @nestjs/cli、typescript）才能 nest build
FROM docker.m.daocloud.io/library/node:24.15-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制依赖文件
COPY package*.json  ./

# 设置 pnpm 镜像源并安装依赖
RUN pnpm config set registry https://registry.npmmirror.com/
RUN pnpm install

# 复制源代码并构建
COPY . .
RUN pnpm build

# 运行阶段：仅生产依赖 + 编译产物，镜像更小
FROM docker.m.daocloud.io/library/node:24.15-alpine

# 安装 pnpm
RUN npm install -g pnpm

ENV NODE_ENV=production
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 设置 pnpm 镜像源并仅安装生产依赖
RUN pnpm config set registry https://registry.npmmirror.com/
RUN pnpm install --prod

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]