import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

/**
 * 自动向上查找 .env 文件
 * 从指定目录开始，逐级向上查找，直到找到 .env 文件或到达文件系统根目录。
 * @param {string} startPath 起始查找路径
 * @returns {string | null} .env 文件的绝对路径，未找到返回 null
 */
export function findEnvFile(startPath) {
  let currentDir = path.resolve(startPath);

  while (currentDir !== path.dirname(currentDir)) {
    const envPath = path.join(currentDir, ".env");
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * 加载最近的 .env 到 process.env
 * 典型用法：在 ESM 脚本入口处调用 `loadEnvFromNearest(import.meta.url)`
 * @param {string} importMetaUrl 调用方的 import.meta.url
 * @returns {string | null} 实际加载的 .env 绝对路径；未找到时返回 null
 */
export function loadEnvFromNearest(importMetaUrl) {
  const callerDir = path.dirname(fileURLToPath(importMetaUrl));
  const envFilePath = findEnvFile(callerDir);

  if (!envFilePath) {
    console.warn("⚠️  未找到 .env 文件，将使用系统环境变量");
    return null;
  }

  dotenv.config({ path: envFilePath });
  return envFilePath;
}
