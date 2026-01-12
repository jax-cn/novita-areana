import { getModelClient, models, LLMModel, LLMModelConfig } from './models'
import { wrapLanguageModel, LanguageModel } from 'ai'
import { devToolsMiddleware } from '@ai-sdk/devtools'

export type { LLMModel, LLMModelConfig }
export { models }

export function getModelClientWithDevTools(model: LLMModel, config: LLMModelConfig): LanguageModel {
  const rawModel = getModelClient(model, config)

  if (process.env.NODE_ENV === 'development') {
    return wrapLanguageModel({
      model: rawModel,
      middleware: devToolsMiddleware(),
    })
  }

  return rawModel
}
