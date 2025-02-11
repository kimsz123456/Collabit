export interface Portfolio {
  userCode: string;
  project: number;
  participant: number;
  description: string;
}

export interface Feedback {
  id: number;
  name: string;
  feedback: string;
  isPositive: boolean;
  code: string;
}

export interface Description {
  key: number;
  name: string;
  description: string;
  code: string;
}

export interface TotalScore {
  id: number;
  totalParticipant: number;
  sympathy: number;
  listening: number;
  expression: number;
  problemSolving: number;
  conflictResolution: number;
  leadership: number;
  updatedAt: Date;
}
