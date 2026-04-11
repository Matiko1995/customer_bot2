export type QueryRoute = 'faq' | 'price' | 'document' | 'contact'

const pricePattern = /价格|报价|多少钱|费用|预算|采购价|单价/
const contactPattern = /联系|电话|邮箱|邮件|微信|地址|销售|商务对接|怎么联系/
const faqPattern = /支持|是否|怎么|如何|是什么|介绍一下|能不能|可以吗|能力/

export function classifyQuery(query: string): QueryRoute {
  const normalized = query.trim()

  if (!normalized) {
    return 'document'
  }

  if (pricePattern.test(normalized)) {
    return 'price'
  }

  if (contactPattern.test(normalized)) {
    return 'contact'
  }

  if (faqPattern.test(normalized)) {
    return 'faq'
  }

  return 'document'
}
