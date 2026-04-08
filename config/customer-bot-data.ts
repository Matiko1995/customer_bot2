import type { ArticleListItem, ConsultingServiceListItem, ProductListItem, SiteConfig } from '../types'

export const demoSiteConfig: SiteConfig = {
  brandName: 'AI Factory Customer Bot Demo',
  heroTitle: '制造业 AI 解决方案与供应链服务',
  about: '这个演示站点提供智能仓储、采购 AI、财税自动化和项目咨询能力。',
  phone: '+86 138-0000-0000',
  email: 'hello@example.com',
  address: 'Shanghai, China'
}

export const demoArticles: ArticleListItem[] = [
  {
    id: 'article-wms',
    title: 'WMS 与 RFID 如何改善仓储执行',
    summary: '介绍入库、出库、盘点与批次追溯的自动化改造思路。',
    category: '仓储'
  },
  {
    id: 'article-ai',
    title: '采购 AI 助手的落地方式',
    summary: '围绕缺料识别、供应商比选和补货建议构建自动化闭环。',
    category: '采购'
  }
]

export const demoProducts: ProductListItem[] = [
  {
    id: 'product-bolt',
    name: '六角头螺栓',
    category: '标准件',
    summary: '适用于多种工业装配场景的常用紧固件。',
    priceText: '¥0.80 / 个',
    parameters: [
      { label: '规格', value: 'M8 x 30' },
      { label: '材质', value: '8.8 级碳钢' },
      { label: '表面处理', value: '镀锌' },
      { label: '起订量', value: '5000 个' }
    ]
  },
  {
    id: 'product-screw-machine',
    name: '高速螺丝机',
    category: '设备',
    summary: '适合流水线自动锁附的高速装配设备。',
    priceText: '¥28,000 / 台',
    parameters: [
      { label: '节拍', value: '每分钟 45-60 颗' },
      { label: '适配螺丝', value: 'M2-M6' },
      { label: '供电', value: '220V / 50Hz' },
      { label: '交期', value: '15 个工作日' }
    ]
  }
]

export const demoConsultingServices: ConsultingServiceListItem[] = [
  {
    id: 'consulting-diagnosis',
    name: '智能工厂诊断咨询',
    category: '咨询',
    introduction: '梳理现状、识别瓶颈并输出路线图。',
    price: '6800',
    negotiable: false
  },
  {
    id: 'consulting-qc',
    name: 'AI 质检方案咨询',
    category: '咨询',
    introduction: '围绕视觉检测与质控流程提供方案设计。',
    price: '',
    negotiable: true
  }
]
