export interface Skill {
  name: string;
  score: number;
  description?: string;
  feedback?: string;
  positive?: boolean;
}

export interface ChartRangeData {
  minScore: number;
  maxScore: number;
}

export interface SkillData {
  sympathy: Skill;
  listening: Skill;
  expression: Skill;
  problemSolving: Skill;
  conflictResolution: Skill;
  leadership: Skill;
}

// todo : 추후 백엔드 api 정리되면 옵셔널 제거
export type ChartResponse = {
  hexagon: ChartRangeData & SkillData;
  progress: SkillData;
  wordCloud?: WordCloudResponse;
  aiSummary?: AISummaryResponse;
  timeline?: Timeline[];
  info?: ReportInfoResponse;
};

export type WordWeight = {
  text: string;
  value: number;
};

export type WordCloudResponse = {
  strength: WordWeight[];
  weakness: WordWeight[];
};

export type AISummaryResponse = {
  strength: string;
  weakness: string;
};

export type Timeline = SkillData & {
  projectName: string;
  organization: string;
  completedAt: Date;
};

export type TimelineResponse = ChartRangeData & {
  timeline: Timeline[];
};

export type ReportStatusResponse = {
  totalParticipant: number;
  exist: boolean;
  update: boolean;
};

export type ReportInfoResponse = {
  nickname: string;
  participant: number;
  project: number;
};
