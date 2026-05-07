import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "localhost:19530",
});

async function checkCollections() {
  try {
    const collections = await client.listCollections();
    console.log("📦 Milvus 中的集合列表:");
    console.log(collections.data);
    
    if (collections.data.length === 0) {
      console.log("\n⚠️  没有可用的集合，需要先创建集合并插入数据");
    } else {
      for (const name of collections.data) {
        const stats = await client.describeCollection({ collection_name: name });
        console.log(`\n📋 集合: ${name}`);
        console.log(`   字段:`, stats.schema.fields.map(f => f.name).join(", "));
      }
    }
  } catch (error) {
    console.error("❌ 错误:", error.message);
  } finally {
    client.close();
  }
}

checkCollections();
