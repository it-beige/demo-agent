import { marked } from 'marked';

// 配置 marked：GFM（GitHub Flavored Markdown）+ 换行符识别
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * 将 Markdown 正文渲染为带主题样式的完整 HTML 邮件文档。
 *
 * 设计要点：
 * - 使用 inline 样式（部分邮件客户端不支持 <style>），关键样式直接写在标签上
 * - 仅使用邮件客户端兼容的基础 CSS（避免 flex/grid，使用 table/inline-block）
 * - 响应式宽度（最大 640px）
 * - 配色与前端 chat 主题保持呼应（紫色系强调）
 *
 * @param markdownBody Markdown 格式的邮件正文
 * @param subject 邮件主题（可选，用于邮件顶部标题展示）
 */
export function renderMarkdownEmail(
  markdownBody: string,
  subject?: string,
): string {
  const innerHtml = marked.parse(markdownBody, { async: false }) as string;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject ?? '')}</title>
  <style>
    /* 邮件客户端尽量识别的基础样式（部分客户端会剥离 style 标签，仍以 inline 为主） */
    body { margin: 0; padding: 0; background: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; color: #2d2a35; }
    a { color: #aa3bff; text-decoration: none; }
    h1, h2, h3, h4 { color: #08060d; line-height: 1.35; margin: 1.2em 0 0.6em; }
    h1 { font-size: 26px; }
    h2 { font-size: 22px; }
    h3 { font-size: 18px; }
    p { line-height: 1.7; margin: 0 0 1em; font-size: 15px; }
    ul, ol { padding-left: 1.4em; line-height: 1.7; margin: 0 0 1em; }
    li { margin: 0.3em 0; }
    blockquote { margin: 1em 0; padding: 12px 16px; background: #f3edff; border-left: 4px solid #aa3bff; color: #4a4458; border-radius: 4px; }
    code { font-family: ui-monospace, "SF Mono", Consolas, monospace; background: #f4f3ec; color: #08060d; padding: 2px 6px; border-radius: 4px; font-size: 0.92em; }
    pre { background: #1f2028; color: #e5e4e7; padding: 14px 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; line-height: 1.6; }
    pre code { background: transparent; color: inherit; padding: 0; }
    table { width: 100%; border-collapse: collapse; margin: 1em 0; }
    th, td { padding: 10px 12px; border: 1px solid #e5e4e7; text-align: left; font-size: 14px; }
    th { background: #f3edff; color: #08060d; font-weight: 600; }
    img { max-width: 100%; height: auto; border-radius: 6px; }
    hr { border: none; border-top: 1px solid #e5e4e7; margin: 24px 0; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f7;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(8,6,13,0.08);">
          <!-- 顶部条 -->
          <tr>
            <td style="background:linear-gradient(135deg,#aa3bff 0%,#7c3aed 100%);padding:20px 28px;">
              <div style="color:#ffffff;font-size:14px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;opacity:0.85;">AI Agent 邮件</div>
              ${subject ? `<div style="color:#ffffff;font-size:20px;font-weight:600;margin-top:6px;line-height:1.4;">${escapeHtml(subject)}</div>` : ''}
            </td>
          </tr>
          <!-- 正文 -->
          <tr>
            <td style="padding:28px 32px;color:#2d2a35;">
              ${innerHtml}
            </td>
          </tr>
          <!-- 页脚 -->
          <tr>
            <td style="padding:18px 32px;background:#fafafa;border-top:1px solid #e5e4e7;color:#888;font-size:12px;text-align:center;">
              本邮件由 AI Agent 自动生成发送
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 将 Markdown 简单转为纯文本（去除标题井号、列表符号、链接括号等），用于邮件 text 兜底。
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1 ($2)')
    .replace(/^>\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, (m) => m.trim() + ' ')
    .trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
