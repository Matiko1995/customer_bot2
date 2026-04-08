<template>
  <main class="workspace-page">
    <header class="workspace-hero">
      <div>
        <NuxtLink class="inline-link" to="/admin">返回指挥台</NuxtLink>
        <p class="workspace-kicker">Tenant Workspace</p>
        <h1>{{ form.name || '租户详情' }}</h1>
        <p class="workspace-copy">这里是单租户执行中心。先看摘要，再按任务进入内容运营、会话追踪、商业化或安装配置。</p>
      </div>
      <div class="workspace-actions">
        <NuxtLink class="action-pill" :to="`/admin/chats?tenantId=${encodeURIComponent(tenantId)}`">查看聊天</NuxtLink>
        <NuxtLink class="action-pill" :to="`/admin/leads?tenantId=${encodeURIComponent(tenantId)}`">查看留资</NuxtLink>
        <NuxtLink class="action-pill" :to="`/admin/billing?tenantId=${encodeURIComponent(tenantId)}`">查看账单</NuxtLink>
      </div>
    </header>

    <section class="panel install-panel">
      <div class="stats-grid workspace-summary">
        <article class="install-card">
          <p class="install-label">聊天会话</p>
          <code>{{ overview.sessionCount }}</code>
          <p class="install-hint">最近活跃：{{ overview.lastActiveAt ? new Date(overview.lastActiveAt).toLocaleString() : '-' }}</p>
        </article>
        <article class="install-card">
          <p class="install-label">留资数量</p>
          <code>{{ overview.leadCount }}</code>
          <p class="install-hint">当前租户累计留资</p>
        </article>
        <article class="install-card">
          <p class="install-label">当前套餐</p>
          <code>{{ currentBillingPlan?.name || '未设置' }}</code>
          <p v-if="currentBillingPlan" class="install-hint">月费 {{ currentBillingPlan.monthlyFee }} / 含 {{ currentBillingPlan.includedTokens }} tokens</p>
        </article>
        <article class="install-card">
          <p class="install-label">最高频资料</p>
          <code>{{ overview.topContentSourceTitle }}</code>
          <p class="install-hint">命中 {{ overview.topContentSourceHits }} 次</p>
        </article>
        <article class="install-card">
          <p class="install-label">回答复用</p>
          <code>{{ form.reuseAnsweredQuestions === false ? '关闭' : '开启' }}</code>
          <p class="install-hint">相同问题{{ form.reuseAnsweredQuestions === false ? '每次重新生成' : '优先复用历史回答' }}</p>
        </article>
        <article class="install-card">
          <p class="install-label">租户登录</p>
          <code>{{ primaryTenantUser?.email || '未生成' }}</code>
          <p class="install-hint">{{ primaryTenantUser?.mustChangePassword ? '首次登录需改密' : '客户可直接登录查看' }}</p>
        </article>
      </div>
    </section>

    <section class="workspace-tabs">
      <button
        v-for="tab in workspaceTabs"
        :key="tab.id"
        type="button"
        class="tab-chip"
        :class="{ active: activeWorkspaceTab === tab.id }"
        @click="activeWorkspaceTab = tab.id"
      >
        <span>{{ tab.label }}</span>
        <small>{{ tab.description }}</small>
      </button>
    </section>

    <section v-if="activeWorkspaceTab === 'overview'" class="workspace-section">
      <section class="panel install-panel">
        <header>
          <h2>租户总览</h2>
          <p class="install-hint">用于快速判断当前租户的运营状态、收费情况和内容命中情况。</p>
        </header>
        <div class="stats-grid">
          <article class="install-card">
            <p class="install-label">最近账单金额</p>
            <code>{{ overview.latestBillingAmount }}</code>
            <p class="install-hint">{{ latestBillingSummary?.month || '暂无账单月份' }}</p>
          </article>
          <article class="install-card">
            <p class="install-label">资料命中统计</p>
            <code>{{ contentStats.length }}</code>
            <p class="install-hint">当前有命中的资料条目数</p>
          </article>
          <article class="install-card">
            <p class="install-label">快捷入口</p>
            <code>会话 / 留资 / 账单</code>
            <p class="install-hint">优先从上方快捷动作进入追踪</p>
          </article>
        </div>
      </section>

      <section class="panel install-panel">
        <header class="content-head">
          <div>
            <h2>复用问答记录</h2>
            <p class="install-hint">把已经回答过且重复出现的问题聚合出来，便于运营判断哪些问题应该进一步补充知识或固定话术。</p>
          </div>
          <div class="faq-toolbar">
            <input v-model.trim="faqKeyword" type="text" placeholder="搜索问题关键词" />
            <div class="faq-filter-group">
              <button
                v-for="option in faqFilterOptions"
                :key="option.value"
                type="button"
                class="filter-chip"
                :class="{ active: faqFilter === option.value }"
                @click="faqFilter = option.value"
              >
                {{ option.label }}
              </button>
            </div>
            <div class="faq-state" :class="{ off: form.reuseAnsweredQuestions === false }">
              {{ form.reuseAnsweredQuestions === false ? '当前不复用历史回答' : '当前启用历史回答复用' }}
            </div>
          </div>
        </header>
        <div v-if="faqSummaries.length" class="faq-grid">
          <article v-for="item in faqSummaries" :key="item.question" class="faq-card">
            <div class="faq-card-head">
              <strong>{{ item.question }}</strong>
              <div class="faq-badges">
                <span>{{ item.hits }} 次</span>
                <em v-if="item.isUnhandled">未处理</em>
                <em v-else class="done">已沉淀</em>
              </div>
            </div>
            <p>{{ item.answer }}</p>
            <div class="faq-actions">
              <button
                v-if="item.isUnhandled"
                type="button"
                class="ghost-btn"
                :disabled="saving"
                @click="openFaqEditor(item, 'standard')"
              >
                设为标准回复
              </button>
              <button
                v-if="item.isUnhandled"
                type="button"
                class="ghost-btn"
                :disabled="saving"
                @click="openFaqEditor(item, 'knowledge')"
              >
                加入知识库
              </button>
              <small>最近出现：{{ new Date(item.lastAskedAt).toLocaleString() }}</small>
            </div>
          </article>
        </div>
        <p v-else class="install-hint">当前还没有重复问题记录。</p>
        <p v-if="faqActionNotice" class="copy-notice">{{ faqActionNotice }}</p>
        <p v-if="faqActionError" class="content-error">{{ faqActionError }}</p>
      </section>

      <section v-if="faqEditor.open" class="faq-editor-overlay" @click.self="closeFaqEditor">
        <article class="faq-editor-panel">
          <header class="faq-editor-head">
            <div>
              <p class="install-label">FAQ 沉淀编辑</p>
              <h3>{{ faqEditor.mode === 'standard' ? '设为标准回复' : '加入知识库' }}</h3>
            </div>
            <button type="button" class="ghost-btn" @click="closeFaqEditor">关闭</button>
          </header>

          <div class="faq-editor-grid">
            <label>
              <span>标题</span>
              <input v-model.trim="faqEditor.title" type="text" placeholder="请输入标题" />
            </label>
            <label>
              <span>关键词</span>
              <input v-model.trim="faqEditor.keywords" type="text" placeholder="使用逗号分隔关键词" />
            </label>
            <label class="faq-editor-full">
              <span>摘要</span>
              <input v-model.trim="faqEditor.oneLiner" type="text" placeholder="一句话摘要" />
            </label>
            <label class="faq-editor-full">
              <span>内容</span>
              <textarea v-model.trim="faqEditor.content" rows="8" placeholder="编辑最终沉淀内容" />
            </label>
          </div>

          <div class="faq-editor-actions">
            <button type="button" class="ghost-btn" @click="closeFaqEditor">取消</button>
            <button type="button" :disabled="saving" @click="submitFaqEditor">{{ saving ? '保存中...' : '确认保存' }}</button>
          </div>
        </article>
      </section>

      <section class="panel install-panel">
        <header>
          <h2>资料源命中统计</h2>
          <p class="install-hint">用于内容运营查看哪些资料最常被回答引用，优先维护高频资料。</p>
        </header>
        <div v-if="contentStats.length" class="stats-grid">
          <article v-for="item in contentStats" :key="item.id" class="install-card">
            <p class="install-label">{{ item.title }}</p>
            <code>{{ item.hits }} 次命中</code>
            <p class="install-hint">类型：{{ item.type }}<span v-if="item.category"> / 分类：{{ item.category }}</span></p>
            <NuxtLink class="stats-link" :to="`/admin/chats?tenantId=${encodeURIComponent(tenantId)}&sourceId=${encodeURIComponent(item.id)}`">
              查看相关聊天
            </NuxtLink>
          </article>
        </div>
        <p v-else class="install-hint">当前暂无资料源命中记录。</p>
      </section>
    </section>

    <section v-if="activeWorkspaceTab === 'install'" class="workspace-section">
      <section class="panel install-panel">
      <header class="content-head">
        <div>
          <h2>租户登录账号</h2>
          <p class="install-hint">这里展示可直接交付给租户的登录信息。客户首次登录后应立即改密。</p>
        </div>
        <button type="button" class="ghost-btn" :disabled="issuingResetCode || !primaryTenantUser" @click="issueResetCode">
          {{ issuingResetCode ? '生成中...' : '生成重置码' }}
        </button>
      </header>
      <div class="install-grid">
        <article class="install-card">
          <p class="install-label">登录邮箱</p>
          <code>{{ primaryTenantUser?.email || form.contactEmail || '-' }}</code>
          <button
            v-if="primaryTenantUser?.email"
            type="button"
            class="ghost-btn"
            @click="copyText(primaryTenantUser.email, '租户登录邮箱已复制')"
          >
            复制
          </button>
        </article>
        <article class="install-card">
          <p class="install-label">初始密码</p>
          <code>{{ primaryTenantUser?.temporaryPassword || '-' }}</code>
          <p class="install-hint">仅建议用于首次交付。</p>
        </article>
        <article class="install-card">
          <p class="install-label">登录入口</p>
          <code>{{ activeBaseUrl }}/tenant/login</code>
          <button type="button" class="ghost-btn" @click="copyText(`${activeBaseUrl}/tenant/login`, '租户登录地址已复制')">复制</button>
        </article>
        <article class="install-card">
          <p class="install-label">最近重置码</p>
          <code>{{ latestResetCode?.previewCode || (latestResetCode ? '已通过邮件发送' : '-') }}</code>
          <p class="install-hint">{{ latestResetCode ? `有效至 ${new Date(latestResetCode.expiresAt).toLocaleString()} / ${latestResetCode.provider}` : '点击上方按钮生成' }}</p>
        </article>
      </div>
      <p v-if="resetCodeNotice" class="copy-notice">{{ resetCodeNotice }}</p>
      <p v-if="resetCodeError" class="content-error">{{ resetCodeError }}</p>
      </section>

      <section class="panel install-panel">
      <header class="install-head">
        <div>
          <h2>安装代码</h2>
          <p>为客户站点生成可直接粘贴的接入代码。脚本地址和 API 地址会指向当前选择的发布环境。</p>
        </div>
        <div class="env-switch">
          <button
            type="button"
            class="ghost-btn"
            :class="{ active: installEnv === 'production' }"
            @click="installEnv = 'production'"
          >
            正式环境
          </button>
          <button
            type="button"
            class="ghost-btn"
            :class="{ active: installEnv === 'staging' }"
            @click="installEnv = 'staging'"
          >
            测试环境
          </button>
        </div>
      </header>

      <div class="install-grid">
        <article class="install-card">
          <p class="install-label">Tenant ID</p>
          <code>{{ form.id || tenantId }}</code>
          <button type="button" class="ghost-btn" @click="copyText(form.id || tenantId, '租户 ID 已复制')">复制</button>
        </article>

        <article class="install-card">
          <p class="install-label">Embed Key</p>
          <code>{{ form.embedKey || '-' }}</code>
          <button type="button" class="ghost-btn" :disabled="!form.embedKey" @click="copyText(form.embedKey, 'Embed Key 已复制')">复制</button>
        </article>

        <article class="install-card">
          <p class="install-label">脚本地址</p>
          <code>{{ scriptUrl }}</code>
          <button type="button" class="ghost-btn" @click="copyText(scriptUrl, '脚本地址已复制')">复制</button>
        </article>

        <article class="install-card">
          <p class="install-label">API 地址</p>
          <code>{{ activeBaseUrl }}</code>
          <button type="button" class="ghost-btn" @click="copyText(activeBaseUrl, 'API 地址已复制')">复制</button>
        </article>
      </div>

      <article class="install-code-block">
        <div class="install-code-head">
          <p class="install-label">完整安装代码</p>
          <button type="button" class="ghost-btn" @click="copyText(embedCode, '安装代码已复制')">复制代码</button>
        </div>
        <pre><code>{{ embedCode }}</code></pre>
      </article>

      <p class="install-hint">
        客户站点若启用了 CSP，请放行 <code>{{ activeBaseUrl }}</code> 的脚本和接口请求。
      </p>
      <p v-if="copyNotice" class="copy-notice">{{ copyNotice }}</p>
      </section>
    </section>

    <section v-if="activeWorkspaceTab === 'commercial'" class="workspace-section">
      <section class="panel install-panel">
      <header>
        <h2>套餐与最近账单</h2>
        <p class="install-hint">用于代运营阶段确认当前收费档位和最近一个月账单结果。</p>
      </header>
      <div class="install-grid">
        <article class="install-card">
          <p class="install-label">当前套餐</p>
          <code>{{ currentBillingPlan?.name || '未设置' }}</code>
          <p v-if="currentBillingPlan" class="install-hint">月费 {{ currentBillingPlan.monthlyFee }} / 含 {{ currentBillingPlan.includedTokens }} tokens</p>
        </article>
        <article class="install-card">
          <p class="install-label">最近账单</p>
          <code>{{ latestBillingSummary?.month || '-' }}</code>
          <p v-if="latestBillingSummary" class="install-hint">应收 {{ latestBillingSummary.amount }}，超额 {{ latestBillingSummary.billableTokens }} tokens</p>
          <p v-else class="install-hint">暂无可计费记录</p>
        </article>
      </div>
      </section>

      <section class="panel install-panel">
      <header class="content-head">
        <div>
          <h2>训练模拟</h2>
          <p class="install-hint">用于演示租户资料进入训练后，如何产生 token 消耗并进入现有账单体系。</p>
        </div>
        <button type="button" class="ghost-btn" :disabled="saving || trainingBusy" @click="saveTenantAndSimulateTraining">
          {{ trainingBusy ? '训练中...' : '保存当前内容并模拟训练' }}
        </button>
      </header>

      <div class="install-grid">
        <article class="install-card">
          <p class="install-label">最近训练时间</p>
          <code>{{ latestTrainingRun ? new Date(latestTrainingRun.createdAt).toLocaleString() : '-' }}</code>
          <p class="install-hint">训练记录会写入账单明细，来源为 training-simulator。</p>
        </article>
        <article class="install-card">
          <p class="install-label">最近训练消耗</p>
          <code>{{ latestTrainingRun?.totalTokens ?? 0 }} tokens</code>
          <p class="install-hint">输入 {{ latestTrainingRun?.inputTokens ?? 0 }} / 输出 {{ latestTrainingRun?.outputTokens ?? 0 }}</p>
        </article>
        <article class="install-card">
          <p class="install-label">最近训练费用</p>
          <code>{{ latestTrainingRun?.amount || '0.00' }}</code>
          <p class="install-hint">模型 {{ latestTrainingRun?.model || 'training-indexer-v1' }}</p>
        </article>
        <article class="install-card">
          <p class="install-label">训练覆盖资料</p>
          <code>{{ latestTrainingRun?.sourceCount ?? 0 }} 个资料源</code>
          <p class="install-hint">总字符 {{ latestTrainingRun?.characterCount ?? 0 }} / 资产 {{ latestTrainingRun?.assetCount ?? 0 }}</p>
        </article>
      </div>

      <section v-if="trainingRuns.length" class="training-history">
        <header class="content-head">
          <div>
            <h3>最近训练记录</h3>
            <p class="install-hint">按时间倒序展示。点击可跳到账单页查看已筛选的训练消耗明细。</p>
          </div>
        </header>

        <div class="stats-grid">
          <NuxtLink
            v-for="run in trainingRuns.slice(0, 5)"
            :key="run.id"
            class="install-card action-link"
            :to="`/admin/billing?tenantId=${encodeURIComponent(tenantId)}&provider=${encodeURIComponent('training-simulator')}`"
          >
            <p class="install-label">{{ new Date(run.createdAt).toLocaleString() }}</p>
            <code>{{ run.totalTokens }} tokens / {{ run.amount }}</code>
            <p class="install-hint">输入 {{ run.inputTokens }} / 输出 {{ run.outputTokens }} / {{ run.sessionId }}</p>
          </NuxtLink>
        </div>
      </section>

      <p v-if="trainingNotice" class="copy-notice">{{ trainingNotice }}</p>
      <p v-if="trainingError" class="content-error">{{ trainingError }}</p>
      </section>
    </section>

    <section v-if="activeWorkspaceTab === 'content'" class="workspace-section">
      <form class="panel form-grid" @submit.prevent="saveTenant">
      <input v-model.trim="form.name" type="text" placeholder="租户名称" required />
      <input v-model.trim="form.brandName" type="text" placeholder="品牌名称" required />
      <input v-model.trim="form.themeColor" type="text" placeholder="主题色" />
      <input v-model.trim="form.contactPhone" type="text" placeholder="联系电话" />
      <input v-model.trim="form.contactEmail" type="email" placeholder="联系邮箱" />
      <input v-model.trim="form.contactAddress" type="text" placeholder="联系地址" />
      <select v-model="selectedBillingPlanId">
        <option v-for="plan in activeBillingPlans" :key="plan.id" :value="plan.id">
          {{ plan.name }} / 月费 {{ plan.monthlyFee }} / 含 {{ plan.includedTokens }} tokens
        </option>
      </select>
      <select v-model="form.status">
        <option value="active">active</option>
        <option value="disabled">disabled</option>
      </select>
      <textarea v-model.trim="form.systemPrompt" rows="5" placeholder="系统提示词" />
      <input v-model.trim="form.llmEndpoint" type="text" placeholder="租户模型接口地址（可选）" />
      <input v-model.trim="form.llmModel" type="text" placeholder="租户模型名称（可选）" />
      <input v-model.trim="form.llmApiKey" type="password" placeholder="租户模型 API Key（可选）" />
      <label class="toggle-row form-toggle">
        <input v-model="form.reuseAnsweredQuestions" type="checkbox" />
        <span>启用相同问题直接复用历史回答</span>
      </label>
      <textarea v-model.trim="billingNotes" rows="3" placeholder="套餐备注" />
      <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存租户' }}</button>
      </form>

      <section class="panel content-panel">
      <header class="content-head">
        <div>
          <h2>租户内容配置</h2>
          <p>支持按租户维护知识条目、文档摘要、产品参数表、咨询服务，以及网页、邮件、文档、表格等资料源。</p>
        </div>
        <div class="source-actions">
          <button type="button" class="ghost-btn" @click="resetToDemo">恢复默认示例</button>
          <button type="button" class="ghost-btn" :disabled="saving || trainingBusy" @click="saveTenantAndSimulateTraining">
            {{ trainingBusy ? '训练中...' : '保存并模拟训练' }}
          </button>
        </div>
      </header>

      <section class="source-panel">
        <div class="content-block-head">
          <div>
            <h3>资料源</h3>
            <p class="content-meta">可作为问答检索资料使用。Excel 建议上传 CSV/TSV，网页可填写 URL 并粘贴摘录内容。</p>
          </div>
          <div class="source-actions">
            <select v-model="sourceDraftType">
              <option v-for="option in contentSourceTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <button type="button" class="ghost-btn" @click="addContentSource()">新增资料源</button>
            <label class="import-btn">
              导入文本文件
              <input type="file" accept=".txt,.md,.csv,.tsv,.html,.eml,text/plain,text/csv,text/html,message/rfc822" @change="importContentSourceFile" />
            </label>
          </div>
        </div>

        <div v-if="sourceCategories.length" class="source-filter-row">
          <button
            type="button"
            class="ghost-btn"
            :class="{ active: sourceCategoryFilter === 'all' }"
            @click="sourceCategoryFilter = 'all'"
          >
            全部分类
          </button>
          <button
            v-for="category in sourceCategories"
            :key="category"
            type="button"
            class="ghost-btn"
            :class="{ active: sourceCategoryFilter === category }"
            @click="sourceCategoryFilter = category"
          >
            {{ category }}
          </button>
        </div>

        <div v-if="filteredContentSources.length" class="source-list">
          <article v-for="source in filteredContentSources" :key="source.id" class="source-card">
            <div class="source-card-head">
              <strong>资料 {{ source.title || '未命名资料' }}</strong>
              <button type="button" class="ghost-btn danger-btn" @click="removeContentSourceById(source.id)">删除</button>
            </div>
            <div class="source-form-grid">
              <select v-model="source.type">
                <option v-for="option in contentSourceTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
              <select v-model="source.enabled">
                <option :value="true">启用</option>
                <option :value="false">停用</option>
              </select>
              <input v-model.trim="source.category" type="text" placeholder="资料分类，如 部署 / 交付 / 售后 / 报价" />
              <input v-model.trim="source.title" type="text" placeholder="资料标题" />
              <input v-model.trim="source.sourceLabel" type="text" placeholder="来源标识，如 邮件主题 / 文件名 / 页面名称" />
              <input v-model.trim="source.sourceUrl" type="text" placeholder="来源地址，可选（网页建议填写）" />
              <input :value="formatTags(source.tags)" type="text" placeholder="标签，使用逗号分隔" @input="updateSourceTagsById(source.id, $event)" />
            </div>
            <textarea v-model.trim="source.summary" rows="3" placeholder="摘要，用于回答时优先展示" />
            <textarea
              :value="formatLineList(source.faqQuestions)"
              rows="4"
              placeholder="常见问法，每行一条。例如：WMS 是怎样一回事？&#10;支持私有化部署吗？"
              @input="updateSourceLineListById(source.id, 'faqQuestions', $event)"
            />
            <textarea
              :value="formatLineList(source.answerHints)"
              rows="4"
              placeholder="回答要点，每行一条。例如：先解释定义&#10;再说明适用场景&#10;最后给出落地方式"
              @input="updateSourceLineListById(source.id, 'answerHints', $event)"
            />
            <textarea v-model.trim="source.content" rows="8" placeholder="正文内容 / 摘录 / 邮件全文 / 文档片段 / CSV 文本" />
          </article>
        </div>

        <p v-else class="content-meta">当前筛选条件下没有资料源，可切换分类或新增资料。</p>
      </section>

      <div class="content-grid">
        <section class="content-block">
          <div class="content-block-head">
            <h3>知识条目</h3>
            <label class="import-btn">
              导入 JSON
              <input type="file" accept=".json,application/json" @change="importJsonFile($event, 'knowledgeEntries')" />
            </label>
          </div>
          <p class="content-meta">当前 {{ contentDraft.knowledgeEntries.length }} 条</p>
          <textarea v-model="knowledgeEntriesText" rows="14" spellcheck="false" />
        </section>

        <section class="content-block">
          <div class="content-block-head">
            <h3>文档摘要</h3>
            <label class="import-btn">
              导入 JSON
              <input type="file" accept=".json,application/json" @change="importJsonFile($event, 'articles')" />
            </label>
          </div>
          <p class="content-meta">当前 {{ contentDraft.articles.length }} 条</p>
          <textarea v-model="articlesText" rows="14" spellcheck="false" />
        </section>

        <section class="content-block">
          <div class="content-block-head">
            <h3>产品参数表</h3>
            <label class="import-btn">
              导入 JSON
              <input type="file" accept=".json,application/json" @change="importJsonFile($event, 'products')" />
            </label>
          </div>
          <p class="content-meta">当前 {{ contentDraft.products.length }} 条</p>
          <textarea v-model="productsText" rows="14" spellcheck="false" />
        </section>

        <section class="content-block">
          <div class="content-block-head">
            <h3>咨询服务</h3>
            <label class="import-btn">
              导入 JSON
              <input type="file" accept=".json,application/json" @change="importJsonFile($event, 'consultingServices')" />
            </label>
          </div>
          <p class="content-meta">当前 {{ contentDraft.consultingServices.length }} 条</p>
          <textarea v-model="consultingServicesText" rows="14" spellcheck="false" />
        </section>
      </div>

      <div class="content-footer-actions">
        <div class="content-dirty-indicator" :class="{ dirty: hasUnsavedContentChanges }">
          {{ hasUnsavedContentChanges ? '你有未保存修改，离开前请先保存' : '当前内容已保存' }}
        </div>
        <button type="button" class="ghost-btn" :disabled="saving" @click="saveTenant">{{ saving ? '保存中...' : '保存当前内容配置' }}</button>
        <button type="button" :disabled="saving || trainingBusy" @click="saveTenantAndSimulateTraining">{{ trainingBusy ? '训练中...' : '保存并模拟训练' }}</button>
      </div>
      <p v-if="contentError" class="content-error">{{ contentError }}</p>
      </section>
    </section>

    <section v-if="activeWorkspaceTab === 'trace'" class="workspace-section">
      <section class="panel install-panel">
        <header>
          <h2>会话追踪</h2>
          <p class="install-hint">从资料命中、聊天记录和留资入口追踪当前租户的真实咨询情况。</p>
        </header>
        <div class="stats-grid">
          <NuxtLink class="install-card action-link" :to="`/admin/chats?tenantId=${encodeURIComponent(tenantId)}`">
            <p class="install-label">查看全部聊天</p>
            <code>{{ overview.sessionCount }} 个会话</code>
            <p class="install-hint">排查异常问题、查看资料命中。</p>
          </NuxtLink>
          <NuxtLink class="install-card action-link" :to="`/admin/chats?tenantId=${encodeURIComponent(tenantId)}&matchedOnly=true`">
            <p class="install-label">命中过资料的会话</p>
            <code>精准追踪</code>
            <p class="install-hint">优先检查高价值、高相关度问答。</p>
          </NuxtLink>
          <NuxtLink class="install-card action-link" :to="`/admin/leads?tenantId=${encodeURIComponent(tenantId)}`">
            <p class="install-label">查看留资</p>
            <code>{{ overview.leadCount }} 条线索</code>
            <p class="install-hint">及时跟进高意向需求。</p>
          </NuxtLink>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { assistantKnowledgeEntries } from '../../../config/ai-assistant-knowledge'
import { listContentSourceCategories } from '../../../lib/content-ops'
import { listTrainingRuns } from '../../../lib/training-runs'
import { demoArticles, demoConsultingServices, demoProducts } from '../../../config/customer-bot-data'
import { billingPlans } from '../../../lib/billing-plans'
import { buildTenantOverview } from '../../../lib/tenant-overview'
import type {
  ArticleListItem,
  AssistantKnowledgeEntry,
  BillingPlan,
  BillingSummary,
  ChatSessionRecord,
  ConsultingServiceListItem,
  ConversationMessage,
  LeadRecord,
  LlmUsageRecord,
  MatchedContentSource,
  ProductListItem,
  TenantContentConfig,
  TenantContentSource,
  TenantContentSourceType,
  TenantRecord,
  TenantUserRecord
} from '../../../types'

const route = useRoute()
const requestUrl = useRequestURL()
const runtimeConfig = useRuntimeConfig()
const { request } = useAdminApi()
const tenantId = String(route.params.tenantId)
const saving = ref(false)
const contentError = ref('')
const copyNotice = ref('')
const trainingBusy = ref(false)
const trainingError = ref('')
const trainingNotice = ref('')
const faqActionNotice = ref('')
const faqActionError = ref('')
const faqEditor = reactive({
  open: false,
  mode: 'standard' as 'standard' | 'knowledge',
  originalQuestion: '',
  title: '',
  keywords: '',
  oneLiner: '',
  content: ''
})
const issuingResetCode = ref(false)
const resetCodeNotice = ref('')
const resetCodeError = ref('')
const installEnv = ref<'production' | 'staging'>('production')
const activeBillingPlans = billingPlans.filter((item) => item.active) as BillingPlan[]
const selectedBillingPlanId = ref(activeBillingPlans[0]?.id || 'plan-basic')
const savedContentSnapshot = ref('')
const billingNotes = ref('')
const latestBillingSummary = ref<BillingSummary | null>(null)
const contentStats = ref<Array<MatchedContentSource & { hits: number }>>([])
const sessionRecords = ref<ChatSessionRecord[]>([])
const sessionMessages = ref<Array<{ session: ChatSessionRecord; messages: ConversationMessage[] }>>([])
const leadRecords = ref<LeadRecord[]>([])
const faqSummaries = computed(() => {
  const map = new Map<string, { question: string; answer: string; hits: number; lastAskedAt: number; isUnhandled: boolean }>()

  for (const session of sessionMessages.value) {
    for (let index = 0; index < session.messages.length - 1; index += 1) {
      const current = session.messages[index]
      const next = session.messages[index + 1]

      if (current.role !== 'user' || next?.role !== 'assistant') {
        continue
      }

      const normalized = current.content.trim().toLowerCase().replace(/\s+/g, ' ')
      if (!normalized) {
        continue
      }

      const existing = map.get(normalized)
      if (existing) {
        existing.hits += 1
        existing.lastAskedAt = Math.max(existing.lastAskedAt, current.createdAt)
        continue
      }

      const isHandledByKnowledge = knowledgeKeywords.value.some((keyword) => normalized.includes(keyword) || keyword.includes(normalized))
      map.set(normalized, {
        question: current.content,
        answer: next.content,
        hits: 1,
        lastAskedAt: current.createdAt,
        isUnhandled: !isHandledByKnowledge
      })
    }
  }

  const keyword = faqKeyword.value.trim().toLowerCase()

  return Array.from(map.values())
    .filter((item) => item.hits > 1)
    .filter((item) => !keyword || item.question.toLowerCase().includes(keyword) || item.answer.toLowerCase().includes(keyword))
    .filter((item) => {
      if (faqFilter.value === 'high-frequency') {
        return item.hits >= 3
      }
      if (faqFilter.value === 'unhandled') {
        return item.isUnhandled
      }
      return true
    })
    .sort((a, b) => b.hits - a.hits || b.lastAskedAt - a.lastAskedAt)
    .slice(0, 12)
})
type TrainingRunSummary = {
  sourceCount: number
  assetCount: number
  characterCount: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  amount: string
  createdAt: number
  provider: string
  model: string
  sessionId: string
}
const latestTrainingRun = ref<TrainingRunSummary | null>(null)
const trainingRuns = ref<TrainingRunSummary[]>([])
const tenantUsers = ref<TenantUserRecord[]>([])
const latestResetCode = ref<{ email: string; previewCode?: string; provider: string; expiresAt: number } | null>(null)
const form = reactive<TenantRecord>({
  id: tenantId,
  name: '',
  status: 'active',
  brandName: '',
  themeColor: '#118ab2',
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  systemPrompt: '',
  llmEndpoint: '',
  llmApiKey: '',
  llmModel: '',
  reuseAnsweredQuestions: true,
  embedKey: '',
  billingSubscription: {
    planId: selectedBillingPlanId.value,
    startedAt: Date.now(),
    notes: ''
  },
  contentConfig: undefined,
  createdAt: 0,
  updatedAt: 0
})

const contentDraft = reactive<TenantContentConfig>({
  knowledgeEntries: [],
  articles: [],
  products: [],
  consultingServices: [],
  contentSources: []
})

const knowledgeEntriesText = ref('[]')
const articlesText = ref('[]')
const productsText = ref('[]')
const consultingServicesText = ref('[]')
const sourceDraftType = ref<TenantContentSourceType>('document')
const sourceCategoryFilter = ref('all')
const activeWorkspaceTab = ref<'overview' | 'content' | 'trace' | 'commercial' | 'install'>('overview')
const faqKeyword = ref('')
const faqFilter = ref<'all' | 'high-frequency' | 'unhandled'>('all')
const faqFilterOptions = [
  { value: 'all', label: '全部问题' },
  { value: 'high-frequency', label: '仅看高频' },
  { value: 'unhandled', label: '仅看未处理' }
] as const
const contentSourceTypeOptions: Array<{ value: TenantContentSourceType; label: string }> = [
  { value: 'webpage', label: '网页' },
  { value: 'email', label: '邮件' },
  { value: 'document', label: '文档' },
  { value: 'excel', label: '表格' }
]
const workspaceTabs = [
  { id: 'overview', label: '概览', description: '总览 / 命中 / 近期状态' },
  { id: 'content', label: '内容运营', description: '资料源 / 配置 / 维护' },
  { id: 'trace', label: '会话追踪', description: '聊天 / 留资 / 排查' },
  { id: 'commercial', label: '商业化', description: '套餐 / 账单 / 消耗' },
  { id: 'install', label: '安装配置', description: '脚本 / API / 嵌入' }
] as const

const defaultOrigin = computed(() => requestUrl.origin.replace(/\/+$/, ''))

const productionBaseUrl = computed(() => {
  const configured = runtimeConfig.public.customerBotPublicBaseUrl?.trim()
  return configured ? configured.replace(/\/+$/, '') : defaultOrigin.value
})

const stagingBaseUrl = computed(() => {
  const configured = runtimeConfig.public.customerBotStagingBaseUrl?.trim()
  return configured ? configured.replace(/\/+$/, '') : productionBaseUrl.value
})

const activeBaseUrl = computed(() => {
  if (installEnv.value === 'staging') {
    return stagingBaseUrl.value
  }

  return productionBaseUrl.value
})

const widgetVersion = computed(() => runtimeConfig.customerBotWidgetVersion?.trim() || 'dev')
const scriptUrl = computed(() => `${activeBaseUrl.value}/customer-bot.js?v=${encodeURIComponent(widgetVersion.value)}`)

const embedCode = computed(
  () =>
    `<script src="${scriptUrl.value}"><\\/script>\n` +
    `<script>CustomerBot.init({ tenantId: '${form.id || tenantId}', apiBaseUrl: '${activeBaseUrl.value}' })<\\/script>`
)
const currentBillingPlan = computed(() => activeBillingPlans.find((item) => item.id === selectedBillingPlanId.value) || null)
const primaryTenantUser = computed(() => tenantUsers.value[0] || null)
const sourceCategories = computed(() => listContentSourceCategories(contentDraft.contentSources))
const filteredContentSources = computed(() => {
  if (sourceCategoryFilter.value === 'all') {
    return contentDraft.contentSources
  }

  return contentDraft.contentSources.filter((item) => (item.category?.trim() || '') === sourceCategoryFilter.value)
})
const currentContentSnapshot = computed(() => {
  return JSON.stringify({
    knowledgeEntriesText: knowledgeEntriesText.value,
    articlesText: articlesText.value,
    productsText: productsText.value,
    consultingServicesText: consultingServicesText.value,
    contentSources: contentDraft.contentSources,
    sourceCategoryFilter: sourceCategoryFilter.value
  })
})
const hasUnsavedContentChanges = computed(() => currentContentSnapshot.value !== savedContentSnapshot.value)

const knowledgeKeywords = computed(() => {
  return contentDraft.knowledgeEntries
    .flatMap((entry) => [entry.title, entry.oneLiner, ...(entry.keywords || [])])
    .map((item) => item?.trim().toLowerCase())
    .filter((item): item is string => Boolean(item))
})

const overview = computed(() =>
  buildTenantOverview({
    sessions: sessionRecords.value,
    leads: leadRecords.value,
    latestBillingSummary: latestBillingSummary.value,
    contentStats: contentStats.value
  })
)

async function loadTenant() {
  const response = await request<{ item: TenantRecord; tenantUsers?: TenantUserRecord[] }>(`/api/admin/tenants/${tenantId}`)
  Object.assign(form, response.item)
  tenantUsers.value = Array.isArray(response.tenantUsers) ? response.tenantUsers : []
  selectedBillingPlanId.value = response.item.billingSubscription?.planId || activeBillingPlans[0]?.id || 'plan-basic'
  billingNotes.value = response.item.billingSubscription?.notes || ''
  hydrateContentDraft(response.item.contentConfig)
  await loadLatestBillingSummary()
  await loadContentStats()
  await loadOverviewData()
}

async function issueResetCode() {
  if (!primaryTenantUser.value) {
    resetCodeError.value = '当前租户还没有登录账号'
    return
  }

  issuingResetCode.value = true
  resetCodeError.value = ''
  resetCodeNotice.value = ''

  try {
    const response = await request<{ item: { email: string; previewCode?: string; provider: string; expiresAt: number } }>(
      `/api/admin/tenants/${encodeURIComponent(tenantId)}/reset-code`,
      { method: 'POST' }
    )
    latestResetCode.value = response.item
    resetCodeNotice.value = response.item.previewCode ? `已生成重置码 ${response.item.previewCode}` : '重置码邮件已发送'
  } catch (error) {
    resetCodeError.value = error instanceof Error ? error.message : '生成重置码失败'
  } finally {
    issuingResetCode.value = false
  }
}

async function loadLatestBillingSummary() {
  const response = await request<{ summaries: BillingSummary[]; usageRecords: LlmUsageRecord[] }>(
    `/api/admin/billing?tenantId=${encodeURIComponent(tenantId)}`
  )
  latestBillingSummary.value = response.summaries.length ? response.summaries[response.summaries.length - 1] : null
  const latestTrainingRecord =
    listTrainingRuns(response.usageRecords)[0] ?? null

  trainingRuns.value = listTrainingRuns(response.usageRecords).map((item) => ({
    sourceCount: 0,
    assetCount: 0,
    characterCount: 0,
    inputTokens: item.inputTokens,
    outputTokens: item.outputTokens,
    totalTokens: item.totalTokens,
    amount: item.amount,
    createdAt: item.createdAt,
    provider: item.provider,
    model: item.model,
    sessionId: item.sessionId
  }))

  latestTrainingRun.value = latestTrainingRecord
    ? {
        sourceCount: form.contentConfig?.contentSources?.filter((item) => item.enabled !== false).length ?? 0,
        assetCount:
          (form.contentConfig?.contentSources?.filter((item) => item.enabled !== false).length ?? 0) +
          (form.contentConfig?.knowledgeEntries?.length ?? 0) +
          (form.contentConfig?.articles?.length ?? 0) +
          (form.contentConfig?.products?.length ?? 0) +
          (form.contentConfig?.consultingServices?.length ?? 0),
        characterCount: 0,
        inputTokens: latestTrainingRecord.inputTokens,
        outputTokens: latestTrainingRecord.outputTokens,
        totalTokens: latestTrainingRecord.totalTokens,
        amount: latestTrainingRecord.amount,
        createdAt: latestTrainingRecord.createdAt,
        provider: latestTrainingRecord.provider,
        model: latestTrainingRecord.model,
        sessionId: latestTrainingRecord.sessionId
      }
    : null
}

async function loadContentStats() {
  const response = await request<{ items: Array<MatchedContentSource & { hits: number }> }>(
    `/api/admin/content-stats?tenantId=${encodeURIComponent(tenantId)}`
  )
  contentStats.value = response.items
}

async function loadOverviewData() {
  const [chatResponse, leadResponse] = await Promise.all([
    request<{ items: Array<{ session: ChatSessionRecord; messages: ConversationMessage[] }> }>(
      `/api/admin/chats?tenantId=${encodeURIComponent(tenantId)}`
    ),
    request<{ items: LeadRecord[] }>(`/api/admin/leads?tenantId=${encodeURIComponent(tenantId)}`)
  ])

  sessionMessages.value = chatResponse.items
  sessionRecords.value = chatResponse.items.map((item) => item.session)
  leadRecords.value = leadResponse.items
}

async function saveTenant() {
  if (saving.value) return
  saving.value = true
  contentError.value = ''
  try {
    const contentConfig = parseContentDraft()
    await request(`/api/admin/tenants/${tenantId}`, {
      method: 'PUT',
      body: {
        ...form,
        billingSubscription: {
          planId: selectedBillingPlanId.value,
          startedAt: form.billingSubscription?.startedAt || Date.now(),
          notes: billingNotes.value.trim()
        },
        contentConfig
      }
    })
    await loadTenant()
    return true
  } catch (error) {
    contentError.value = error instanceof Error ? error.message : '保存失败'
    return false
  } finally {
    saving.value = false
  }
}

async function saveTenantAndSimulateTraining() {
  trainingError.value = ''
  trainingNotice.value = ''

  const saved = await saveTenant()
  if (!saved) {
    trainingError.value = contentError.value || '保存失败，未执行训练'
    return
  }

  trainingBusy.value = true
  try {
    const response = await request<{
      sourceCount: number
      assetCount: number
      characterCount: number
      inputTokens: number
      outputTokens: number
      totalTokens: number
      amount: string
      record: LlmUsageRecord
    }>(`/api/admin/tenants/${encodeURIComponent(tenantId)}/training`, {
      method: 'POST'
    })

    latestTrainingRun.value = {
      sourceCount: response.sourceCount,
      assetCount: response.assetCount,
      characterCount: response.characterCount,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalTokens: response.totalTokens,
      amount: response.amount,
      createdAt: response.record.createdAt,
      provider: response.record.provider,
      model: response.record.model,
      sessionId: response.record.sessionId
    }
    trainingNotice.value = `已模拟训练：消耗 ${response.totalTokens} tokens，费用 ${response.amount}`
    await loadLatestBillingSummary()
  } catch (error) {
    trainingError.value = error instanceof Error ? error.message : '训练模拟失败'
  } finally {
    trainingBusy.value = false
  }
}

function hydrateContentDraft(contentConfig?: Partial<TenantContentConfig>) {
  contentDraft.knowledgeEntries = Array.isArray(contentConfig?.knowledgeEntries) ? contentConfig.knowledgeEntries : []
  contentDraft.articles = Array.isArray(contentConfig?.articles) ? contentConfig.articles : []
  contentDraft.products = Array.isArray(contentConfig?.products) ? contentConfig.products : []
  contentDraft.consultingServices = Array.isArray(contentConfig?.consultingServices) ? contentConfig.consultingServices : []
  contentDraft.contentSources = Array.isArray(contentConfig?.contentSources) ? contentConfig.contentSources : []

  knowledgeEntriesText.value = JSON.stringify(contentDraft.knowledgeEntries, null, 2)
  articlesText.value = JSON.stringify(contentDraft.articles, null, 2)
  productsText.value = JSON.stringify(contentDraft.products, null, 2)
  consultingServicesText.value = JSON.stringify(contentDraft.consultingServices, null, 2)
  savedContentSnapshot.value = currentContentSnapshot.value
}

function nextSourceId() {
  return `source-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createContentSource(type: TenantContentSourceType = 'document'): TenantContentSource {
  return {
    id: nextSourceId(),
    type,
    enabled: true,
    category: '',
    title: '',
    sourceUrl: '',
    sourceLabel: '',
    summary: '',
    content: '',
    tags: [],
    faqQuestions: [],
    answerHints: [],
    updatedAt: Date.now()
  }
}

function parseTags(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function createFaqKeywords(question: string): string[] {
  return Array.from(new Set(question.split(/[\s,，、/]+/).map((part) => part.trim()).filter((part) => part.length >= 2))).slice(0, 8)
}

function buildStandardReplyEntry(item: { question: string; answer: string }): AssistantKnowledgeEntry {
  const normalizedQuestion = item.question.trim() || '未命名问题'
  const summary = item.answer.trim() || '请补充标准回复内容'

  return {
    id: `faq-standard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `${normalizedQuestion}｜标准回复`,
    keywords: createFaqKeywords(normalizedQuestion),
    oneLiner: summary.slice(0, 80),
    whatIs: `标准口径：${summary}`,
    problems: ['适用于高频重复提问，优先输出统一口径'],
    workflow: ['识别用户问题', '直接调用标准回复', '如有差异再人工补充'],
    scenarios: [normalizedQuestion],
    outcomes: ['统一对外表达，降低回复波动'],
    source: 'faq-standard-reply'
  }
}

function buildKnowledgeEntryFromFaq(item: { question: string; answer: string }): AssistantKnowledgeEntry {
  const normalizedQuestion = item.question.trim() || '未命名问题'
  const summary = item.answer.trim() || '请补充知识说明'

  return {
    id: `faq-knowledge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: normalizedQuestion,
    keywords: createFaqKeywords(normalizedQuestion),
    oneLiner: summary.slice(0, 120),
    whatIs: summary,
    problems: ['该问题在历史会话中重复出现，建议沉淀为检索知识'],
    workflow: ['识别用户意图', '命中知识条目', '结合上下文组织回答'],
    scenarios: [normalizedQuestion],
    outcomes: ['扩充知识覆盖面，支持更多相近问法'],
    source: 'faq-knowledge-entry'
  }
}

function openFaqEditor(item: { question: string; answer: string; isUnhandled: boolean }, mode: 'standard' | 'knowledge') {
  if (!item.isUnhandled) {
    return
  }

  const baseTitle = mode === 'standard' ? `${item.question.trim()}｜标准回复` : item.question.trim()
  const keywords = createFaqKeywords(item.question).join(', ')

  faqActionNotice.value = ''
  faqActionError.value = ''
  faqEditor.open = true
  faqEditor.mode = mode
  faqEditor.originalQuestion = item.question.trim()
  faqEditor.title = baseTitle
  faqEditor.keywords = keywords
  faqEditor.oneLiner = item.answer.trim().slice(0, mode === 'standard' ? 80 : 120)
  faqEditor.content = mode === 'standard' ? `标准口径：${item.answer.trim()}` : item.answer.trim()
}

function closeFaqEditor() {
  faqEditor.open = false
}

function buildEntryFromEditor(mode: 'standard' | 'knowledge'): AssistantKnowledgeEntry {
  const title = faqEditor.title.trim() || (mode === 'standard' ? `${faqEditor.originalQuestion}｜标准回复` : faqEditor.originalQuestion)
  const content = faqEditor.content.trim() || '请补充内容'
  const keywords = parseTags(faqEditor.keywords)

  if (mode === 'standard') {
    return {
      id: `faq-standard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      keywords,
      oneLiner: (faqEditor.oneLiner.trim() || content).slice(0, 80),
      whatIs: content,
      problems: ['适用于高频重复提问，优先输出统一口径'],
      workflow: ['识别用户问题', '直接调用标准回复', '如有差异再人工补充'],
      scenarios: [faqEditor.originalQuestion],
      outcomes: ['统一对外表达，降低回复波动'],
      source: 'faq-standard-reply'
    }
  }

  return {
    id: `faq-knowledge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    keywords,
    oneLiner: (faqEditor.oneLiner.trim() || content).slice(0, 120),
    whatIs: content,
    problems: ['该问题在历史会话中重复出现，建议沉淀为检索知识'],
    workflow: ['识别用户意图', '命中知识条目', '结合上下文组织回答'],
    scenarios: [faqEditor.originalQuestion],
    outcomes: ['扩充知识覆盖面，支持更多相近问法'],
    source: 'faq-knowledge-entry'
  }
}

async function submitFaqEditor() {
  if (!faqEditor.open || saving.value) {
    return
  }

  faqActionNotice.value = ''
  faqActionError.value = ''

  try {
    const nextEntries = parseJsonArray<AssistantKnowledgeEntry>(knowledgeEntriesText.value, '知识条目')
    const entry = buildEntryFromEditor(faqEditor.mode)
    const targetTitle = entry.title.trim().toLowerCase()
    const exists = nextEntries.some((item) => item.title.trim().toLowerCase() === targetTitle)

    if (!exists) {
      nextEntries.unshift(entry)
      knowledgeEntriesText.value = JSON.stringify(nextEntries, null, 2)
    }

    const saved = await saveTenant()
    if (!saved) {
      throw new Error(contentError.value || 'FAQ 沉淀保存失败')
    }

    faqActionNotice.value = faqEditor.mode === 'standard'
      ? `已将「${faqEditor.originalQuestion}」设为标准回复`
      : `已将「${faqEditor.originalQuestion}」加入知识库`
    closeFaqEditor()
  } catch (error) {
    faqActionError.value = error instanceof Error ? error.message : 'FAQ 沉淀保存失败'
  }
}

async function promoteFaqToStandard(item: { question: string; answer: string; isUnhandled: boolean }) {
  openFaqEditor(item, 'standard')
}

async function appendFaqToKnowledge(item: { question: string; answer: string; isUnhandled: boolean }) {
  openFaqEditor(item, 'knowledge')
}

function formatTags(tags: string[] | undefined): string {
  return (tags ?? []).join(', ')
}

function formatLineList(items: string[] | undefined): string {
  return (items ?? []).join('\n')
}

function addContentSource(type = sourceDraftType.value) {
  contentDraft.contentSources.push(createContentSource(type))
}

function removeContentSource(index: number) {
  contentDraft.contentSources.splice(index, 1)
}

function removeContentSourceById(sourceId: string) {
  const index = contentDraft.contentSources.findIndex((item) => item.id === sourceId)
  if (index >= 0) {
    removeContentSource(index)
  }
}

function updateSourceTagsById(sourceId: string, event: Event) {
  const target = event.target as HTMLInputElement | null
  if (!target) {
    return
  }

  const current = contentDraft.contentSources.find((item) => item.id === sourceId)
  if (!current) {
    return
  }

  current.tags = parseTags(target.value)
  current.updatedAt = Date.now()
}

function parseLineList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function updateSourceLineListById(sourceId: string, field: 'faqQuestions' | 'answerHints', event: Event) {
  const target = event.target as HTMLTextAreaElement | null
  if (!target) {
    return
  }

  const current = contentDraft.contentSources.find((item) => item.id === sourceId)
  if (!current) {
    return
  }

  current[field] = parseLineList(target.value)
  current.updatedAt = Date.now()
}

function parseJsonArray<T>(value: string, label: string): T[] {
  try {
    const parsed = JSON.parse(value || '[]') as unknown
    if (!Array.isArray(parsed)) {
      throw new Error(`${label} 必须是 JSON 数组`)
    }
    return parsed as T[]
  } catch (error) {
    const message = error instanceof Error ? error.message : `${label} 解析失败`
    throw new Error(`${label}：${message}`)
  }
}

function parseContentDraft(): TenantContentConfig {
  const parsed = {
    knowledgeEntries: parseJsonArray<AssistantKnowledgeEntry>(knowledgeEntriesText.value, '知识条目'),
    articles: parseJsonArray<ArticleListItem>(articlesText.value, '文档摘要'),
    products: parseJsonArray<ProductListItem>(productsText.value, '产品参数表'),
    consultingServices: parseJsonArray<ConsultingServiceListItem>(consultingServicesText.value, '咨询服务'),
    contentSources: contentDraft.contentSources.map((item) => ({
      ...item,
      id: item.id || nextSourceId(),
      enabled: item.enabled !== false,
      category: item.category?.trim() || '',
      title: item.title.trim(),
      sourceUrl: item.sourceUrl?.trim() || '',
      sourceLabel: item.sourceLabel?.trim() || '',
      summary: item.summary.trim(),
      content: item.content.trim(),
      tags: (item.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
      faqQuestions: (item.faqQuestions ?? []).map((question) => question.trim()).filter(Boolean),
      answerHints: (item.answerHints ?? []).map((hint) => hint.trim()).filter(Boolean),
      updatedAt: Date.now()
    }))
  }

  contentDraft.knowledgeEntries = parsed.knowledgeEntries
  contentDraft.articles = parsed.articles
  contentDraft.products = parsed.products
  contentDraft.consultingServices = parsed.consultingServices
  contentDraft.contentSources = parsed.contentSources

  return parsed
}

function resetToDemo() {
  hydrateContentDraft({
    knowledgeEntries: structuredClone(assistantKnowledgeEntries),
    articles: structuredClone(demoArticles),
    products: structuredClone(demoProducts),
    consultingServices: structuredClone(demoConsultingServices),
    contentSources: []
  })
  contentError.value = ''
}

async function importJsonFile(
  event: Event,
  key: keyof TenantContentConfig
) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) {
    return
  }

  const text = await file.text()
  if (key === 'knowledgeEntries') {
    knowledgeEntriesText.value = text
  }
  if (key === 'articles') {
    articlesText.value = text
  }
  if (key === 'products') {
    productsText.value = text
  }
  if (key === 'consultingServices') {
    consultingServicesText.value = text
  }

  input.value = ''
}

async function importContentSourceFile(event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) {
    return
  }

  const text = await file.text()
  const inferredType = file.name.endsWith('.csv') || file.name.endsWith('.tsv') ? 'excel' : sourceDraftType.value
  contentDraft.contentSources.push({
    id: nextSourceId(),
    type: inferredType,
    enabled: true,
    category: '',
    title: file.name.replace(/\.[^.]+$/, ''),
    sourceLabel: file.name,
    sourceUrl: '',
    summary: `${file.name} 导入内容`,
    content: text.trim(),
    tags: [],
    faqQuestions: [],
    answerHints: [],
    updatedAt: Date.now()
  })

  input.value = ''
}

onBeforeRouteLeave(() => {
  if (!hasUnsavedContentChanges.value) {
    return
  }

  const confirmed = window.confirm('当前内容还有未保存修改，确认离开吗？')
  if (!confirmed) {
    return false
  }
})

onMounted(() => {
  const handler = (event: BeforeUnloadEvent) => {
    if (!hasUnsavedContentChanges.value) {
      return
    }

    event.preventDefault()
    event.returnValue = ''
  }

  window.addEventListener('beforeunload', handler)
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handler)
  })
})

async function copyText(value: string, message: string) {
  if (!value) {
    return
  }

  try {
    await navigator.clipboard.writeText(value)
    copyNotice.value = message
    window.setTimeout(() => {
      if (copyNotice.value === message) {
        copyNotice.value = ''
      }
    }, 2000)
  } catch {
    copyNotice.value = '复制失败，请手动复制'
  }
}

try {
  await loadTenant()
} catch {
  await navigateTo('/admin/login')
}
</script>

<style scoped>
.workspace-page { padding: 24px; min-height: 100vh; display: grid; gap: 20px; background: linear-gradient(180deg, #f4f8fb 0%, #edf3f7 100%); }
.workspace-hero, .panel { background: white; border-radius: 24px; padding: 22px; border: 1px solid #d9e7ee; box-shadow: 0 14px 40px rgba(30, 72, 98, 0.08); }
.workspace-kicker { margin: 10px 0 6px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.16em; color: #0b789b; }
.workspace-hero h1 { margin: 0; color: #15384d; }
.workspace-copy { margin: 10px 0 0; color: #50697b; line-height: 1.7; max-width: 860px; }
.workspace-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
.action-pill, .inline-link { display: inline-flex; align-items: center; justify-content: center; padding: 10px 14px; border-radius: 999px; border: 1px solid #cfe0e8; background: #f6fafc; color: #0d607c; font-weight: 700; text-decoration: none; }
.workspace-tabs { display: flex; gap: 10px; flex-wrap: wrap; }
.tab-chip { display: grid; gap: 4px; padding: 14px 16px; min-width: 170px; text-align: left; border-radius: 18px; border: 1px solid #d7e6ed; background: #ffffff; color: #173a4f; }
.tab-chip small { color: #607888; }
.tab-chip.active { background: linear-gradient(135deg, #14384a 0%, #22667e 100%); border-color: transparent; color: #f2f8fb; }
.tab-chip.active small { color: rgba(242, 248, 251, 0.78); }
.workspace-section { display: grid; gap: 20px; }
.install-panel { display: grid; gap: 16px; }
.install-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.install-head h2, .install-label { margin: 0; }
.install-head p, .install-hint, .copy-notice { margin: 6px 0 0; }
.env-switch { display: flex; gap: 8px; flex-wrap: wrap; }
.install-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.workspace-summary { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.install-card { display: grid; gap: 10px; padding: 16px; border-radius: 16px; background: #f8fbfd; border: 1px solid #e5edf3; }
.action-link { text-decoration: none; }
.stats-link { color: #0a6181; font-weight: 600; text-decoration: none; }
.install-card code, .install-code-block code { white-space: pre-wrap; word-break: break-all; }
.install-code-block { display: grid; gap: 10px; padding: 16px; border-radius: 16px; background: #0f1720; color: #e7f0f7; }
.install-code-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.install-code-block pre { margin: 0; overflow: auto; }
.ghost-btn.active { border-color: #0a7ea4; background: #eaf6fb; color: #0a6181; }
.form-grid { display: grid; gap: 12px; }
.form-toggle { min-height: 48px; }
input, textarea, select, button { padding: 12px; border-radius: 12px; border: 1px solid #cfd9e2; font: inherit; }
button { background: #0a7ea4; color: white; border: 0; font-weight: 700; }
.content-panel { display: grid; gap: 20px; }
.content-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.content-head h2, .content-block h3 { margin: 0; }
.content-head p, .content-meta, .content-error { margin: 6px 0 0; }
.source-panel { display: grid; gap: 16px; padding: 18px; border-radius: 18px; background: #f8fbfd; border: 1px solid #e5edf3; }
.source-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.source-filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
.source-list { display: grid; gap: 14px; }
.source-card { display: grid; gap: 12px; padding: 16px; border-radius: 16px; background: white; border: 1px solid #d7e3eb; }
.source-card-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.source-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.content-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.content-block { display: grid; gap: 10px; padding: 16px; border-radius: 16px; background: #f8fbfd; border: 1px solid #e5edf3; }
.content-block textarea { min-height: 260px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.content-block-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
.content-footer-actions { position: sticky; bottom: 18px; display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; margin-top: 4px; padding: 14px; border-radius: 18px; background: rgba(255, 255, 255, 0.92); border: 1px solid rgba(207, 217, 226, 0.92); box-shadow: 0 18px 40px rgba(21, 56, 77, 0.12); backdrop-filter: blur(10px); z-index: 8; }
.content-dirty-indicator { margin-right: auto; display: inline-flex; align-items: center; justify-content: center; padding: 10px 12px; border-radius: 999px; background: rgba(33, 166, 117, 0.12); color: #14815a; font-weight: 700; }
.content-dirty-indicator.dirty { background: rgba(181, 74, 74, 0.12); color: #a54040; }
.faq-toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.faq-filter-group { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-chip { padding: 10px 12px; border-radius: 999px; border: 1px solid #d2e1e8; background: #fff; color: #315163; }
.filter-chip.active { background: #14384a; color: #f3f8fb; border-color: #14384a; }
.faq-card-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.faq-badges { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.faq-badges span, .faq-badges em { display: inline-flex; align-items: center; justify-content: center; padding: 6px 10px; border-radius: 999px; font-style: normal; font-size: 12px; font-weight: 700; }
.faq-badges span { background: rgba(11, 120, 155, 0.1); color: #0b789b; }
.faq-badges em { background: rgba(181, 74, 74, 0.12); color: #a54040; }
.faq-badges em.done { background: rgba(33, 166, 117, 0.12); color: #14815a; }
.faq-actions { display: flex; justify-content: space-between; gap: 12px; align-items: center; flex-wrap: wrap; }
.faq-actions small { color: #6a8393; }
.faq-editor-overlay { position: fixed; inset: 0; background: rgba(12, 28, 36, 0.46); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 40; }
.faq-editor-panel { width: min(760px, 100%); display: grid; gap: 18px; padding: 24px; border-radius: 24px; background: #fff; border: 1px solid #d7e3eb; box-shadow: 0 28px 80px rgba(21, 56, 77, 0.18); }
.faq-editor-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.faq-editor-head h3 { margin: 6px 0 0; color: #15384d; }
.faq-editor-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.faq-editor-grid label { display: grid; gap: 8px; color: #35576a; }
.faq-editor-grid span { font-size: 13px; font-weight: 700; }
.faq-editor-full { grid-column: 1 / -1; }
.faq-editor-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
.import-btn, .ghost-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 12px; border-radius: 12px; border: 1px solid #cfd9e2; background: white; color: #21425b; cursor: pointer; font-weight: 600; }
.import-btn input { display: none; }
.danger-btn { color: #b42318; }
.content-error { color: #b42318; }
@media (max-width: 980px) {
  .install-grid, .stats-grid, .workspace-summary, .content-grid, .source-form-grid, .faq-grid, .faq-editor-grid { grid-template-columns: 1fr; }
  .content-footer-actions { bottom: 10px; padding: 12px; }
  .install-head, .content-head, .source-card-head { display: grid; }
  .workspace-actions, .workspace-tabs { display: grid; }
}
</style>
