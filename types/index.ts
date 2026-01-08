export type ModelName = 'Claude 3.5' | 'GPT-4o' | 'Llama 3' | 'DeepSeek' | 'GLM-4' | 'Mistral';

export interface AppCard {
  id: string;
  title: string;
  author: string;
  model: ModelName;
  thumbnail: string;
  likes: number;
}

export interface ModelConfig {
  name: ModelName;
  tokens?: number;
  time?: string;
  color: string;
}

export interface StepConfig {
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  icon: string;
  codePreview?: string;
}
