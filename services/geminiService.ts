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

export const checkTaskSubmission = async (
  dayTitle: string,
  taskDescription: string,
  gradingCriteria: string,
  userSubmission: string
): Promise<GradingResult> => {
    
  try {
    // Create instance inside function to ensure fresh API Key usage
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
        Ты — эксперт-ментор по Prompt Engineering. 
        Ты оцениваешь задание студента для курса.
        
        Тема модуля: ${dayTitle}
        Задание: ${taskDescription}
        Критерии оценки: ${gradingCriteria}
        
        Оценивай решение пользователя строго по критериям.
        Будь конструктивным и подбадривающим, но строгим к деталям.
        Если задание не выполнено, объясни точно, чего не хватает.
        Если выполнено, похвали и отметь сильные стороны.
        ОТВЕЧАЙ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ.
      `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userSubmission,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: {
              type: Type.BOOLEAN,
              description: "Выполнено ли задание успешно.",
            },
            feedback: {
              type: Type.STRING,
              description: "Конструктивная обратная связь. Используй Markdown.",
            },
            score: {
              type: Type.INTEGER,
              description: "Оценка от 1 до 100.",
            },
          },
          required: ["passed", "feedback", "score"],
        },
      },
    });

    if (response.text) {
        return validateGradingResponse(JSON.parse(response.text));
    }
    throw new Error("Empty response from AI");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return {
      passed: false,
      feedback: `Не удалось связаться с AI ментором. Ошибка: ${error?.message || 'Unknown'}. Проверьте соединение или API ключ.`,
      score: 0
    };
  }
};

export const generateDailyTask = async (): Promise<DayCurriculum> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = `
            Ты — создатель курса по Prompt Engineering.
            Сгенерируй УНИКАЛЬНОЕ, сложное и случайное практическое упражнение для студента.
            
            Темы: Маркетинг, Кодинг, Творчество, Анализ данных, Ролевые игры, Управление кризисами.
            
            Вывод должен быть структурированным уроком:
            1. title: Цепляющее название челенджа.
            2. theory: Краткий совет или техника (2-3 предложения), связанная с заданием.
            3. example: Короткий пример input/output.
            4. task: Конкретный сложный сценарий, который пользователь должен решить, написав промпт.
            5. gradingCriteria: Что именно должно быть в их промпте?
            
            ОТВЕЧАЙ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: "Сгенерируй новое случайное ежедневное задание.",
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
        throw new Error("Empty response");
    } catch (error: any) {
        console.error("Generative Task Error", error);
        throw error;
    }
}
