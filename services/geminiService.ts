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
        Ты — практический эксперт-ментор по Prompt Engineering. Проверь задание студента.
        
        Контекст: ${dayTitle}
        Задание: ${taskDescription}
        Критерии: ${gradingCriteria}
        
        Правила:
        1. Оценивай ПРАКТИЧЕСКУЮ применимость промпта.
        2. Если промпт решит задачу в реальном ChatGPT/Claude — ставь passed: true.
        3. Давай советы по улучшению структуры (добавление контекста, форматов, примеров).
        4. Пиши дружелюбно, но профессионально на русском языке.
        
        Выходной формат: JSON.
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
            Ты — ментор курса по промпт-инжинирингу. Твоя задача — сгенерировать практическое задание, которое может встретиться в реальной работе специалиста.
            
            ПРАВИЛА ГЕНЕРАЦИИ:
            1. Избегай абстрактной фантастики и космоса. Используй реальные сферы: Маркетинг, IT-разработка, Копирайтинг, HR, Анализ данных, Клиентский сервис.
            2. Задание должно быть понятным. Студент должен сразу понять, какую бизнес-проблему он решает.
            3. Обязательно требуй использования конкретных техник (например: "Используй Few-shot" или "Добавь Chain-of-Thought").
            4. Теория должна кратко объяснять суть техники на простом примере.
            
            СФЕРЫ ДЛЯ ЗАДАНИЙ:
            - Автоматизация ответов техподдержки.
            - Генерация сложного контент-плана для локального бизнеса.
            - Рефакторинг кода и написание документации.
            - Создание системы оценки кандидатов для рекрутера.
            - Анализ больших отзывов клиентов и выявление проблем.
            
            ОТВЕЧАЙ СТРОГО НА РУССКОМ ЯЗЫКЕ В ФОРМАТЕ JSON.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Сгенерируй одно интересное практическое задание для продвинутого уровня по промпт-инжинирингу.",
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        theory: { type: Type.STRING, description: "Простое объяснение сложной техники." },
                        example: { type: Type.STRING, description: "Понятный пример промпта." },
                        task: { type: Type.STRING, description: "Конкретное бизнес-задание." },
                        gradingCriteria: { type: Type.STRING, description: "По каким пунктам будет проверяться работа." }
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
