import { GoogleGenAI, Type } from "@google/genai";
import { GradingResult, DayCurriculum } from "../types";

// Helper function to validate response format
const validateGradingResponse = (response: any): GradingResult => {
  if (typeof response.passed !== 'boolean' || typeof response.feedback !== 'string') {
     return {
         passed: false,
         feedback: "Ошибка разбора ответа AI. Пожалуйста, попробуйте еще раз.",
         score: 0
     }
  }
  return response as GradingResult;
}

const validateTaskResponse = (response: any): DayCurriculum => {
    return {
        id: 999,
        week: 2,
        title: response.title || "Daily Challenge",
        theory: response.theory || "Практикуйте свои навыки.",
        example: response.example || "Пример не предоставлен.",
        task: response.task || "Выполните задание.",
        gradingCriteria: response.gradingCriteria || "Стандартные критерии."
    };
}

const handleApiError = (error: any): string => {
  console.error("Gemini API Error Detail:", error);
  const msg = error?.message || "";
  
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    return "Лимит запросов исчерпан. Пожалуйста, подождите 1 минуту. Бесплатный API имеет ограничения на частоту запросов.";
  }
  if (msg.includes('limit: 0') || msg.includes('not found')) {
    return "Эта модель недоступна для вашего ключа. Мы автоматически переключились на Flash-версию. Если ошибка повторяется, попробуйте создать новый проект в Google AI Studio.";
  }
  return `Ошибка: ${msg || "Не удалось связаться с AI"}. Проверьте соединение.`;
}

export const checkTaskSubmission = async (
  dayTitle: string,
  taskDescription: string,
  gradingCriteria: string,
  userSubmission: string
): Promise<GradingResult> => {
    
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
        Ты — эксперт по Prompt Engineering. Оценивай задание студента.
        Тема: ${dayTitle}
        Задание: ${taskDescription}
        Критерии: ${gradingCriteria}
        Отвечай строго на русском языке в формате JSON.
      `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: userSubmission,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
            score: { type: Type.INTEGER },
          },
          required: ["passed", "feedback", "score"],
        },
      },
    });

    if (response.text) {
        return validateGradingResponse(JSON.parse(response.text));
    }
    throw new Error("Пустой ответ");
  } catch (error: any) {
    return {
      passed: false,
      feedback: handleApiError(error),
      score: 0
    };
  }
};

export const generateDailyTask = async (): Promise<DayCurriculum> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = `
            Ты — создатель курса. Сгенерируй случайное сложное задание по промпт-инжинирингу.
            Темы: Кодинг, Творчество, Аналитика.
            Отвечай строго на русском в JSON.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Сгенерируй уникальный челендж.",
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        theory: { type: Type.STRING },
                        example: { type: Type.STRING },
                        task: { type: Type.STRING },
                        gradingCriteria: { type: Type.STRING }
                    },
                    required: ["title", "theory", "example", "task", "gradingCriteria"]
                }
            }
        });

        if (response.text) {
            return validateTaskResponse(JSON.parse(response.text));
        }
        throw new Error("Пустой ответ");
    } catch (error: any) {
        throw new Error(handleApiError(error));
    }
}
