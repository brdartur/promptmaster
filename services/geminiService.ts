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
    return "Эта модель недоступна для вашего ключа. Попробуйте создать новый проект в Google AI Studio и получить новый ключ.";
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
        Ты — эксперт-ментор по Prompt Engineering. Твоя задача — проверить задание студента.
        
        Контекст урока: ${dayTitle}
        Задание, которое выполнял студент: ${taskDescription}
        Критерии успешности: ${gradingCriteria}
        
        Твои правила оценки:
        1. Будь строгим, но справедливым.
        2. Если в задании требовался JSON или конкретный формат — проверь его наличие.
        3. Если промпт студента "ленивый" (слишком короткий), не засчитывай его.
        4. Объясняй, КАК улучшить промпт, используя профессиональную терминологию (Context, Few-shot, Chain of Thought, Delimiters).
        
        ОТВЕЧАЙ СТРОГО НА РУССКОМ ЯЗЫКЕ. Выходной формат: JSON.
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
    throw new Error("Пустой ответ от AI.");

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
            Ты — ведущий методолог курса по Prompt Engineering. Твоя задача — сгенерировать УНИКАЛЬНЫЙ и СЛОЖНЫЙ челендж для продвинутого студента.
            
            Каждое задание должно заставлять студента использовать комбинацию техник:
            - Ролевые модели (Persona)
            - Ограничения (Negative constraints)
            - Цепочки рассуждений (Chain of Thought)
            - Структурированный вывод (JSON/Markdown/Tables)
            - Few-shot примеры
            
            Темы для заданий (выбирай случайно): 
            Архитектура ПО, Психотерапия через ИИ, Глубокая аналитика данных, Креативное письмо, Юридический разбор, Игровая механика, Космическая логистика.
            
            ОТВЕЧАЙ СТРОГО НА РУССКОМ ЯЗЫКЕ. Выходной формат: JSON.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Сгенерируй случайное экспертное задание по промпт-инжинирингу. Сделай его максимально необычным и сложным.",
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        theory: { type: Type.STRING, description: "Краткий ликбез по технике, которая поможет в задании." },
                        example: { type: Type.STRING, description: "Пример промпта или структуры." },
                        task: { type: Type.STRING, description: "Само задание." },
                        gradingCriteria: { type: Type.STRING, description: "Четкие пункты, по которым ты будешь оценивать ответ." }
                    },
                    required: ["title", "theory", "example", "task", "gradingCriteria"]
                }
            }
        });

        if (response.text) {
            return validateTaskResponse(JSON.parse(response.text));
        }
        throw new Error("Пустой ответ от AI.");
    } catch (error: any) {
        throw new Error(handleApiError(error));
    }
}
