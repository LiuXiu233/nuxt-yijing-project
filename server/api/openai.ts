import { OpenAI } from "openai";

export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL, // 若使用代理需配置
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event); // 读取请求体
    const { name, judgment, movingLine, line, xiang } = body;

    const completion = await openai.chat.completions.create({
      model: "deepseek-reasoner", // 推荐使用最新模型
      messages: [
        {
          role: "system",
          content: `你是一位资深的周易解卦大师，请遵循以下规范：
                      1. 使用现代中文口语化解卦（禁用文言文）
                      2. 保持回答在20字长度内
                      3. 规避任何政治敏感内容
                      4. 格式要求：主结论+分句建议+总结预测
                      5. 使用通俗易懂的现代中文表达，让用户完全理解卦象含义
                      6. 在结果中不要显示格式，直接拼接成完整的句子
          `,
        },
        {
          role: "user",
          content: `解析卦象：
          【主卦】${name}
          【卦辞】"${judgment}"
          【动爻】第${movingLine}爻："${line}
          【象辞】"${xiang}"
          请用专业周易知识综合分析，生成20字运势总结"`,
        },
      ],
      temperature: 0.8,
      max_tokens: 50,
      response_format: { type: "text" }, // 强制文本输出
    });

    // 处理 OpenAI 响应结构
    const result = completion.choices[0].message.content
      ?.trim()
      .replace(/["【】]/g, "");

    return {
      result,
    };
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return sendError(event, createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "AI 服务暂时不可用",
    }));
  }
});
