import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200'
});

const INDEX_NAME = 'travel_journal';

/**
 * 进阶学习方向 3：性能优化
 * 演示 Bulk API 批量操作、Scroll API 深度分页、索引优化策略
 */

// 1. Bulk API 批量操作
async function bulkApiDemo() {
  console.log('\n========== 3.1 Bulk API 批量操作演示 ==========');
  
  // 1.1 批量插入
  console.log('\n--- 1.1 批量插入 100 条数据 ---');
  const startTime = Date.now();
  
  const bulkOperations = [];
  const now = new Date().toISOString();
  
  for (let i = 1; i <= 100; i++) {
    // 每个文档需要两个操作：元数据 + 文档内容
    bulkOperations.push({ index: { _index: INDEX_NAME } });
    bulkOperations.push({
      note_title: `批量测试日记 ${i}`,
      note_body: `这是第 ${i} 条批量插入的测试数据，用于演示 Bulk API 的性能优势。内容包括运动、旅行、生活等主题。`,
      tags: i % 3 === 0 ? ['运动', '批量测试'] : (i % 3 === 1 ? ['旅行', '批量测试'] : ['生活', '批量测试']),
      mood: i % 4 === 0 ? 'relaxed' : (i % 4 === 1 ? 'energetic' : (i % 4 === 2 ? 'calm' : 'focused')),
      priority: (i % 5) + 1,
      created_at: now,
      updated_at: now
    });
  }
  
  const bulkRes = await client.bulk({
    refresh: true,
    operations: bulkOperations
  });
  
  const endTime = Date.now();
  console.log(`✅ 批量插入完成:`);
  console.log(`   插入数量: 100 条`);
  console.log(`   耗时: ${endTime - startTime} ms`);
  console.log(`   响应状态: ${bulkRes.errors ? '有错误' : '全部成功'}`);

  // 1.2 对比逐条插入
  console.log('\n--- 1.2 对比：逐条插入 10 条数据 ---');
  const startTime2 = Date.now();
  
  for (let i = 101; i <= 110; i++) {
    await client.index({
      index: INDEX_NAME,
      document: {
        note_title: `逐条测试 ${i}`,
        note_body: `这是第 ${i} 条逐条插入的数据`,
        tags: ['测试'],
        mood: 'calm',
        priority: 1,
        created_at: now,
        updated_at: now
      },
      refresh: true
    });
  }
  
  const endTime2 = Date.now();
  console.log(`✅ 逐条插入完成:`);
  console.log(`   插入数量: 10 条`);
  console.log(`   耗时: ${endTime2 - startTime2} ms`);
  console.log(`   平均每条: ${((endTime2 - startTime2) / 10).toFixed(2)} ms`);

  console.log('\n💡 性能对比：');
  console.log(`   Bulk API: ${((endTime - startTime) / 100).toFixed(2)} ms/条`);
  console.log(`   逐条插入: ${((endTime2 - startTime2) / 10).toFixed(2)} ms/条`);
  console.log(`   Bulk API 快约 ${(((endTime2 - startTime2) / 10) / ((endTime - startTime) / 100)).toFixed(1)} 倍`);
}

// 2. Scroll API 深度分页
async function scrollApiDemo() {
  console.log('\n========== 3.2 Scroll API 深度分页演示 ==========');
  
  // 2.1 使用普通分页的问题
  console.log('\n--- 2.1 普通分页的局限性 ---');
  console.log('   问题：from + size 在深度分页时性能很差');
  console.log('   例如：from=10000, size=10 需要扫描前 10010 条数据');
  
  // 2.2 Scroll API 初始化
  console.log('\n--- 2.2 Scroll API 获取全量数据 ---');
  
  // 第一步：初始化 scroll，获取 scroll_id
  const scrollRes = await client.search({
    index: INDEX_NAME,
    query: {
      match: {
        tags: '批量测试'
      }
    },
    size: 20,  // 每次返回 20 条
    scroll: '1m'  // scroll 上下文保持 1 分钟
  });

  const scrollId = scrollRes._scroll_id;
  let totalHits = scrollRes.hits.total.value;
  let processedCount = scrollRes.hits.hits.length;
  
  console.log(`📊 总命中数: ${totalHits} 条`);
  console.log(`📄 第 1 批: 获取 ${scrollRes.hits.hits.length} 条`);
  
  // 第二步：循环获取后续数据
  let batch = 2;
  
  while (processedCount < totalHits) {
    const nextScroll = await client.scroll({
      scroll_id: scrollId,
      scroll: '1m'
    });
    
    const hits = nextScroll.hits.hits;
    if (hits.length === 0) break;
    
    processedCount += hits.length;
    console.log(`📄 第 ${batch} 批: 获取 ${hits.length} 条 (累计: ${processedCount}/${totalHits})`);
    batch++;
  }

  console.log(`✅ Scroll API 完成: 共获取 ${processedCount} 条数据`);

  // 第三步：清理 scroll 上下文（释放资源）
  await client.clearScroll({
    scroll_id: scrollId
  });
  console.log('🧹 已清理 scroll 上下文');

  console.log('\n💡 Scroll API 适用场景：');
  console.log('   - 数据导出/备份');
  console.log('   - 批量数据处理');
  console.log('   - 不适合实时用户查询（资源占用高）');
}

// 3. 索引优化策略
async function indexOptimizationDemo() {
  console.log('\n========== 3.3 索引优化策略演示 ==========');

  // 3.1 查看索引统计信息
  console.log('\n--- 3.1 索引统计信息 ---');
  const stats = await client.indices.stats({
    index: INDEX_NAME
  });
  
  const indexStats = stats.indices[INDEX_NAME];
  console.log(`📊 索引: ${INDEX_NAME}`);
  console.log(`   文档数: ${indexStats.primaries.docs.count}`);
  console.log(`   删除文档数: ${indexStats.primaries.docs.deleted}`);
  console.log(`   存储大小: ${(indexStats.primaries.store.size_in_bytes / 1024).toFixed(2)} KB`);
  console.log(`   查询次数: ${indexStats.primaries.search.query_total}`);
  console.log(`   查询总耗时: ${indexStats.primaries.search.query_time_in_millis} ms`);

  // 3.2 Force Merge 优化（合并段）
  console.log('\n--- 3.2 Force Merge 优化 ---');
  console.log('   ES 的索引由多个 segment 组成，段越多查询越慢');
  console.log('   Force Merge 可以合并段，提升查询性能');
  
  const segmentsBefore = await client.indices.segments({
    index: INDEX_NAME
  });
  
  const segmentCountBefore = Object.keys(segmentsBefore.indices[INDEX_NAME].shards).reduce((sum, shardId) => {
    return sum + segmentsBefore.indices[INDEX_NAME].shards[shardId].length;
  }, 0);
  
  console.log(`   合并前段数: ${segmentCountBefore}`);
  
  // 执行 force merge
  await client.indices.forcemerge({
    index: INDEX_NAME,
    max_num_segments: 1  // 合并为 1 个段
  });
  
  console.log('   ✅ Force Merge 完成');
  console.log('   💡 注意：只读索引适合使用，频繁更新的索引不建议');

  // 3.3 刷新间隔优化
  console.log('\n--- 3.3 刷新间隔优化 ---');
  console.log('   默认刷新间隔: 1 秒');
  console.log('   批量写入时可以增大刷新间隔提升性能');
  
  // 临时关闭自动刷新（批量导入时）
  await client.indices.putSettings({
    index: INDEX_NAME,
    settings: {
      refresh_interval: '-1'  // 关闭自动刷新
    }
  });
  console.log('   ✅ 已关闭自动刷新（适合批量导入）');

  // 模拟批量导入后，恢复刷新并手动刷新
  await client.indices.putSettings({
    index: INDEX_NAME,
    settings: {
      refresh_interval: '1s'  // 恢复自动刷新
    }
  });
  
  await client.indices.refresh({
    index: INDEX_NAME
  });
  console.log('   ✅ 已恢复自动刷新并手动刷新');

  // 3.4 查询性能测试
  console.log('\n--- 3.4 查询性能测试 ---');
  
  // 简单查询
  const start1 = Date.now();
  await client.search({
    index: INDEX_NAME,
    query: {
      match_all: {}
    },
    size: 100
  });
  const end1 = Date.now();
  console.log(`   简单查询（100 条）: ${end1 - start1} ms`);

  // 复杂查询
  const start2 = Date.now();
  await client.search({
    index: INDEX_NAME,
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: '运动 旅行',
              fields: ['note_title', 'note_body'],
              analyzer: 'ik_smart'
            }
          }
        ],
        filter: [
          { range: { priority: { gte: 3 } } },
          { term: { mood: 'energetic' } }
        ]
      }
    },
    size: 50
  });
  const end2 = Date.now();
  console.log(`   复杂查询（50 条）: ${end2 - start2} ms`);
}

// 4. 实战：批量数据导入优化
async function bulkImportOptimizationDemo() {
  console.log('\n========== 3.4 批量导入优化实战 ==========');
  
  const totalDocs = 500;
  const batchSize = 100;  // 每批 100 条
  
  console.log(`📊 准备导入 ${totalDocs} 条数据，每批 ${batchSize} 条\n`);
  
  const startTime = Date.now();
  
  // 步骤 1: 关闭刷新
  await client.indices.putSettings({
    index: INDEX_NAME,
    settings: { refresh_interval: '-1' }
  });
  console.log('✅ 步骤 1: 关闭自动刷新');
  
  // 步骤 2: 批量导入
  let imported = 0;
  const now = new Date().toISOString();
  
  for (let batch = 0; batch < totalDocs / batchSize; batch++) {
    const operations = [];
    
    for (let i = 0; i < batchSize; i++) {
      const docIndex = batch * batchSize + i + 1;
      operations.push({ index: { _index: INDEX_NAME } });
      operations.push({
        note_title: `优化导入测试 ${docIndex}`,
        note_body: `批量导入测试数据，第 ${docIndex} 条`,
        tags: ['优化测试', '批量导入'],
        mood: 'focused',
        priority: 3,
        created_at: now,
        updated_at: now
      });
    }
    
    await client.bulk({ operations });
    imported += batchSize;
    console.log(`   批次 ${batch + 1}: 已导入 ${imported}/${totalDocs}`);
  }
  
  // 步骤 3: 恢复刷新并手动刷新
  await client.indices.putSettings({
    index: INDEX_NAME,
    settings: { refresh_interval: '1s' }
  });
  
  await client.indices.refresh({ index: INDEX_NAME });
  console.log('✅ 步骤 2-3: 批量导入完成并刷新索引');
  
  // 步骤 4: Force Merge
  await client.indices.forcemerge({
    index: INDEX_NAME,
    max_num_segments: 1
  });
  console.log('✅ 步骤 4: Force Merge 完成');
  
  const endTime = Date.now();
  console.log(`\n📊 导入统计:`);
  console.log(`   总数量: ${totalDocs} 条`);
  console.log(`   总耗时: ${endTime - startTime} ms`);
  console.log(`   平均速度: ${(totalDocs / ((endTime - startTime) / 1000)).toFixed(2)} 条/秒`);
  
  console.log('\n💡 优化要点：');
  console.log('   1. 批量导入前关闭 refresh_interval');
  console.log('   2. 使用 Bulk API 而不是逐条插入');
  console.log('   3. 合理设置批次大小（通常 100-1000 条）');
  console.log('   4. 导入完成后执行 refresh 和 forcemerge');
  console.log('   5. 只在导入完成后才恢复自动刷新');
}

async function run() {
  try {
    await bulkApiDemo();
    await scrollApiDemo();
    await indexOptimizationDemo();
    await bulkImportOptimizationDemo();
    
    console.log('\n✅ 性能优化演示完成！');
    console.log('\n💡 核心学习要点：');
    console.log('1. Bulk API 比逐条插入快 10-100 倍');
    console.log('2. Scroll API 适合全量数据导出，不适合实时查询');
    console.log('3. 批量导入时关闭 refresh 提升性能');
    console.log('4. Force Merge 优化只读索引的查询性能');
    console.log('5. 监控索引统计信息，及时发现性能问题');
    console.log('6. 合理设置批次大小，平衡内存和性能');
  } catch (err) {
    console.error('❌ 演示失败:', err.message);
  }
}

run().catch((err) => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});
