import { GoogleGenAI } from "@google/genai";
import { Subject, Habit, Video, TodoList } from "../types";

export const generateRecommendation = async (
  subjects: Subject[],
  habits: Habit[],
  videos: Video[],
  todos: TodoList[],
  apiKey: string
): Promise<string> => {
   if (!apiKey) {
    return "AI Assistant is offline. Please configure your API key in Settings.";
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date(today);

  // Helper to calculate streaks
  const calculateStreak = (dates: string[]): number => {
    const sortedDates = [...new Set(dates)].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    if (sortedDates.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();

    const isTodayCompleted = sortedDates.some(d => d.toISOString().split('T')[0] === today);
    if(isTodayCompleted) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    } else {
         const isYesterdayCompleted = sortedDates.some(d => d.toISOString().split('T')[0] === new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]);
         if (!isYesterdayCompleted && sortedDates.length > 0) return 0;
    }
    
    for (let i = isTodayCompleted ? 1 : 0; i < sortedDates.length; i++) {
        const date = sortedDates[i];
        const expectedDate = new Date(currentDate);
        if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  };

  const processedData = {
    subjects: subjects.map(s => {
      const allSubtopics = s.topics.flatMap(t => t.subTopics);
      const completedSubtopics = allSubtopics.filter(st => st.completed);
      const totalSubtopics = allSubtopics.length;
      return {
        name: s.name,
        progress: totalSubtopics > 0 ? (completedSubtopics.length / totalSubtopics) * 100 : 0,
        subtopics_total: totalSubtopics,
        subtopics_completed: completedSubtopics.length,
        study_streak: calculateStreak(s.sessionTimestamps)
      };
    }),
    habits: habits.map(h => ({
      name: h.name,
      category: h.category,
      current_streak: calculateStreak(h.completedDates)
    })),
    videos: videos.map(v => ({
      name: v.name,
      progress: (v.watchedDuration / (v.totalDuration || 1)) * 100
    })),
    todos: todos.map(list => {
        const incompleteTasks = list.items.filter(item => !item.completed);
        return {
            listName: list.name,
            totalTasks: list.items.length,
            incompleteTasks: incompleteTasks.length,
            overdueTasks: incompleteTasks.filter(item => item.dueDate && new Date(item.dueDate) < todayDate).length,
        }
    })
  };

  const prompt = `
    You are Chiru, a friendly and encouraging AI productivity coach. 
    A user is tracking their progress on subjects, habits, videos, and to-do lists. 
    Based on the following data, provide a short, motivational summary of their recent activity (in about 2-3 sentences) and then give one specific, actionable piece of advice to help them stay on track or improve.
    Focus on any overdue tasks if they exist.
    Address the user directly ("You're doing great..."). Keep the tone positive and empowering. The entire response should be under 75 words.
    Format your response in Markdown.

    User's Progress Data:
    ${JSON.stringify(processedData, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};

export const rewriteNotesWithAI = async (originalNote: string, userPrompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    return "AI Assistant is offline. Please configure your API key in Settings.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert writing assistant. A user has provided text from their notes and a prompt for how to modify it.
    Rewrite the text based on the user's instructions.
    Respond ONLY with the rewritten text, without any preamble, titles, or explanations.

    USER'S PROMPT:
    "${userPrompt}"

    ORIGINAL TEXT:
    ---
    ${originalNote}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error rewriting notes with AI:", error);
    return `Error: I couldn't process the request. Please try again. Details: ${error instanceof Error ? error.message : String(error)}`;
  }
};