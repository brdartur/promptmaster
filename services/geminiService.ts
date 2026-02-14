
import { GoogleGenAI, Type } from "@google/genai";
import { GradingResult, DayCurriculum } from "../types";

// Always use the prescribed initialization format as per Google GenAI guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to validate response format
const validateGradingResponse = (response: any): GradingResult => {
  if (typeof response.passed !== 'boolean' || typeof response.feedback !== 'string') {
     // Fallback if structured output fails somehow
     return {
         passed: false,
         feedback: "Error parsing AI response. Please try again.",
         score: 0
     }
  }
  return response as GradingResult;
}

const validateTaskResponse = (response: any): DayCurriculum => {
    // Basic validation to ensure we have the required fields
    return {
        id: 999, // Placeholder ID for generated tasks
        week: 2, // Treated as advanced
        title: response.title || "Daily Challenge",
        theory: response.theory || "Practice your skills.",
        example: response.example || "No example provided.",
        task: response.task || "Complete the prompt.",
        gradingCriteria: response.gradingCriteria || "Standard criteria."
    };
}

export const checkTaskSubmission = async (
  dayTitle: string,
  taskDescription: string,
  gradingCriteria: string,
  userSubmission: string
): Promise<GradingResult> => {
    
  try {
      // Prompt engineering assessment is a complex reasoning task, requiring gemini-3-pro-preview
      const systemInstruction = `
        You are an expert Prompt Engineering Mentor. 
        You are grading a student's submission for a specific day of a course.
        
        Current Module: ${dayTitle}
        Task: ${taskDescription}
        Grading Criteria: ${gradingCriteria}
        
        Evaluate the User Submission strictly based on the Grading Criteria.
        Be constructive, encouraging, but firm on the criteria.
        If they fail, explain exactly what is missing based on the theory.
        If they pass, give a brief compliment and explain why it was good.
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
              description: "Whether the user successfully completed the task based on criteria.",
            },
            feedback: {
              type: Type.STRING,
              description: "Constructive feedback explaining the grade. Use Markdown formatting.",
            },
            score: {
              type: Type.INTEGER,
              description: "A score from 1 to 100 indicating quality.",
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

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      passed: false,
      feedback: "Failed to connect to the AI Mentor. Please check your connection or API key and try again.",
      score: 0
    };
  }
};

export const generateDailyTask = async (): Promise<DayCurriculum> => {
    try {
        // Creative curriculum generation involves complex reasoning, utilizing gemini-3-pro-preview
        const systemInstruction = `
            You are a Prompt Engineering Course Creator.
            Generate a UNIQUE, challenging, and random practical exercise for a student.
            
            Topics can vary: Marketing, Coding, Creative Writing, Data Analysis, Roleplaying, Crisis Management.
            
            The output must be a structured lesson containing:
            1. Title: Catchy title for the challenge.
            2. Theory: A brief (2-3 sentences) tip or technique related to the task.
            3. Example: A short example of input/output relevant to the technique.
            4. Task: A specific, hard scenario the user must solve by writing a prompt.
            5. GradingCriteria: What specifically should be in their prompt?
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: "Generate a new random daily challenge.",
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
    } catch (error) {
        console.error("Generative Task Error", error);
        throw error;
    }
}
