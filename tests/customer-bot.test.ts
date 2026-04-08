import { describe, expect, it } from 'vitest'
import { buildAssistantReply, buildDocumentAnswer, buildPriceAnswer, pickKnowledgeEntry } from '../lib/customer-bot'
import { assistantKnowledgeEntries } from '../config/ai-assistant-knowledge'
import { demoArticles, demoConsultingServices, demoProducts, demoSiteConfig } from '../config/customer-bot-data'

describe('customer bot knowledge', () => {
  it('matches WMS knowledge for warehouse query', () => {
    const entry = pickKnowledgeEntry('WMS 仓储怎么做批次追溯？', assistantKnowledgeEntries)
    expect(entry?.id).toBe('wms-rfid')
  })

  it('builds structured document answer from knowledge entry', () => {
    const answer = buildDocumentAnswer({
      query: '采购 AI 助手能解决什么问题？',
      knowledgeEntries: assistantKnowledgeEntries,
      articles: demoArticles,
      products: demoProducts,
      consultingServices: demoConsultingServices,
      contentSources: [],
      siteConfig: demoSiteConfig
    })

    expect(answer).toContain('【主题】采购 AI 助手')
    expect(answer).toContain('【主要解决】')
    expect(answer).toContain('【参考资料】')
  })

  it('uses tenant content sources for webpage and email retrieval', () => {
    const answer = buildDocumentAnswer({
      query: '你们是否支持邮箱告警与网页部署说明？',
      knowledgeEntries: [],
      articles: [],
      products: [],
      consultingServices: [],
      contentSources: [
        {
          id: 'source-web-1',
          type: 'webpage',
          enabled: true,
          category: '部署',
          title: '私有化部署说明',
          sourceUrl: 'https://example.com/deploy',
          summary: '官网部署页面，说明支持内网和私有化环境。',
          content: '支持内网部署、Docker 部署和客户自有云环境。',
          tags: ['部署', '私有化']
        },
        {
          id: 'source-email-1',
          type: 'email',
          enabled: true,
          category: '通知',
          title: '告警通知邮件',
          sourceLabel: 'ops@example.com',
          summary: '邮件中约定异常任务会自动发送告警。',
          content: '系统会在库存同步失败时向管理员发送邮件告警。',
          tags: ['告警', '邮件']
        }
      ],
      siteConfig: demoSiteConfig
    })

    expect(answer).toContain('【相关资料源】')
    expect(answer).toContain('私有化部署说明')
    expect(answer).toContain('告警通知邮件')
    expect(answer).toContain('网页')
    expect(answer).toContain('邮件')
  })

  it('uses faq questions and answer hints to improve content source retrieval', () => {
    const answer = buildDocumentAnswer({
      query: 'WMS 是怎样一回事？',
      knowledgeEntries: [],
      articles: [],
      products: [],
      consultingServices: [],
      contentSources: [
        {
          id: 'source-wms-1',
          type: 'document',
          enabled: true,
          category: '仓储',
          title: 'WMS 产品介绍',
          summary: '仓储管理系统说明。',
          content: '该系统覆盖入库、出库、盘点、库位管理等流程。',
          tags: ['WMS'],
          faqQuestions: ['WMS 是怎样一回事？', 'WMS 有什么用？'],
          answerHints: ['先解释 WMS 定义', '说明适用场景和仓储流程']
        }
      ],
      siteConfig: demoSiteConfig
    })

    expect(answer).toContain('WMS 产品介绍')
    expect(answer).toContain('回答要点：先解释 WMS 定义；说明适用场景和仓储流程')
  })

  it('ignores disabled content sources during retrieval', () => {
    const answer = buildDocumentAnswer({
      query: '支持私有化部署吗？',
      knowledgeEntries: [],
      articles: [],
      products: [],
      consultingServices: [],
      contentSources: [
        {
          id: 'source-disabled',
          type: 'webpage',
          enabled: false,
          category: '部署',
          title: '旧版部署说明',
          sourceUrl: 'https://example.com/old',
          summary: '旧版页面，不应参与回答。',
          content: '旧版仅支持公有云。',
          tags: ['部署']
        },
        {
          id: 'source-active',
          type: 'document',
          enabled: true,
          category: '部署',
          title: '新版部署手册',
          sourceLabel: 'deploy-v2.md',
          summary: '新版文档，说明支持私有化。',
          content: '当前版本支持私有化部署、内网环境和客户自有云。',
          tags: ['部署', '私有化']
        }
      ],
      siteConfig: demoSiteConfig
    })

    expect(answer).toContain('新版部署手册')
    expect(answer).not.toContain('旧版部署说明')
  })

  it('uses the best matching content segment instead of only the document prefix', () => {
    const answer = buildDocumentAnswer({
      query: '支持 API 对接吗？',
      knowledgeEntries: [],
      articles: [],
      products: [],
      consultingServices: [],
      contentSources: [
        {
          id: 'source-long-doc',
          type: 'document',
          enabled: true,
          category: '交付',
          title: '实施交付说明',
          summary: '项目实施说明。',
          content:
            '这是一个很长的交付说明文档，前半部分主要介绍项目背景、团队分工、现场安排、实施周期和沟通机制。' +
            '这些内容并不涉及接口对接。\\n\\n' +
            '接口能力部分：系统支持 API 对接、Webhook 回调以及按字段映射同步 ERP / MES 数据。',
          tags: ['交付', '接口']
        }
      ],
      siteConfig: demoSiteConfig
    })

    expect(answer).toContain('实施交付说明')
    expect(answer).toContain('支持 API 对接、Webhook 回调以及按字段映射同步 ERP / MES 数据')
  })
})

describe('customer bot pricing', () => {
  it('returns matching product prices', () => {
    const answer = buildPriceAnswer({
      query: '六角头螺栓多少钱？',
      products: demoProducts,
      consultingServices: demoConsultingServices
    })

    expect(answer).toContain('六角头螺栓')
    expect(answer).toContain('¥')
    expect(answer).toContain('参数')
    expect(answer).toContain('【参考资料】')
  })

  it('returns fallback examples when nothing matches', () => {
    const answer = buildPriceAnswer({
      query: '火箭引擎多少钱？',
      products: demoProducts,
      consultingServices: demoConsultingServices
    })

    expect(answer).toContain('暂无精确匹配')
    expect(answer).toContain('六角头螺栓')
  })

  it('appends attachment notice for screenshot-based questions', () => {
    const answer = buildAssistantReply({
      query: '我上传了一张现场截图，帮我看看设备情况',
      knowledgeEntries: assistantKnowledgeEntries,
      articles: demoArticles,
      products: demoProducts,
      consultingServices: demoConsultingServices,
      contentSources: [],
      siteConfig: demoSiteConfig,
      attachments: [
        {
          id: 'attachment-1',
          name: '现场截图.png',
          mimeType: 'image/png',
          size: 10240,
          dataUrl: 'data:image/png;base64,abc'
        }
      ]
    })

    expect(answer).toContain('【已收到附件】')
    expect(answer).toContain('现场截图.png')
  })
})


describe('customer bot answer priority', () => {
  it('prefers faq standard reply knowledge over normal knowledge', () => {
    const result = buildDocumentAnswer({
      query: '报价流程说明',
      knowledgeEntries: [
        {
          id: 'normal-1',
          title: '报价流程',
          keywords: ['报价'],
          oneLiner: '普通知识条目',
          whatIs: '这是普通知识。',
          problems: ['普通问题'],
          workflow: ['普通流程'],
          scenarios: ['报价'],
          outcomes: ['普通结果'],
          source: 'tenant-content'
        },
        {
          id: 'standard-1',
          title: '怎么报价｜标准回复',
          keywords: ['报价'],
          oneLiner: '标准回复条目',
          whatIs: '标准口径：请先提供规格和数量。',
          problems: ['高频问题'],
          workflow: ['直接回复标准口径'],
          scenarios: ['报价流程说明'],
          outcomes: ['统一口径'],
          source: 'faq-standard-reply'
        }
      ],
      articles: [],
      products: [],
      consultingServices: [],
      contentSources: [],
      siteConfig: demoSiteConfig,
      returnMeta: true
    }) as { content: string; meta: { matchedKnowledgeEntry?: { id: string } | null } }

    expect(result.content).toContain('标准口径')
    expect(result.meta.matchedKnowledgeEntry?.id).toBe('standard-1')
  })

  it('does not let weakly related standard reply override stronger domain knowledge', () => {
    const entry = pickKnowledgeEntry('WMS 仓储如何做批次追溯与库位管理？', [
      {
        id: 'domain-1',
        title: 'WMS 仓储方案',
        keywords: ['wms', '仓储', '批次追溯', '库位'],
        oneLiner: '领域知识条目',
        whatIs: 'WMS 用于仓储作业管理。',
        problems: ['仓储追溯难'],
        workflow: ['采集', '定位', '追溯'],
        scenarios: ['仓储'],
        outcomes: ['提升准确率'],
        source: 'tenant-content'
      },
      {
        id: 'standard-weak',
        title: '报价流程｜标准回复',
        keywords: ['报价'],
        oneLiner: '标准回复条目',
        whatIs: '请先提供规格和数量。',
        problems: ['报价问题'],
        workflow: ['发送标准口径'],
        scenarios: ['报价'],
        outcomes: ['统一口径'],
        source: 'faq-standard-reply'
      }
    ])

    expect(entry?.id).toBe('domain-1')
  })
})
