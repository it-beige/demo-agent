import 'dotenv/config'
import { BaseDocumentCompressor } from '@langchain/core/retrievers/document_compressors'

export class DashScopeRerank extends BaseDocumentCompressor {
  constructor({ apiKey, model, topN, baseUrl } = {}) {
    super()
    this.apiKey = apiKey ?? process.env.RERANK_API_KEY ?? process.env.API_KEY
    this.model = model ?? process.env.RERANK_MODEL ?? 'qwen3-rerank'
    this.topN = topN ?? parseInt(process.env.RERANK_TOP_N) ?? 3
    this.baseUrl = baseUrl ?? process.env.RERANK_URL
  }

  async compressDocuments(documents, query, _callbacks) {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          query,
          documents: documents.map(d => d.pageContent),
        },
        parameters: {
          return_documents: false,
          top_n: this.topN,
        },
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      throw new Error(`DashScope rerank ${res.status}: ${JSON.stringify(json)}`)
    }

    const results = json?.output?.results
    if (!Array.isArray(results)) {
      throw new Error(`unexpected rerank response: ${JSON.stringify(json)}`)
    }

    return results.map(item => documents[item.index])
  }
}
