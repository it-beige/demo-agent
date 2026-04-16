import 'dotenv/config';
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const COLLECTION_NAME = 'weekly_report_examples';
const milvusAddress = process.env.MILVUS_ADDRESS ?? 'localhost:19530';

const client = new MilvusClient({
  address: milvusAddress,
});

async function checkAndRebuildIndex() {
  try {
    await client.connectPromise;
    console.log('✓ 已连接到 Milvus\n');

    // 检查索引状态
    console.log('检查索引状态...');
    const indexState = await client.describeIndex({
      collection_name: COLLECTION_NAME,
      field_name: 'vector',
    });
    console.log('索引状态:', JSON.stringify(indexState, null, 2));

    // 检查集合统计
    const stats = await client.getCollectionStatistics({
      collection_name: COLLECTION_NAME,
    });
    console.log('\n集合行数:', stats.row_count);

    // 删除旧索引
    console.log('\n删除旧索引...');
    try {
      await client.dropIndex({
        collection_name: COLLECTION_NAME,
        field_name: 'vector',
      });
      console.log('✓ 旧索引已删除');
    } catch (error) {
      console.log('删除索引失败（可能不存在）:', error.message);
    }

    // 创建新索引
    console.log('\n创建新索引...');
    await client.createIndex({
      collection_name: COLLECTION_NAME,
      field_name: 'vector',
      index_type: 'IVF_FLAT',
      metric_type: 'COSINE',
      params: { nlist: 1024 },
    });
    console.log('✓ 新索引已创建');

    // 释放集合并重新加载
    console.log('\n重新加载集合...');
    try {
      await client.releaseCollection({ collection_name: COLLECTION_NAME });
    } catch (error) {
      // 忽略错误
    }
    
    await client.loadCollection({ collection_name: COLLECTION_NAME });
    console.log('✓ 集合已重新加载');

    // 等待索引构建完成
    console.log('\n等待 5 秒让索引构建完成...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 测试查询
    console.log('\n测试简单查询...');
    const queryResult = await client.query({
      collection_name: COLLECTION_NAME,
      filter: 'id != ""',
      limit: 2,
      output_fields: ['id', 'scenario'],
    });
    console.log(`查询成功！返回 ${queryResult.data?.length || 0} 条记录`);
    if (queryResult.data && queryResult.data.length > 0) {
      console.log('示例数据:', JSON.stringify(queryResult.data[0], null, 2));
    }

  } catch (error) {
    console.error('错误:', error.message);
    console.error(error.stack);
  }
}

checkAndRebuildIndex();
