import type { AssistantKnowledgeEntry } from '../types'

export const assistantKnowledgeEntries: AssistantKnowledgeEntry[] = [
  {
    id: 'wms-rfid',
    title: 'WMS + RFID 智能仓储',
    keywords: ['wms', 'rfid', '仓储', '仓库', '入库', '出库', '盘点', '库位', '批次追溯', 'fifo', '仓储管理'],
    oneLiner: 'WMS + RFID 是把仓库管理系统与射频识别结合，实现入库、定位、盘点、出库全流程自动化。',
    whatIs: '系统通过 RFID 自动识别货物信息，并由 WMS 在毫秒级做库位与作业决策，减少人工扫码、人工分配和人工核对环节。',
    problems: [
      '入库/出库效率低，人工扫码慢且容易漏扫错扫',
      '库位分配依赖经验，利用率不高且调度不稳定',
      '盘点周期长、停工成本高、账实不一致',
      '批次追溯慢，异常定位和召回响应慢'
    ],
    workflow: [
      'RFID 读取：0.1 秒完成货物识别',
      '自动分配仓库：按库存水位、周转率、库位利用率匹配最优区域',
      '库位定位：定位到货架区/列/层，支持终端导航',
      '入库单生成：自动同步 ERP/MES/TMS，保留完整追溯记录'
    ],
    scenarios: ['汽车零部件仓，SKU 多且批次复杂', '电子元器件仓，需要批次级追溯', '成品仓，多订单并行且发货准确率要求高'],
    outcomes: ['出入库效率提升约 80%', '库存准确率可达 99.5%', '盘点时间可从天级缩短到小时级', '错发漏发显著下降'],
    source: 'migrated from ai-manufacturing-trade-site'
  },
  {
    id: 'procurement-ai',
    title: '采购 AI 助手',
    keywords: ['采购', '缺料', '供应商', '询价', '补货', '在途', '安全库存', 'procurement'],
    oneLiner: '采购 AI 助手用于回答“买什么、买多少、向谁买”，把缺料识别和供应商选择自动化。',
    whatIs: '系统结合库存、在途量和生产计划，自动生成采购建议并回写到业务系统。',
    problems: ['缺料发现滞后', '询价链路长', '供应商选择缺少量化依据'],
    workflow: ['识别缺料', '生成建议采购量', '比选供应商', '回写与复盘'],
    scenarios: ['多品类原料采购', '交期敏感订单', '成本与稳定性同时要求高的制造场景'],
    outcomes: ['减少停线风险', '缩短采购响应时间', '提高采购决策一致性'],
    source: 'migrated from ai-manufacturing-trade-site'
  },
  {
    id: 'finance-ocr',
    title: '财税 OCR 自动化',
    keywords: ['财税', '发票', 'ocr', '票据', '合规', '报销'],
    oneLiner: '财税 OCR 把票据识别、查验、归档做成自动化闭环，降低人工录入和合规风险。',
    whatIs: '系统自动提取票据字段并做规则校验，异常实时预警，所有处理过程可追溯。',
    problems: ['人工录票慢且易错', '票据核验负担重', '审计追溯成本高'],
    workflow: ['票据采集', 'OCR 识别', '规则校验', '结果归档追溯'],
    scenarios: ['月度集中开票', '多主体报销', '财税合规检查'],
    outcomes: ['提升处理速度', '减少错录漏录', '提高审计可追溯性'],
    source: 'migrated from ai-manufacturing-trade-site'
  }
]
