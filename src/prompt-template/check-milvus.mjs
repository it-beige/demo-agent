import 'dotenv/config';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const COLLECTION_NAME = 'weekly_report_examples';
const milvusAddress = process.env.MILVUS_ADDRESS ?? 'localhost:19530';

const client = new MilvusClient({
  address: milvusAddress,
});

async function checkCollection() {
  try {
    await client.connectPromise;
    console.log('✓ 已连接到 Milvus\n');

    // 检查集合是否存在
    const hasCollection = await client.hasCollection({
      collection_name: COLLECTION_NAME,
    });
    console.log(`集合是否存在: ${hasCollection.value}`);

    if (hasCollection.value) {
      // 获取集合统计信息
      const stats = await client.getCollectionStatistics({
        collection_name: COLLECTION_NAME,
      });
      console.log(`集合行数: ${stats.row_count}`);

      // 检查集合加载状态
      const loadState = await client.getLoadState({
        collection_name: COLLECTION_NAME,
      });
      console.log(`加载状态: ${JSON.stringify(loadState)}`);

      // 尝试查询数据
      console.log('\n尝试查询数据...');
      const queryResult = await client.query({
        collection_name: COLLECTION_NAME,
        filter: 'id like "weekly_%"',
        limit: 2,
        output_fields: ['id', 'scenario'],
      });
      console.log(`查询结果: ${JSON.stringify(queryResult, null, 2)}`);
    }
  } catch (error) {
    console.error('错误:', error.message);
    console.error(error.stack);
  } finally {
    client.close();
  }
}

checkCollection();
