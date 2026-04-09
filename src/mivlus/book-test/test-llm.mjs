import "dotenv/config";
import { model } from "@/index.mjs";

async function testLLM() {
  console.log('测试 LLM 调用...');
  console.log('Model config:', {
    model: process.env.MODEL,
    baseURL: process.env.BASE_URL,
  });
  
  try {
    const prompt = "你好，请用一句话回答。";
    console.log('\n发送请求...');
    
    const response = await model.invoke(prompt, {
      timeout: 15000,
    });
    
    console.log('\n收到响应!');
    console.log('响应类型:', typeof response);
    console.log('响应对象:', response);
    console.log('Response keys:', Object.keys(response || {}));
    
    if (response.content) {
      console.log('\nContent 类型:', typeof response.content);
      console.log('Content 值:', response.content);
    }
    
  } catch (error) {
    console.error('\n错误:', error.message);
    console.error('错误类型:', error.name);
    console.error('完整错误:', error);
  }
}

testLLM();
