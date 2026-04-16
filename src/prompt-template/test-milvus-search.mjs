import 'dotenv/config';
import { MilvusClient, MetricType } from '@zilliz/milvus2-sdk-node';
import { embeddings } from '@/index.mjs';

const COLLECTION_NAME = 'weekly_report_examples';
const milvusAddress = process.env.MILVUS_ADDRESS ?? 'localhost:19530';

const client = new MilvusClient({
  address: milvusAddress,
});

async function testSearch() {
  try {
    await client.connectPromise;
    console.log('✓ 已连接到 Milvus\n');

    // 重新加载集合
    try {
      await client.releaseCollection({ collection_name: COLLECTION_NAME });
    } catch (error) {
      // 忽略错误
    }
    
    await client.loadCollection({ collection_name: COLLECTION_NAME });
    console.log('✓ 集合已加载\n');

    // 生成查询向量
    const queryText = '技术债清理，重构代码，补齐单测';
    console.log(`查询文本: ${queryText}`);
    const queryVector = await embeddings.embedQuery(queryText);

    // 搜索
    console.log('\n开始搜索...');
    const searchResult = await client.search({
      collection_name: COLLECTION_NAME,
      vector: queryVector,
      limit: 2,
      metric_type: MetricType.COSINE,
      output_fields: ['id', 'scenario', 'report_snippet'],
      params: {
        nprobe: 16,
      },
      timeout: 30000,
    });

    console.log(`\n找到 ${searchResult.results.length} 条结果:\n`);
    searchResult.results.forEach((result, index) => {
      console.log(`--- 结果 ${index + 1} (相似度: ${result.score}) ---`);
      console.log(`ID: ${result.id}`);
      console.log(`场景: ${result.scenario}`);
      console.log(`片段: ${result.report_snippet}`);
      console.log();
    });
  } catch (error) {
    console.error('错误:', error.message);
    console.error(error.stack);
  } finally {
    client.close();
  }
}

testSearch();
