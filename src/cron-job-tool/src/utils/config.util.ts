import * as fs from 'fs';
import * as path from 'path';

/**
 * 自动向上查找 .env 文件
 * 从指定目录开始，逐级向上查找，直到找到 .env 文件或到达文件系统根目录
 * @param startPath 起始查找路径
 * @returns .env 文件的绝对路径，如果未找到则返回 null
 */
export function findEnvFile(startPath: string = __dirname): string | null {
  let currentDir = path.resolve(startPath);
  
  while (currentDir !== path.dirname(currentDir)) {
    const envPath = path.join(currentDir, '.env');
    
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  return null;
}

/**
 * 获取 .env 文件路径（从当前文件位置向上查找）
 * @returns .env 文件的绝对路径
 */
export function getEnvFilePath(): string {
  const envPath = findEnvFile(__dirname);
  
  if (!envPath) {
    console.warn('⚠️  未找到 .env 文件，将使用系统环境变量');
    return '';
  }
  
  return envPath;
}
