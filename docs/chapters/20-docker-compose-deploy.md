# 基于 Docker Compose 的本地开发环境和生产环境部署

> 通过 Docker Compose 一键拉起完整的本地开发环境（模型服务 + 数据库 + 应用），以及可复制的生产环境部署方案。告别"我这能跑啊"的环境地狱。

## 为什么需要 Docker Compose

这个仓库涉及 19 个章节，每个章节的依赖各不相同：

| 依赖类型 | 示例 | 问题 |
|----------|------|------|
| 数据库 | MySQL（第 10 章） | 本地装不装？版本对不对？ |
| 模型服务 | Ollama / vLLM | GPU 驱动、CUDA 版本、显存占用 |
| 前端构建 | React Todo（第 16 章） | Node 版本、构建产物路径 |
| Node 服务 | NestJS（13-15 章） | 环境变量、端口冲突 |

Docker Compose 把这些全打包进容器，一套 `docker compose up -d` 解决所有问题。

## 前置要求

- Docker 24+
- Docker Compose v2
- 至少 16GB 内存（如果用本地 Ollama 跑模型，建议 32GB+）

```bash
docker --version        # Docker version 24+
docker compose version  # Docker Compose version v2+
```

## 本地开发环境

### 目录结构

```
demo-agent/
├── docker-compose.dev.yml          # 本地开发编排
├── docker/
│   ├── mysql/
│   │   └── init.sql                # 初始化数据库和表结构
│   ├── ollama/
│   │   └── Modelfile               # 自定义模型配置（可选）
│   ├── nest-service/
│   │   ├── Dockerfile.dev          # NestJS 开发镜像
│   │   └── entrypoint.dev.sh       # 开发模式入口
│   └── nginx/
│       └── nginx.dev.conf          # 开发环境反向代理
├── .env.docker                      # Docker 专用环境变量
└── .env.docker.example
```

### docker-compose.dev.yml

```yaml
version: "3.9"

services:
  # ===== 模型服务 =====
  ollama:
    image: ollama/ollama:latest
    container_name: demo-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
      - ./docker/ollama/Modelfile:/Modelfile:ro
    environment:
      - OLLAMA_KEEP_ALIVE=24h
      - OLLAMA_HOST=0.0.0.0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    profiles:
      - ollama
    restart: unless-stopped

  # ===== MySQL =====
  mysql:
    image: mysql:8.0
    container_name: demo-mysql
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-demo_root_123}
      MYSQL_DATABASE: ${DB_NAME:-demo_db}
      MYSQL_USER: ${DB_USER:-demo_user}
      MYSQL_PASSWORD: ${DB_PASSWORD:-demo_pass_123}
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    profiles:
      - mysql
    restart: unless-stopped

  # ===== NestJS 开发服务 =====
  nest-dev:
    build:
      context: .
      dockerfile: docker/nest-service/Dockerfile.dev
    container_name: demo-nest-dev
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src:delegated
      - ./package.json:/app/package.json:ro
      - nest_node_modules:/app/node_modules
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=${DB_USER:-demo_user}
      - DB_PASSWORD=${DB_PASSWORD:-demo_pass_123}
      - DB_NAME=${DB_NAME:-demo_db}
      - MODEL=${MODEL:-deepseek-chat}
      - API_KEY=${API_KEY}
      - BASE_URL=${BASE_URL:-https://api.deepseek.com/v1}
    depends_on:
      mysql:
        condition: service_healthy
    profiles:
      - nest
    restart: unless-stopped

  # ===== Nginx 反向代理 =====
  nginx:
    image: nginx:alpine
    container_name: demo-nginx
    ports:
      - "8080:80"
    volumes:
      - ./docker/nginx/nginx.dev.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - nest-dev
    profiles:
      - proxy
    restart: unless-stopped

volumes:
  ollama_data:
  mysql_data:
  nest_node_modules:
```

### Dockerfile.dev

```dockerfile
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

EXPOSE 3000

CMD ["node", "--watch", "src/cron-job-tool/dist/main.js"]
```

### 初始化脚本 `docker/mysql/init.sql`

```sql
CREATE DATABASE IF NOT EXISTS demo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE demo_db;

CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 第 10 章智能录入用到的表
CREATE TABLE IF NOT EXISTS smart_imports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  raw_text TEXT NOT NULL,
  parsed_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 启动开发环境

```bash
# 1. 复制环境变量模板
cp .env.docker.example .env.docker

# 2. 编辑 .env.docker，填入你的 API_KEY
vim .env.docker

# 3. 按需启动服务组合
# 仅 MySQL（第 10 章）
docker compose -f docker-compose.dev.yml --profile mysql up -d

# MySQL + NestJS + Nginx（第 13-15 章）
docker compose -f docker-compose.dev.yml --profile mysql --profile nest --profile proxy up -d

# 全部服务（含 Ollama 本地模型）
docker compose -f docker-compose.dev.yml --profile ollama --profile mysql --profile nest --profile proxy up -d

# 4. 查看状态
docker compose -f docker-compose.dev.yml ps

# 5. 停止
docker compose -f docker-compose.dev.yml --profile '*' down
```

### 开发体验

| 特性 | 实现方式 |
|------|----------|
| 代码热更新 | `nest-dev` 的 volume mount `./src:/app/src`，配合 Node `--watch` |
| 数据库持久化 | `mysql_data` named volume，重启不丢数据 |
| 模型缓存 | `ollama_data` named volume，不用每次重拉模型 |
| 端口映射 | Nginx 统一入口 `:8080`，内部服务不暴露 |

### 首次启动 Ollama 需要手动拉模型

```bash
# 进入 Ollama 容器
docker exec -it demo-ollama bash

# 拉取模型（推荐 qwen2.5:7b 中文友好、资源友好）
ollama pull qwen2.5:7b

# 或者用 DeepSeek API 兼容模式，跳过这一步，直接用云端模型
```

---

## 生产环境部署

### docker-compose.prod.yml

与开发环境的关键差异：无 volume mount 源码、多副本、健康检查、资源限制。

```yaml
version: "3.9"

services:
  # ===== NestJS 生产服务（多副本） =====
  nest-prod:
    build:
      context: .
      dockerfile: docker/nest-service/Dockerfile.prod
    image: demo-nest:latest
    container_name: demo-nest-prod
    ports:
      - "3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=${DB_HOST:-mysql}
      - DB_PORT=3306
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - MODEL=${MODEL}
      - API_KEY=${API_KEY}
      - BASE_URL=${BASE_URL}
    depends_on:
      mysql:
        condition: service_healthy
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "1"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    container_name: demo-mysql-prod
    ports:
      - "3306"
    volumes:
      - mysql_prod_data:/var/lib/mysql
      - ./docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 1G
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: demo-nginx-prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro
      - ./docker/nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - nest-prod
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 128M
    restart: unless-stopped

volumes:
  mysql_prod_data:
```

### Dockerfile.prod

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod=false
COPY . .
RUN cd src/cron-job-tool && pnpm run build

# 运行阶段
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN npm install -g pnpm

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder --chown=nodejs:nodejs /app/src/cron-job-tool/dist ./src/cron-job-tool/dist

RUN pnpm install --frozen-lockfile --prod

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1))"

CMD ["node", "src/cron-job-tool/dist/main.js"]
```

### Nginx 生产配置

```nginx
upstream nest_backend {
    server nest-prod:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SSE 流式响应需要关闭缓冲
    location /api/ {
        proxy_pass http://nest_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    # 前端静态资源（第 16 章 AGUI）
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 部署步骤

```bash
# 1. 配置生产环境变量（必须用强密码）
cp .env.docker.example .env.docker.prod
vim .env.docker.prod

# 2. 构建并启动
docker compose -f docker-compose.prod.yml --env-file .env.docker.prod up -d --build

# 3. 检查健康状态
docker compose -f docker-compose.prod.yml ps
curl http://localhost:3000/health

# 4. 查看日志
docker compose -f docker-compose.prod.yml logs -f nest-prod

# 5. 滚动更新（代码改动后）
docker compose -f docker-compose.prod.yml up -d --build --scale nest-prod=3
# 等待新实例健康后
docker compose -f docker-compose.prod.yml up -d --scale nest-prod=2
```

### 生产环境 checklist

| 检查项 | 说明 |
|--------|------|
| 数据库密码 | 禁止使用默认密码，通过 `DB_ROOT_PASSWORD` 设强密码 |
| API Key | 不在镜像中硬编码，通过环境变量或 Docker secrets 注入 |
| SSL 证书 | 用 Let's Encrypt certbot 或云厂商免费证书 |
| 日志 | 配置 `logging` driver，接入 Loki / ELK |
| 备份 | MySQL volume 定期备份：`docker exec demo-mysql-prod mysqldump -u root -p demo_db > backup.sql` |
| 监控 | 接入 Prometheus + Grafana，健康检查端点暴露 metrics |

---

## 一键脚本

把常用操作封装成脚本，减少敲命令出错的概率：

```bash
#!/bin/bash
# scripts/docker-dev.sh

set -e

case "${1:-up}" in
  up)
    PROFILE="${2:-mysql}"
    echo "🚀 启动开发环境 (profile=$PROFILE)..."
    docker compose -f docker-compose.dev.yml --profile "$PROFILE" up -d
    ;;
  down)
    echo "🛑 停止开发环境..."
    docker compose -f docker-compose.dev.yml --profile '*' down
    ;;
  logs)
    SERVICE="${2:-nest-dev}"
    docker compose -f docker-compose.dev.yml logs -f "$SERVICE"
    ;;
  ps)
    docker compose -f docker-compose.dev.yml ps
    ;;
  *)
    echo "用法: ./scripts/docker-dev.sh {up|down|logs|ps} [profile|service]"
    ;;
esac
```

---

## ➡️ 下一步

- 📦 环境准备完毕？回到 [目录](./../README.md#目录) 按章节实战
- 🔧 MongoDB / Redis 等更多服务编排见 [项目结构](./project-structure.md)，Redis Agent 短期记忆实战见 [章节 28](./28-redis-agent-memory.md)
- 📁 `.env.docker` 完整变量说明见 [快速开始](./getting-started.md)
