import { OpenAI } from "openai";

export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = process.env.RECAPTCHA_BASE_URL + 'recaptcha/api/siteverify';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { recaptchaToken, name, judgment, movingLine, line, xiang } = body;

    // Verify reCAPTCHA token
    const recaptchaRes = await fetch(`${RECAPTCHA_VERIFY_URL}?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`, {
      method: "POST",
    });

    const recaptchaData = await recaptchaRes.json();

    if (!recaptchaData.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "reCAPTCHA verification failed",
      });
    }


    // Proceed with OpenAI request if reCAPTCHA is valid
    const completion = await openai.chat.completions.create({
      model: "deepseek-reasoner",
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
          【动爻】第${movingLine}爻："${line}"
          【象辞】"${xiang}"
          请用专业周易知识综合分析，生成20字运势总结"`,
        },
      ],
      temperature: 0.8,
      max_tokens: 50,
      response_format: { type: "text" },
    });

    const result = completion.choices[0].message.content
        ?.trim()
        .replace(/["【】]/g, "");

    return { result };
  } catch (error) {
    console.error("Server Error:", error);
    return sendError(event, createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "AI 服务暂时不可用",
    }));
  }
});
