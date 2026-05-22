/**
 * 阿里云 DashScope Embeddings 实现
 * 支持 text-embedding-v1/v2/v3 等同步模型
 * 兼容 LangChain Embeddings 接口
 * 使用 OpenAI 兼容模式调用
 */

class DashScopeEmbeddings {
  constructor({ apiKey, model = 'text-embedding-v3', dimensions = 1024 }) {
    this.apiKey = apiKey
    this.model = model
    this.dimensions = dimensions
    // OpenAI 兼容模式端点
    this.baseUrl =
      'https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings'
  }

  /**
   * 生成单个文本的向量（用于检索时的问题向量化）
   */
  async embedQuery(text) {
    const embeddings = await this.embedDocuments([text])
    return embeddings[0]
  }

  /**
   * 批量生成文本向量
   */
  async embedDocuments(texts) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          input: texts,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DashScope API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()

      // 检查是否有错误码
      if (data.error) {
        throw new Error(
          `DashScope API error: ${data.error.message || data.error.code}`,
        )
      }

      // 解析返回结果
      const embeddings = data.data

      if (!embeddings || !Array.isArray(embeddings)) {
        throw new Error('Invalid response format from DashScope API')
      }

      // 返回向量数组
      return embeddings.map(item => item.embedding)
    } catch (error) {
      console.error('DashScope embeddings error:', error.message)
      throw error
    }
  }

  /**
   * 获取向量维度
   */
  getDimensions() {
    return this.dimensions
  }
}

export default DashScopeEmbeddings
