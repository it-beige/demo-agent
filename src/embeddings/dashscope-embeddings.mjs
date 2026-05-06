/**
 * 阿里云 DashScope Embeddings 实现
 * 支持使用阿里云原生 API 调用 text-embedding-v1/v2/v3 等同步模型
 * 兼容 LangChain Embeddings 接口
 */

class DashScopeEmbeddings {
  constructor({ apiKey, model = 'text-embedding-v1', dimensions = 1536 }) {
    this.apiKey = apiKey
    this.model = model
    this.dimensions = dimensions
    // 阿里云原生 API 端点（非 OpenAI 兼容模式）
    this.baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding'
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
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-TaskGroup': 'default', // 可选：任务分组
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            texts: texts
          },
          parameters: {
            text_type: 'query' // query 或 document，检索时用 query
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DashScope API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      
      // 检查是否有错误码
      if (data.code && data.code !== '200' && data.code !== 200) {
        throw new Error(`DashScope API error: ${data.message || data.code}`)
      }

      // 解析返回结果
      const embeddings = data.output?.embeddings
      
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