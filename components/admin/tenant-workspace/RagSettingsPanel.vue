<template>
  <section class="panel rag-settings-panel">
    <header class="panel-head">
      <div>
        <h2>检索增强设置</h2>
        <p class="panel-hint">管理员可按租户控制是否启用检索增强，并维护行业模板、分块参数和提示词模板。</p>
      </div>
      <div class="panel-actions">
        <button type="button" class="ghost-btn" :disabled="busy" @click="$emit('applyPreset', settings.industryPreset)">应用当前行业默认模板</button>
        <button type="button" class="ghost-btn" :disabled="busy" @click="$emit('resetPreset')">恢复默认值</button>
      </div>
    </header>

    <div class="settings-grid">
      <label class="toggle-card">
        <span>启用检索增强</span>
        <input v-model="settings.enabled" type="checkbox" />
      </label>

      <label>
        <span>行业默认模板</span>
        <select v-model="settings.industryPreset">
          <option v-for="option in presetOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <small>{{ activePresetDescription }}</small>
      </label>

      <label>
        <span>分块大小</span>
        <input v-model.number="settings.chunkSize" type="number" min="200" max="2000" step="10" />
      </label>

      <label>
        <span>分块重叠</span>
        <input v-model.number="settings.chunkOverlap" type="number" min="0" max="500" step="10" />
      </label>

      <label>
        <span>检索返回数量</span>
        <input v-model.number="settings.retrievalTopK" type="number" min="1" max="10" step="1" />
      </label>
    </div>

    <div class="template-grid">
      <label class="template-block">
        <span>导入结构模板</span>
        <textarea v-model.trim="settings.ingestionStructureTemplate" rows="10" spellcheck="false" />
        <small>每行一个结构字段，后续资料同步会按该模板构造结构化前导内容并参与切块。</small>
      </label>

      <label class="template-block">
        <span>回答结构模板</span>
        <textarea v-model.trim="settings.answerStructureTemplate" rows="10" spellcheck="false" />
        <small>用于约束回答输出结构，例如结论、规格、来源、注意事项等。</small>
      </label>

      <label class="template-block">
        <span>检索回答提示词模板</span>
        <textarea v-model.trim="settings.retrievalPromptTemplate" rows="8" spellcheck="false" />
        <small>支持系统占位符：用户问题、品牌名称、回答结构模板。</small>
      </label>

      <label class="template-block">
        <span>未命中提示词模板</span>
        <textarea v-model.trim="settings.fallbackPromptTemplate" rows="8" spellcheck="false" />
        <small>用于资料未命中时的通用谨慎回答模板。</small>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  RAG_INDUSTRY_PRESET_OPTIONS,
  type RagIndustryPreset,
  type TenantRagSettings
} from '../../../packages/shared-config/src/rag-settings.ts'

const props = defineProps<{
  settings: TenantRagSettings
  busy?: boolean
}>()

defineEmits<{
  applyPreset: [preset: RagIndustryPreset]
  resetPreset: []
}>()

const presetOptions = RAG_INDUSTRY_PRESET_OPTIONS

const activePresetDescription = computed(() => {
  return presetOptions.find((item) => item.value === props.settings.industryPreset)?.description || ''
})
</script>

<style scoped>
.rag-settings-panel { display: grid; gap: 16px; }
.panel-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.panel-head h2 { margin: 0; }
.panel-hint { margin: 6px 0 0; color: #607888; }
.panel-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.settings-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.settings-grid label, .template-block { display: grid; gap: 8px; color: #21425b; }
.settings-grid span, .template-block span { font-weight: 700; }
.settings-grid small, .template-block small { color: #607888; line-height: 1.6; }
.toggle-card { padding: 14px; border-radius: 14px; border: 1px solid #d7e3eb; background: #f8fbfd; align-content: start; }
.toggle-card input { width: 18px; height: 18px; margin: 0; }
.template-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.template-block textarea { min-height: 180px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.ghost-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 12px; border-radius: 12px; border: 1px solid #cfd9e2; background: white; color: #21425b; cursor: pointer; font-weight: 600; }
code { white-space: nowrap; }
@media (max-width: 1100px) {
  .panel-head { display: grid; }
  .settings-grid, .template-grid { grid-template-columns: 1fr; }
}
</style>
