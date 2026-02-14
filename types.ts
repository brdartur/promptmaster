export interface DayCurriculum {
  id: number;
  title: string;
  week: 1 | 2;
  theory: string;
  example: string;
  task: string;
  gradingCriteria: string;
}

export interface DayProgress {
  status: 'locked' | 'active' | 'completed';
  score?: number;
  feedback?: string;
  userSubmission?: string;
}

export interface UserProgress {
  [dayId: number]: DayProgress;
}

export interface GradingResult {
  passed: boolean;
  feedback: string;
  score: number;
}
