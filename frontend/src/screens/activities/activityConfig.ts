export interface Stage {
  id: number;
  label: string;
  desc: string;
}

export const ACTIVITY_STAGES: Record<string, Stage[]> = {
  counting: [
    { id: 1, label: 'Stage 1', desc: '1 – 10' },
    { id: 2, label: 'Stage 2', desc: '1 – 25' },
    { id: 3, label: 'Stage 3', desc: '1 – 50' },
    { id: 4, label: 'Stage 4', desc: '1 – 100' },
  ],
  alphabet: [
    { id: 1, label: 'Stage 1', desc: 'A – M' },
    { id: 2, label: 'Stage 2', desc: 'N – Z' },
    { id: 3, label: 'Stage 3', desc: 'A – Z' },
  ],
  colors: [
    { id: 1, label: 'Stage 1', desc: '6 Colors' },
    { id: 2, label: 'Stage 2', desc: '12 Colors' },
    { id: 3, label: 'Stage 3', desc: 'All 20' },
  ],
  shapes: [
    { id: 1, label: 'Stage 1', desc: 'Basic 5' },
    { id: 2, label: 'Stage 2', desc: 'More 5' },
    { id: 3, label: 'Stage 3', desc: 'All 15' },
  ],
  connect: [
    { id: 1, label: 'Easy',   desc: '4 Pairs' },
    { id: 2, label: 'Medium', desc: '6 Pairs' },
    { id: 3, label: 'Hard',   desc: '8 Pairs' },
  ],
  drawing: [
    { id: 1, label: 'Starter', desc: '6 Colors' },
    { id: 2, label: 'Artist',  desc: '12 Colors' },
    { id: 3, label: 'Pro',     desc: 'All Tools' },
  ],
};

export function nextLockedStage(activityType: string, completedStages: number[]): number {
  const stages = ACTIVITY_STAGES[activityType] ?? [];
  for (const s of stages) {
    if (!completedStages.includes(s.id)) return s.id;
  }
  return stages[stages.length - 1]?.id ?? 1;
}
