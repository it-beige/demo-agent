import 'dotenv/config';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const COLLECTION_NAME = 'weekly_report_examples';
const milvusAddress = process.env.MILVUS_ADDRESS ?? 'localhost:19530';

const client = new MilvusClient({
  address: milvusAddress,
});

async function dropCollection() {
  try {
    await client.connectPromise;
    console.log('✓ 已连接到 Milvus\n');

    // 检查集合是否存在
    const hasCollection = await client.hasCollection({
      collection_name: COLLECTION_NAME,
    });
    
    if (hasCollection.value) {
      console.log(`删除集合 ${COLLECTION_NAME}...`);
      
      // 先释放集合
      try {
        await client.releaseCollection({ collection_name: COLLECTION_NAME });
        console.log('✓ 集合已释放');
      } catch (error) {
        console.log('集合未加载，跳过释放');
      }
      
      // 删除集合
      await client.dropCollection({ collection_name: COLLECTION_NAME });
      console.log('✓ 集合已删除\n');
    } else {
      console.log(`集合 ${COLLECTION_NAME} 不存在`);
    }
  } catch (error) {
    console.error('错误:', error.message);
  }
}

dropCollection();
