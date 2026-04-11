<template>
  <section class="panel agent-docs-panel">
    <header class="panel-head">
      <div>
        <h2>Agent 文档</h2>
        <p class="panel-hint">查看并修改导入后生成的中文 agent 文档包。</p>
      </div>
      <button type="button" class="ghost-btn" :disabled="busy" @click="$emit('refresh')">刷新</button>
    </header>

    <div v-if="items.length" class="agent-docs-layout">
      <aside class="doc-list">
        <button
          v-for="item in items"
          :key="item.fileName"
          type="button"
          class="doc-tab"
          :class="{ active: item.fileName === modelValue }"
          @click="$emit('update:modelValue', item.fileName)"
        >
          {{ item.fileName }}
        </button>
      </aside>

      <div class="doc-editor">
        <label class="editor-label">
          <span>{{ activeItem?.fileName || '未选择文件' }}</span>
          <textarea
            :value="activeItem?.content || ''"
            rows="18"
            spellcheck="false"
            @input="onInput"
          />
        </label>
        <div class="panel-actions">
          <button type="button" :disabled="busy || !activeItem" @click="saveCurrent">保存文档</button>
        </div>
      </div>
    </div>

    <p v-else class="panel-hint">当前还没有生成 agent 文档。请先执行一次资料同步。</p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: Array<{ fileName: string; content: string }>
  modelValue?: string
  busy?: boolean
}>()

const emit = defineEmits<{
  refresh: []
  save: [payload: { fileName: string; content: string }]
  'update:modelValue': [fileName: string]
}>()

const localContent = ref('')

const activeItem = computed(() => props.items.find((item) => item.fileName === props.modelValue) || props.items[0] || null)

watch(
  () => activeItem.value?.content,
  (value) => {
    localContent.value = value || ''
  },
  { immediate: true }
)

watch(
  () => activeItem.value?.fileName,
  (value) => {
    if (value && value !== props.modelValue) {
      emit('update:modelValue', value)
    }
  },
  { immediate: true }
)

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement | null
  if (!target) {
    return
  }

  localContent.value = target.value
}

function saveCurrent() {
  if (!activeItem.value) {
    return
  }

  emit('save', {
    fileName: activeItem.value.fileName,
    content: localContent.value
  })
}
</script>

<style scoped>
.agent-docs-panel { display: grid; gap: 16px; }
.panel-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.panel-head h2 { margin: 0; }
.panel-hint { margin: 6px 0 0; color: #607888; }
.agent-docs-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; }
.doc-list { display: grid; gap: 8px; align-content: start; }
.doc-tab { text-align: left; padding: 12px; border-radius: 12px; border: 1px solid #d7e3eb; background: #f8fbfd; color: #21425b; font-weight: 700; }
.doc-tab.active { background: #14384a; color: #f2f8fb; border-color: #14384a; }
.doc-editor { display: grid; gap: 12px; }
.editor-label { display: grid; gap: 8px; }
.editor-label span { font-weight: 700; color: #21425b; }
.editor-label textarea { min-height: 420px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; padding: 12px; border-radius: 12px; border: 1px solid #cfd9e2; }
.panel-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.ghost-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 12px; border-radius: 12px; border: 1px solid #cfd9e2; background: white; color: #21425b; cursor: pointer; font-weight: 600; }
button { padding: 12px; border-radius: 12px; border: 0; background: #0a7ea4; color: white; font-weight: 700; }
@media (max-width: 900px) {
  .panel-head { display: grid; }
  .agent-docs-layout { grid-template-columns: 1fr; }
}
</style>
