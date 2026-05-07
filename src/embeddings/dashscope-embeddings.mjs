/**
 * 阿里云 DashScope Embeddings 实现
 * 支持使用阿里云原生 API 调用 text-embedding-v1/v2/v3 等同步模型
 * 支持 text-embedding-async-v1/v2 等异步批处理模型
 * 兼容 LangChain Embeddings 接口
 */

class DashScopeEmbeddings {
  constructor({
    apiKey,
    model = 'text-embedding-v1',
    dimensions = 1536,
    pollingInterval = 2000,
    maxRetries = 60,
  }) {
    this.apiKey = apiKey
    this.model = model
    this.dimensions = dimensions
    this.pollingInterval = pollingInterval // 异步轮询间隔（毫秒）
    this.maxRetries = maxRetries // 异步最大轮询次数

    // 判断是否为异步模型
    this.isAsyncModel = model.includes('async')

    // 阿里云原生 API 端点（非 OpenAI 兼容模式）
    // 异步模型使用不同的端点
    if (this.isAsyncModel) {
      // 异步批处理 API 端点
      this.baseUrl =
        'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/async'
      this.taskUrl = 'https://dashscope.aliyuncs.com/api/v1/tasks'
    } else {
      // 同步 API 端点
      this.baseUrl =
        'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding'
    }
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
   * 注意：text-embedding-async-v1/v2 异步模型仅支持通过 URL 批量处理文件
   * 对于少量文本（<100条），建议直接使用同步模型 text-embedding-v2/v3
   */
  async embedDocuments(texts) {
    try {
      // 异步模型仅适合大批量文件处理，少量文本直接使用同步 API
      if (this.isAsyncModel && texts.length >= 100) {
        console.warn(
          `[DashScopeEmbeddings] 异步模型需要传入文件URL，当前传入${texts.length}条文本，切换到同步模式处理`,
        )
        return await this._callSyncApi(texts)
      } else if (this.isAsyncModel) {
        console.warn(
          `[DashScopeEmbeddings] 异步模型 text-embedding-async-v2 需要通过文件URL批量处理，当前传入${texts.length}条文本，自动使用同步模式`,
        )
        return await this._callSyncApi(texts)
      } else {
        return await this._callSyncApi(texts)
      }
    } catch (error) {
      console.error('DashScope embeddings error:', error.message)
      throw error
    }
  }

  /**
   * 调用同步 API
   */
  async _callSyncApi(texts) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-TaskGroup': 'default', // 可选：任务分组
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          texts: texts,
        },
        parameters: {
          text_type: 'query', // query 或 document，检索时用 query
        },
      }),
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
  }

  /**
   * 调用异步 API
   * 异步模型返回任务ID，需要轮询查询结果
   */
  async _callAsyncApi(texts) {
    // 1. 提交异步任务
    const submitResponse = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable', // 启用异步模式
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          texts: texts,
        },
        parameters: {
          text_type: 'query',
        },
      }),
    })

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      throw new Error(
        `DashScope async submit error: ${submitResponse.status} ${errorText}`,
      )
    }

    const submitData = await submitResponse.json()

    // 检查提交是否成功
    if (
      submitData.code &&
      submitData.code !== '200' &&
      submitData.code !== 200
    ) {
      throw new Error(
        `DashScope async submit error: ${submitData.message || submitData.code}`,
      )
    }

    // 获取任务ID
    const taskId = submitData.output?.task_id
    if (!taskId) {
      throw new Error('Failed to get task_id from async submission response')
    }

    console.log(`Async task submitted, task_id: ${taskId}`)

    // 2. 轮询查询任务结果
    return await this._pollTaskResult(taskId)
  }

  /**
   * 轮询查询异步任务结果
   */
  async _pollTaskResult(taskId) {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      await this._sleep(this.pollingInterval)

      const queryResponse = await fetch(`${this.taskUrl}/${taskId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!queryResponse.ok) {
        const errorText = await queryResponse.text()
        throw new Error(
          `DashScope task query error: ${queryResponse.status} ${errorText}`,
        )
      }

      const taskData = await queryResponse.json()

      // 检查查询是否成功
      if (taskData.code && taskData.code !== '200' && taskData.code !== 200) {
        throw new Error(
          `DashScope task query error: ${taskData.message || taskData.code}`,
        )
      }

      const taskStatus = taskData.output?.task_status

      // 根据任务状态处理
      switch (taskStatus) {
        case 'SUCCEEDED':
          // 任务成功完成，返回结果
          const embeddings = taskData.output?.embeddings
          if (!embeddings || !Array.isArray(embeddings)) {
            throw new Error('Invalid response format from async task result')
          }
          console.log(`Async task completed in ${attempt + 1} polling attempts`)
          return embeddings.map(item => item.embedding)

        case 'FAILED':
          // 任务失败
          throw new Error(
            `Async task failed: ${taskData.message || 'Unknown error'}`,
          )

        case 'PENDING':
        case 'RUNNING':
          // 任务还在进行中，继续轮询
          console.log(
            `Task status: ${taskStatus}, retrying... (${attempt + 1}/${this.maxRetries})`,
          )
          continue

        default:
          throw new Error(`Unknown task status: ${taskStatus}`)
      }
    }

    throw new Error(
      `Async task polling timeout after ${this.maxRetries} attempts`,
    )
  }

  /**
   * 睡眠函数
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取向量维度
   */
  getDimensions() {
    return this.dimensions
  }
}

export default DashScopeEmbeddings
