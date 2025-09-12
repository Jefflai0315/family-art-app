// Animation model configurations
export interface AnimationModelConfig {
  name: string;
  displayName: string;
  apiUrl: string;
  duration: number;
  resolution: string;
  payload: Record<string, string | number | boolean>;
  description: string;
}

export const ANIMATION_MODELS = {
  HAILUO_FAST: {
    name: "hailuo-02",
    displayName: "Hailuo Fast",
    apiUrl: "https://api.wavespeed.ai/api/v3/minimax/hailuo-02/fast",
    duration: 6,
    resolution: "HD",
    payload: {
      enable_prompt_expansion: true,
      go_fast: true,
    },
    description:
      "High-quality animations with prompt expansion and fast processing",
  },
  SEEDANCE: {
    name: "seedance-v1-lite",
    displayName: "Seedance Lite",
    apiUrl:
      "https://api.wavespeed.ai/api/v3/bytedance/seedance-v1-lite-i2v-480p",
    duration: 5,
    resolution: "480P",
    payload: {
      seed: -1,
    },
    description: "Lightweight model with good performance and lower cost",
  },
} as const;

export type AnimationModelType = keyof typeof ANIMATION_MODELS;

// Default model - can be changed via environment variable
export const getDefaultModel = (): AnimationModelType => {
  const envModel = process.env.ANIMATION_MODEL as AnimationModelType;
  if (envModel && envModel in ANIMATION_MODELS) {
    return envModel;
  }
  return "SEEDANCE"; // Default
};

// Get model configuration
export const getModelConfig = (
  modelType: AnimationModelType = getDefaultModel()
): AnimationModelConfig => {
  return ANIMATION_MODELS[modelType];
};

// Get all available models
export const getAllModels = (): Record<string, AnimationModelConfig> => {
  return ANIMATION_MODELS;
};
