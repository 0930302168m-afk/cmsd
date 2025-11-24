import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const suggestTaskBreakdown = async (taskTitle: string, subject: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("API Key missing");
    return ["กรุณาตรวจสอบ API Key"];
  }

  try {
    const model = ai.models;
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `ช่วยวางแผนงานย่อยสำหรับงานการบ้านหัวข้อ "${taskTitle}" วิชา "${subject}" ให้หน่อย ขอเป็นรายการสั้นๆ 3-5 ข้อ ภาษาไทย เพื่อให้ทำเสร็จทันเวลา`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text);
    }
    return [];

  } catch (error) {
    console.error("Gemini Error:", error);
    return ["ไม่สามารถเชื่อมต่อ AI ได้ในขณะนี้"];
  }
};
