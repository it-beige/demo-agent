import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200'
});

const INDEX_NAME = 'travel_journal';

/**
 * 进阶学习方向 2：高级功能
 * 演示高亮显示、分页查询、排序
 */

// 1. 高亮显示（Highlighting）
async function highlightingDemo() {
  console.log('\n========== 2.1 高亮显示演示 ==========');
  
  const res = await client.search({
    index: INDEX_NAME,
    query: {
      multi_match: {
        query: '骑行 跑步',
        fields: ['note_title', 'note_body'],
        analyzer: 'ik_smart'
      }
    },
    highlight: {
      fields: {
        note_title: {
          // 使用 <em> 标签包裹匹配的关键词
          type: 'plain'
        },
        note_body: {
          // 可以自定义高亮标签
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
          // 返回的片段数量
          number_of_fragments: 3,
          // 每个片段的字符数
          fragment_size: 150
        }
      }
    }
  });

  console.log(`📊 找到 ${res.hits.hits.length} 条结果（带高亮）:\n`);
  
  res.hits.hits.forEach((hit, idx) => {
    console.log(`结果 ${idx + 1} (评分: ${hit._score}):`);
    console.log(`  ID: ${hit._id}`);
    console.log(`  标题: ${hit._source.note_title}`);
    
    // 显示高亮内容
    if (hit.highlight) {
      if (hit.highlight.note_title) {
        console.log(`  高亮标题: ${hit.highlight.note_title.join(' | ')}`);
      }
      if (hit.highlight.note_body) {
        console.log(`  高亮正文片段:`);
        hit.highlight.note_body.forEach((fragment, fIdx) => {
          console.log(`    [${fIdx + 1}] ${fragment}`);
        });
      }
    }
    console.log('');
  });
}

// 2. 分页查询（Pagination）
async function paginationDemo() {
  console.log('\n========== 2.2 分页查询演示 ==========');
  
  // 先插入更多测试数据用于分页演示
  const now = new Date().toISOString();
  const bulkDocs = [];
  
  for (let i = 1; i <= 15; i++) {
    bulkDocs.push({ index: { _index: INDEX_NAME } });
    bulkDocs.push({
      note_title: `测试日记 ${i}`,
      note_body: `这是第 ${i} 条测试日记，用于演示分页功能。今天做了一些运动和生活记录。`,
      tags: ['测试', i % 2 === 0 ? '运动' : '生活'],
      mood: i % 3 === 0 ? 'relaxed' : (i % 3 === 1 ? 'energetic' : 'calm'),
      priority: (i % 3) + 1,
      created_at: now,
      updated_at: now
    });
  }
  
  await client.bulk({ refresh: true, operations: bulkDocs });
  console.log('✅ 已插入 15 条测试数据\n');

  // 分页参数
  const pageSize = 5;
  const totalPages = 3;

  for (let page = 1; page <= totalPages; page++) {
    const from = (page - 1) * pageSize;
    
    const res = await client.search({
      index: INDEX_NAME,
      query: {
        match: {
          tags: '测试'
        }
      },
      from: from,      // 跳过前 from 条
      size: pageSize,  // 返回 size 条
      sort: [
        { note_title: 'asc' }
      ]
    });

    console.log(`📄 第 ${page} 页 (跳过 ${from} 条，返回 ${pageSize} 条):`);
    console.log(`   总命中数: ${res.hits.total.value} 条`);
    console.log(`   总页数: ${Math.ceil(res.hits.total.value / pageSize)} 页\n`);
    
    res.hits.hits.forEach((hit, idx) => {
      console.log(`   ${idx + 1}. ${hit._source.note_title} (优先级: ${hit._source.priority})`);
    });
    console.log('');
  }
}

// 3. 复杂排序（Sorting）
async function sortingDemo() {
  console.log('\n========== 2.3 复杂排序演示 ==========');
  
  // 3.1 单字段排序
  console.log('\n--- 3.1 按优先级降序排序 ---');
  const res1 = await client.search({
    index: INDEX_NAME,
    query: {
      match_all: {}
    },
    sort: [
      { priority: 'desc' }
    ],
    size: 5
  });

  res1.hits.hits.forEach((hit, idx) => {
    console.log(`   ${idx + 1}. ${hit._source.note_title} (优先级: ${hit._source.priority})`);
  });

  // 3.2 多字段排序
  console.log('\n--- 3.2 多字段排序（优先级降序 + 时间降序）---');
  const res2 = await client.search({
    index: INDEX_NAME,
    query: {
      match_all: {}
    },
    sort: [
      { priority: 'desc' },
      { created_at: 'desc' }
    ],
    size: 5
  });

  res2.hits.hits.forEach((hit, idx) => {
    console.log(`   ${idx + 1}. ${hit._source.note_title} (优先级: ${hit._source.priority}, 时间: ${hit._source.created_at})`);
  });

  // 3.3 按相关性评分排序（默认）
  console.log('\n--- 3.3 按相关性评分排序 ---');
  const res3 = await client.search({
    index: INDEX_NAME,
    query: {
      multi_match: {
        query: '运动 骑行',
        fields: ['note_title', 'note_body'],
        analyzer: 'ik_smart'
      }
    },
    size: 5
  });

  res3.hits.hits.forEach((hit, idx) => {
    console.log(`   ${idx + 1}. ${hit._source.note_title} (评分: ${hit._score.toFixed(4)})`);
  });

  // 3.4 自定义排序：先按评分，再按优先级
  console.log('\n--- 3.4 混合排序（评分 + 优先级）---');
  const res4 = await client.search({
    index: INDEX_NAME,
    query: {
      multi_match: {
        query: '运动',
        fields: ['note_title', 'note_body'],
        analyzer: 'ik_smart'
      }
    },
    sort: [
      { _score: 'desc' },
      { priority: 'desc' }
    ],
    size: 5
  });

  res4.hits.hits.forEach((hit, idx) => {
    console.log(`   ${idx + 1}. ${hit._source.note_title} (评分: ${hit._score.toFixed(4)}, 优先级: ${hit._source.priority})`);
  });
}

// 4. 实战：带高亮和分页的完整搜索
async function completeSearchDemo() {
  console.log('\n========== 2.4 完整搜索实战（高亮 + 分页 + 排序） ==========');
  
  const searchQuery = '运动';
  const page = 1;
  const pageSize = 3;

  const res = await client.search({
    index: INDEX_NAME,
    query: {
      multi_match: {
        query: searchQuery,
        fields: ['note_title^2', 'note_body'],
        analyzer: 'ik_smart'
      }
    },
    highlight: {
      fields: {
        note_title: {},
        note_body: {
          pre_tags: '<mark>',
          post_tags: '</mark>',
          fragment_size: 100,
          number_of_fragments: 2
        }
      }
    },
    sort: [
      { _score: 'desc' },
      { priority: 'desc' },
      { created_at: 'desc' }
    ],
    from: (page - 1) * pageSize,
    size: pageSize
  });

  console.log(`🔍 搜索关键词: "${searchQuery}"`);
  console.log(`📊 总命中: ${res.hits.total.value} 条`);
  console.log(`📄 当前页: ${page}, 每页: ${pageSize} 条\n`);

  res.hits.hits.forEach((hit, idx) => {
    console.log(`结果 ${idx + 1} (评分: ${hit._score.toFixed(4)}):`);
    console.log(`  ID: ${hit._id}`);
    console.log(`  标题: ${hit._source.note_title}`);
    
    if (hit.highlight?.note_title) {
      console.log(`  高亮标题: ${hit.highlight.note_title[0]}`);
    }
    
    if (hit.highlight?.note_body) {
      console.log(`  高亮摘要: ${hit.highlight.note_body[0]}`);
    }
    
    console.log(`  优先级: ${hit._source.priority}`);
    console.log(`  心情: ${hit._source.mood}`);
    console.log('');
  });
}

async function run() {
  try {
    await highlightingDemo();
    await paginationDemo();
    await sortingDemo();
    await completeSearchDemo();
    
    console.log('\n✅ 高级功能演示完成！');
    console.log('\n💡 学习要点：');
    console.log('1. highlight 可以让用户看到匹配关键词的位置');
    console.log('2. from + size 实现分页，注意深度分页性能问题');
    console.log('3. sort 支持多字段排序和自定义排序规则');
    console.log('4. 可以组合使用高亮、分页、排序构建完整搜索功能');
    console.log('5. fragment_size 控制高亮片段长度，适合做摘要');
  } catch (err) {
    console.error('❌ 演示失败:', err.message);
  }
}

run().catch((err) => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});
