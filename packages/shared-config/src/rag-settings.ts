export type RagIndustryPreset = 'general' | 'fastener'

export interface TenantRagSettings {
  enabled: boolean
  industryPreset: RagIndustryPreset
  chunkSize: number
  chunkOverlap: number
  retrievalTopK: number
  ingestionStructureTemplate: string
  answerStructureTemplate: string
  retrievalPromptTemplate: string
  fallbackPromptTemplate: string
}

export interface RagIndustryPresetOption {
  value: RagIndustryPreset
  label: string
  description: string
}

type RagPresetDefinition = Omit<TenantRagSettings, 'enabled'> & {
  label: string
  description: string
}

const RAG_PRESET_DEFINITIONS: Record<RagIndustryPreset, RagPresetDefinition> = {
  general: {
    label: '通用知识库',
    description: '适合通用企业资料、产品文档、流程说明等常规知识问答。',
    industryPreset: 'general',
    chunkSize: 500,
    chunkOverlap: 80,
    retrievalTopK: 3,
    ingestionStructureTemplate: ['标题', '摘要', '关键事实', '参数/步骤', '来源'].join('\n'),
    answerStructureTemplate: ['结论', '依据', '补充说明', '来源'].join('\n'),
    retrievalPromptTemplate: [
      '你正在回答租户知识库问题。',
      '请严格基于命中资料回答：{{query}}',
      '若资料不足，请明确说明资料未直接命中。'
    ].join('\n'),
    fallbackPromptTemplate: [
      '当前租户资料未直接命中。',
      '请对问题“{{query}}”给出通用但谨慎的答复。',
      '不要编造价格、参数或交付承诺。'
    ].join('\n')
  },
  fastener: {
    label: '紧固件行业',
    description: '适合螺栓、螺母、螺钉、垫圈等规格、材质、标准、强度等级类知识问答。',
    industryPreset: 'fastener',
    chunkSize: 640,
    chunkOverlap: 96,
    retrievalTopK: 5,
    ingestionStructureTemplate: [
      '产品名称',
      '品类',
      '标准（GB/DIN/ISO/ANSI）',
      '材质',
      '强度等级',
      '规格尺寸',
      '表面处理',
      '包装/交期',
      '应用场景',
      '来源'
    ].join('\n'),
    answerStructureTemplate: ['结论', '适用规格/标准', '材质/等级', '注意事项', '来源'].join('\n'),
    retrievalPromptTemplate: [
      '你正在回答紧固件行业知识问题。',
      '优先识别标准、材质、强度等级、规格尺寸、表面处理等字段。',
      '请严格基于命中资料回答：{{query}}。'
    ].join('\n'),
    fallbackPromptTemplate: [
      '当前紧固件资料未直接命中。',
      '请针对问题“{{query}}”给出通用但谨慎的行业说明。',
      '不得编造报价、库存、交期或认证信息。'
    ].join('\n')
  }
}

export const RAG_INDUSTRY_PRESET_OPTIONS: RagIndustryPresetOption[] = Object.values(RAG_PRESET_DEFINITIONS).map((item) => ({
  value: item.industryPreset,
  label: item.label,
  description: item.description
}))

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function isRagIndustryPreset(value: string | undefined): value is RagIndustryPreset {
  return value === 'general' || value === 'fastener'
}

export function createDefaultTenantRagSettings(preset: RagIndustryPreset = 'general'): TenantRagSettings {
  const item = RAG_PRESET_DEFINITIONS[preset]
  return {
    enabled: false,
    industryPreset: item.industryPreset,
    chunkSize: item.chunkSize,
    chunkOverlap: item.chunkOverlap,
    retrievalTopK: item.retrievalTopK,
    ingestionStructureTemplate: item.ingestionStructureTemplate,
    answerStructureTemplate: item.answerStructureTemplate,
    retrievalPromptTemplate: item.retrievalPromptTemplate,
    fallbackPromptTemplate: item.fallbackPromptTemplate
  }
}

export function normalizeTenantRagSettings(input?: Partial<TenantRagSettings> | null): TenantRagSettings {
  const preset = isRagIndustryPreset(input?.industryPreset) ? input.industryPreset : 'general'
  const defaults = createDefaultTenantRagSettings(preset)
  const chunkSize = clamp(Number(input?.chunkSize ?? defaults.chunkSize) || defaults.chunkSize, 200, 2000)
  const chunkOverlap = clamp(Number(input?.chunkOverlap ?? defaults.chunkOverlap) || defaults.chunkOverlap, 0, Math.max(0, chunkSize - 50))

  return {
    enabled: input?.enabled === true,
    industryPreset: preset,
    chunkSize,
    chunkOverlap,
    retrievalTopK: clamp(Number(input?.retrievalTopK ?? defaults.retrievalTopK) || defaults.retrievalTopK, 1, 10),
    ingestionStructureTemplate: input?.ingestionStructureTemplate?.trim() || defaults.ingestionStructureTemplate,
    answerStructureTemplate: input?.answerStructureTemplate?.trim() || defaults.answerStructureTemplate,
    retrievalPromptTemplate: input?.retrievalPromptTemplate?.trim() || defaults.retrievalPromptTemplate,
    fallbackPromptTemplate: input?.fallbackPromptTemplate?.trim() || defaults.fallbackPromptTemplate
  }
}

export function applyTenantRagPreset(
  preset: RagIndustryPreset,
  current?: Partial<TenantRagSettings> | null
): TenantRagSettings {
  const defaults = createDefaultTenantRagSettings(preset)
  return normalizeTenantRagSettings({
    ...defaults,
    enabled: current?.enabled === true,
    industryPreset: preset
  })
}
