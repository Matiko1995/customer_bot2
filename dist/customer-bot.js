"use strict";
var CustomerBotBundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    CustomerBot: () => globalApi,
    createCustomerBot: () => createCustomerBot
  });

  // config/ai-assistant-knowledge.ts
  var assistantKnowledgeEntries = [
    {
      id: "wms-rfid",
      title: "WMS + RFID \u667A\u80FD\u4ED3\u50A8",
      keywords: ["wms", "rfid", "\u4ED3\u50A8", "\u4ED3\u5E93", "\u5165\u5E93", "\u51FA\u5E93", "\u76D8\u70B9", "\u5E93\u4F4D", "\u6279\u6B21\u8FFD\u6EAF", "fifo", "\u4ED3\u50A8\u7BA1\u7406"],
      oneLiner: "WMS + RFID \u662F\u628A\u4ED3\u5E93\u7BA1\u7406\u7CFB\u7EDF\u4E0E\u5C04\u9891\u8BC6\u522B\u7ED3\u5408\uFF0C\u5B9E\u73B0\u5165\u5E93\u3001\u5B9A\u4F4D\u3001\u76D8\u70B9\u3001\u51FA\u5E93\u5168\u6D41\u7A0B\u81EA\u52A8\u5316\u3002",
      whatIs: "\u7CFB\u7EDF\u901A\u8FC7 RFID \u81EA\u52A8\u8BC6\u522B\u8D27\u7269\u4FE1\u606F\uFF0C\u5E76\u7531 WMS \u5728\u6BEB\u79D2\u7EA7\u505A\u5E93\u4F4D\u4E0E\u4F5C\u4E1A\u51B3\u7B56\uFF0C\u51CF\u5C11\u4EBA\u5DE5\u626B\u7801\u3001\u4EBA\u5DE5\u5206\u914D\u548C\u4EBA\u5DE5\u6838\u5BF9\u73AF\u8282\u3002",
      problems: [
        "\u5165\u5E93/\u51FA\u5E93\u6548\u7387\u4F4E\uFF0C\u4EBA\u5DE5\u626B\u7801\u6162\u4E14\u5BB9\u6613\u6F0F\u626B\u9519\u626B",
        "\u5E93\u4F4D\u5206\u914D\u4F9D\u8D56\u7ECF\u9A8C\uFF0C\u5229\u7528\u7387\u4E0D\u9AD8\u4E14\u8C03\u5EA6\u4E0D\u7A33\u5B9A",
        "\u76D8\u70B9\u5468\u671F\u957F\u3001\u505C\u5DE5\u6210\u672C\u9AD8\u3001\u8D26\u5B9E\u4E0D\u4E00\u81F4",
        "\u6279\u6B21\u8FFD\u6EAF\u6162\uFF0C\u5F02\u5E38\u5B9A\u4F4D\u548C\u53EC\u56DE\u54CD\u5E94\u6162"
      ],
      workflow: [
        "RFID \u8BFB\u53D6\uFF1A0.1 \u79D2\u5B8C\u6210\u8D27\u7269\u8BC6\u522B",
        "\u81EA\u52A8\u5206\u914D\u4ED3\u5E93\uFF1A\u6309\u5E93\u5B58\u6C34\u4F4D\u3001\u5468\u8F6C\u7387\u3001\u5E93\u4F4D\u5229\u7528\u7387\u5339\u914D\u6700\u4F18\u533A\u57DF",
        "\u5E93\u4F4D\u5B9A\u4F4D\uFF1A\u5B9A\u4F4D\u5230\u8D27\u67B6\u533A/\u5217/\u5C42\uFF0C\u652F\u6301\u7EC8\u7AEF\u5BFC\u822A",
        "\u5165\u5E93\u5355\u751F\u6210\uFF1A\u81EA\u52A8\u540C\u6B65 ERP/MES/TMS\uFF0C\u4FDD\u7559\u5B8C\u6574\u8FFD\u6EAF\u8BB0\u5F55"
      ],
      scenarios: ["\u6C7D\u8F66\u96F6\u90E8\u4EF6\u4ED3\uFF0CSKU \u591A\u4E14\u6279\u6B21\u590D\u6742", "\u7535\u5B50\u5143\u5668\u4EF6\u4ED3\uFF0C\u9700\u8981\u6279\u6B21\u7EA7\u8FFD\u6EAF", "\u6210\u54C1\u4ED3\uFF0C\u591A\u8BA2\u5355\u5E76\u884C\u4E14\u53D1\u8D27\u51C6\u786E\u7387\u8981\u6C42\u9AD8"],
      outcomes: ["\u51FA\u5165\u5E93\u6548\u7387\u63D0\u5347\u7EA6 80%", "\u5E93\u5B58\u51C6\u786E\u7387\u53EF\u8FBE 99.5%", "\u76D8\u70B9\u65F6\u95F4\u53EF\u4ECE\u5929\u7EA7\u7F29\u77ED\u5230\u5C0F\u65F6\u7EA7", "\u9519\u53D1\u6F0F\u53D1\u663E\u8457\u4E0B\u964D"],
      source: "migrated from ai-manufacturing-trade-site"
    },
    {
      id: "procurement-ai",
      title: "\u91C7\u8D2D AI \u52A9\u624B",
      keywords: ["\u91C7\u8D2D", "\u7F3A\u6599", "\u4F9B\u5E94\u5546", "\u8BE2\u4EF7", "\u8865\u8D27", "\u5728\u9014", "\u5B89\u5168\u5E93\u5B58", "procurement"],
      oneLiner: "\u91C7\u8D2D AI \u52A9\u624B\u7528\u4E8E\u56DE\u7B54\u201C\u4E70\u4EC0\u4E48\u3001\u4E70\u591A\u5C11\u3001\u5411\u8C01\u4E70\u201D\uFF0C\u628A\u7F3A\u6599\u8BC6\u522B\u548C\u4F9B\u5E94\u5546\u9009\u62E9\u81EA\u52A8\u5316\u3002",
      whatIs: "\u7CFB\u7EDF\u7ED3\u5408\u5E93\u5B58\u3001\u5728\u9014\u91CF\u548C\u751F\u4EA7\u8BA1\u5212\uFF0C\u81EA\u52A8\u751F\u6210\u91C7\u8D2D\u5EFA\u8BAE\u5E76\u56DE\u5199\u5230\u4E1A\u52A1\u7CFB\u7EDF\u3002",
      problems: ["\u7F3A\u6599\u53D1\u73B0\u6EDE\u540E", "\u8BE2\u4EF7\u94FE\u8DEF\u957F", "\u4F9B\u5E94\u5546\u9009\u62E9\u7F3A\u5C11\u91CF\u5316\u4F9D\u636E"],
      workflow: ["\u8BC6\u522B\u7F3A\u6599", "\u751F\u6210\u5EFA\u8BAE\u91C7\u8D2D\u91CF", "\u6BD4\u9009\u4F9B\u5E94\u5546", "\u56DE\u5199\u4E0E\u590D\u76D8"],
      scenarios: ["\u591A\u54C1\u7C7B\u539F\u6599\u91C7\u8D2D", "\u4EA4\u671F\u654F\u611F\u8BA2\u5355", "\u6210\u672C\u4E0E\u7A33\u5B9A\u6027\u540C\u65F6\u8981\u6C42\u9AD8\u7684\u5236\u9020\u573A\u666F"],
      outcomes: ["\u51CF\u5C11\u505C\u7EBF\u98CE\u9669", "\u7F29\u77ED\u91C7\u8D2D\u54CD\u5E94\u65F6\u95F4", "\u63D0\u9AD8\u91C7\u8D2D\u51B3\u7B56\u4E00\u81F4\u6027"],
      source: "migrated from ai-manufacturing-trade-site"
    },
    {
      id: "finance-ocr",
      title: "\u8D22\u7A0E OCR \u81EA\u52A8\u5316",
      keywords: ["\u8D22\u7A0E", "\u53D1\u7968", "ocr", "\u7968\u636E", "\u5408\u89C4", "\u62A5\u9500"],
      oneLiner: "\u8D22\u7A0E OCR \u628A\u7968\u636E\u8BC6\u522B\u3001\u67E5\u9A8C\u3001\u5F52\u6863\u505A\u6210\u81EA\u52A8\u5316\u95ED\u73AF\uFF0C\u964D\u4F4E\u4EBA\u5DE5\u5F55\u5165\u548C\u5408\u89C4\u98CE\u9669\u3002",
      whatIs: "\u7CFB\u7EDF\u81EA\u52A8\u63D0\u53D6\u7968\u636E\u5B57\u6BB5\u5E76\u505A\u89C4\u5219\u6821\u9A8C\uFF0C\u5F02\u5E38\u5B9E\u65F6\u9884\u8B66\uFF0C\u6240\u6709\u5904\u7406\u8FC7\u7A0B\u53EF\u8FFD\u6EAF\u3002",
      problems: ["\u4EBA\u5DE5\u5F55\u7968\u6162\u4E14\u6613\u9519", "\u7968\u636E\u6838\u9A8C\u8D1F\u62C5\u91CD", "\u5BA1\u8BA1\u8FFD\u6EAF\u6210\u672C\u9AD8"],
      workflow: ["\u7968\u636E\u91C7\u96C6", "OCR \u8BC6\u522B", "\u89C4\u5219\u6821\u9A8C", "\u7ED3\u679C\u5F52\u6863\u8FFD\u6EAF"],
      scenarios: ["\u6708\u5EA6\u96C6\u4E2D\u5F00\u7968", "\u591A\u4E3B\u4F53\u62A5\u9500", "\u8D22\u7A0E\u5408\u89C4\u68C0\u67E5"],
      outcomes: ["\u63D0\u5347\u5904\u7406\u901F\u5EA6", "\u51CF\u5C11\u9519\u5F55\u6F0F\u5F55", "\u63D0\u9AD8\u5BA1\u8BA1\u53EF\u8FFD\u6EAF\u6027"],
      source: "migrated from ai-manufacturing-trade-site"
    }
  ];

  // config/customer-bot-data.ts
  var demoSiteConfig = {
    brandName: "AI Factory Customer Bot Demo",
    heroTitle: "\u5236\u9020\u4E1A AI \u89E3\u51B3\u65B9\u6848\u4E0E\u4F9B\u5E94\u94FE\u670D\u52A1",
    about: "\u8FD9\u4E2A\u6F14\u793A\u7AD9\u70B9\u63D0\u4F9B\u667A\u80FD\u4ED3\u50A8\u3001\u91C7\u8D2D AI\u3001\u8D22\u7A0E\u81EA\u52A8\u5316\u548C\u9879\u76EE\u54A8\u8BE2\u80FD\u529B\u3002",
    phone: "+86 138-0000-0000",
    email: "hello@example.com",
    address: "Shanghai, China"
  };
  var demoArticles = [
    {
      id: "article-wms",
      title: "WMS \u4E0E RFID \u5982\u4F55\u6539\u5584\u4ED3\u50A8\u6267\u884C",
      summary: "\u4ECB\u7ECD\u5165\u5E93\u3001\u51FA\u5E93\u3001\u76D8\u70B9\u4E0E\u6279\u6B21\u8FFD\u6EAF\u7684\u81EA\u52A8\u5316\u6539\u9020\u601D\u8DEF\u3002",
      category: "\u4ED3\u50A8"
    },
    {
      id: "article-ai",
      title: "\u91C7\u8D2D AI \u52A9\u624B\u7684\u843D\u5730\u65B9\u5F0F",
      summary: "\u56F4\u7ED5\u7F3A\u6599\u8BC6\u522B\u3001\u4F9B\u5E94\u5546\u6BD4\u9009\u548C\u8865\u8D27\u5EFA\u8BAE\u6784\u5EFA\u81EA\u52A8\u5316\u95ED\u73AF\u3002",
      category: "\u91C7\u8D2D"
    }
  ];
  var demoProducts = [
    {
      id: "product-bolt",
      name: "\u516D\u89D2\u5934\u87BA\u6813",
      category: "\u6807\u51C6\u4EF6",
      summary: "\u9002\u7528\u4E8E\u591A\u79CD\u5DE5\u4E1A\u88C5\u914D\u573A\u666F\u7684\u5E38\u7528\u7D27\u56FA\u4EF6\u3002",
      priceText: "\xA50.80 / \u4E2A",
      parameters: [
        { label: "\u89C4\u683C", value: "M8 x 30" },
        { label: "\u6750\u8D28", value: "8.8 \u7EA7\u78B3\u94A2" },
        { label: "\u8868\u9762\u5904\u7406", value: "\u9540\u950C" },
        { label: "\u8D77\u8BA2\u91CF", value: "5000 \u4E2A" }
      ]
    },
    {
      id: "product-screw-machine",
      name: "\u9AD8\u901F\u87BA\u4E1D\u673A",
      category: "\u8BBE\u5907",
      summary: "\u9002\u5408\u6D41\u6C34\u7EBF\u81EA\u52A8\u9501\u9644\u7684\u9AD8\u901F\u88C5\u914D\u8BBE\u5907\u3002",
      priceText: "\xA528,000 / \u53F0",
      parameters: [
        { label: "\u8282\u62CD", value: "\u6BCF\u5206\u949F 45-60 \u9897" },
        { label: "\u9002\u914D\u87BA\u4E1D", value: "M2-M6" },
        { label: "\u4F9B\u7535", value: "220V / 50Hz" },
        { label: "\u4EA4\u671F", value: "15 \u4E2A\u5DE5\u4F5C\u65E5" }
      ]
    }
  ];
  var demoConsultingServices = [
    {
      id: "consulting-diagnosis",
      name: "\u667A\u80FD\u5DE5\u5382\u8BCA\u65AD\u54A8\u8BE2",
      category: "\u54A8\u8BE2",
      introduction: "\u68B3\u7406\u73B0\u72B6\u3001\u8BC6\u522B\u74F6\u9888\u5E76\u8F93\u51FA\u8DEF\u7EBF\u56FE\u3002",
      price: "6800",
      negotiable: false
    },
    {
      id: "consulting-qc",
      name: "AI \u8D28\u68C0\u65B9\u6848\u54A8\u8BE2",
      category: "\u54A8\u8BE2",
      introduction: "\u56F4\u7ED5\u89C6\u89C9\u68C0\u6D4B\u4E0E\u8D28\u63A7\u6D41\u7A0B\u63D0\u4F9B\u65B9\u6848\u8BBE\u8BA1\u3002",
      price: "",
      negotiable: true
    }
  ];

  // lib/customer-bot.ts
  function normalizeText(value) {
    return Array.from(value.toLowerCase()).filter((char) => /[a-z0-9\u4e00-\u9fa5]/.test(char)).join("");
  }
  function extractKeywords(value) {
    var _a;
    const words = value.toLowerCase().split(/[^a-z0-9\u4e00-\u9fa5]+/).map((word) => word.trim()).filter((word) => word.length >= 2);
    const chineseSegments = (_a = value.match(/[\u4e00-\u9fa5]{2,}/g)) != null ? _a : [];
    const chineseTokens = [];
    for (const segment of chineseSegments) {
      if (segment.length <= 4) {
        chineseTokens.push(segment);
        continue;
      }
      for (let index = 0; index < segment.length - 1; index += 1) {
        chineseTokens.push(segment.slice(index, index + 2));
      }
    }
    return Array.from(/* @__PURE__ */ new Set([...words, ...chineseTokens])).filter((word) => word.length >= 2);
  }
  function scoreSource(source, query, keywords) {
    const normalizedSource = normalizeText(source);
    if (!normalizedSource) {
      return 0;
    }
    let score = 0;
    const normalizedQuery = normalizeText(query);
    if (normalizedQuery && normalizedSource.includes(normalizedQuery)) {
      score += 10;
    }
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalizedKeyword && normalizedSource.includes(normalizedKeyword)) {
        score += 2;
      }
    }
    return score;
  }
  function rankByQuery(items, query, resolveText) {
    const keywords = extractKeywords(query);
    return [...items].map((item) => ({
      item,
      score: scoreSource(resolveText(item), query, keywords)
    })).filter((item) => item.score > 0).sort((left, right) => right.score - left.score).map((item) => item.item);
  }
  function formatContentSourceType(type) {
    if (type === "webpage") return "\u7F51\u9875";
    if (type === "email") return "\u90AE\u4EF6";
    if (type === "excel") return "\u8868\u683C";
    return "\u6587\u6863";
  }
  function buildContentSourceCorpus(item) {
    var _a, _b, _c;
    return [
      item.title,
      item.category,
      item.summary,
      item.content,
      item.sourceLabel,
      item.sourceUrl,
      ...(_a = item.tags) != null ? _a : [],
      ...(_b = item.faqQuestions) != null ? _b : [],
      ...(_c = item.answerHints) != null ? _c : []
    ].filter(Boolean).join(" ");
  }
  function getEnabledContentSources(items) {
    return items.filter((item) => item.enabled !== false);
  }
  function splitContentIntoSegments(content) {
    const compact = content.replace(/\r/g, "\n").trim();
    if (!compact) {
      return [];
    }
    const paragraphSegments = compact.split(/\n{2,}/).map((segment) => segment.replace(/\s+/g, " ").trim()).filter(Boolean);
    const rawSegments = paragraphSegments.length ? paragraphSegments : compact.split(/[。！？!?；;\n]+/).map((segment) => segment.replace(/\s+/g, " ").trim());
    const limitedSegments = [];
    for (const segment of rawSegments.filter(Boolean)) {
      if (segment.length <= 140) {
        limitedSegments.push(segment);
        continue;
      }
      for (let index = 0; index < segment.length; index += 120) {
        const slice = segment.slice(index, index + 120).trim();
        if (slice) {
          limitedSegments.push(slice);
        }
      }
    }
    return limitedSegments.slice(0, 24);
  }
  function pickBestContentSegment(item, query) {
    var _a;
    const segments = splitContentIntoSegments(item.content);
    if (!segments.length) {
      return item.summary.trim();
    }
    const keywords = extractKeywords(query);
    const rankedSegments = segments.map((segment) => ({
      segment,
      score: scoreSource(segment, query, keywords)
    })).sort((left, right) => right.score - left.score);
    return ((_a = rankedSegments[0]) == null ? void 0 : _a.score) ? rankedSegments[0].segment : segments[0];
  }
  function pickMatchedContentSources(query, contentSources) {
    const keywords = extractKeywords(query);
    return [...getEnabledContentSources(contentSources)].map((item) => {
      var _a, _b;
      const corpusScore = scoreSource(buildContentSourceCorpus(item), query, keywords);
      const segmentScore = splitContentIntoSegments(item.content).reduce((max, segment) => Math.max(max, scoreSource(segment, query, keywords)), 0);
      const faqScore = ((_a = item.faqQuestions) != null ? _a : []).reduce((sum, question) => sum + scoreSource(question, query, keywords) * 2, 0);
      const hintScore = ((_b = item.answerHints) != null ? _b : []).reduce((sum, hint) => sum + scoreSource(hint, query, keywords), 0);
      return {
        item,
        score: corpusScore + segmentScore * 2 + faqScore + hintScore
      };
    }).filter((item) => item.score > 0).sort((left, right) => right.score - left.score).slice(0, 3).map((item) => item.item);
  }
  function pickContentSourceSnippet(item, query) {
    const compact = pickBestContentSegment(item, query).replace(/\s+/g, " ").trim();
    if (!compact) {
      return item.summary.trim();
    }
    const keywords = [query, ...extractKeywords(query)].map((value) => value.trim()).filter(Boolean);
    const matchedKeyword = keywords.find((keyword) => compact.toLowerCase().includes(keyword.toLowerCase()));
    if (!matchedKeyword) {
      return compact.slice(0, 120);
    }
    const index = compact.toLowerCase().indexOf(matchedKeyword.toLowerCase());
    const start = Math.max(0, index - 24);
    const end = Math.min(compact.length, index + matchedKeyword.length + 48);
    return compact.slice(start, end);
  }
  function scoreKnowledgeEntry(entry, query) {
    const keywords = extractKeywords(query);
    const normalizedQuery = normalizeText(query);
    const corpus = [entry.title, entry.oneLiner, entry.whatIs, ...entry.problems, ...entry.workflow, ...entry.scenarios, ...entry.outcomes].join(
      " "
    );
    let score = scoreSource(corpus, query, keywords);
    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalizedKeyword && normalizedQuery.includes(normalizedKeyword)) {
        score += 8;
      }
    }
    return score;
  }
  function hasDirectKeywordHit(entry, query) {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) {
      return false;
    }
    return entry.keywords.some((keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return normalizedKeyword.length >= 2 && normalizedQuery.includes(normalizedKeyword);
    });
  }
  function pickKnowledgeEntry(query, knowledgeEntries) {
    const ranked = knowledgeEntries.map((entry) => {
      const baseScore = scoreKnowledgeEntry(entry, query);
      const priorityBoost = entry.source === "faq-standard-reply" && hasDirectKeywordHit(entry, query) ? 24 : 0;
      return { entry, score: baseScore + priorityBoost };
    }).sort((left, right) => right.score - left.score);
    const top = ranked[0];
    if (!top || top.score < 8) {
      return null;
    }
    return top.entry;
  }
  function buildKnowledgeAnswer(entry, question) {
    const lines = [
      "\u57FA\u4E8E\u5F53\u524D\u8D44\u6599\uFF0C\u7ED3\u6784\u5316\u7B54\u590D\u5982\u4E0B\uFF1A",
      `\u3010\u4F60\u7684\u95EE\u9898\u3011${question}`,
      `\u3010\u4E3B\u9898\u3011${entry.title}`,
      `\u3010\u4E00\u53E5\u8BDD\u3011${entry.oneLiner}`,
      `\u3010\u5B83\u662F\u4EC0\u4E48\u3011${entry.whatIs}`,
      "\u3010\u4E3B\u8981\u89E3\u51B3\u3011"
    ];
    entry.problems.forEach((item) => {
      lines.push(`- ${item}`);
    });
    lines.push("\u3010\u843D\u5730\u6D41\u7A0B\u3011");
    entry.workflow.forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`);
    });
    lines.push("\u3010\u9002\u7528\u573A\u666F\u3011");
    entry.scenarios.forEach((item) => {
      lines.push(`- ${item}`);
    });
    lines.push("\u3010\u9884\u671F\u6548\u679C\u3011");
    entry.outcomes.forEach((item) => {
      lines.push(`- ${item}`);
    });
    lines.push("\u3010\u53C2\u8003\u8D44\u6599\u3011");
    lines.push(`- \u77E5\u8BC6\u6761\u76EE\uFF1A${entry.title}`);
    lines.push(`- \u6765\u6E90\uFF1A${entry.source}`);
    return lines.join("\n");
  }
  function formatConsultingPrice(item) {
    if (item.negotiable) {
      return "\u9762\u8BAE";
    }
    if (!item.price.trim()) {
      return "\u9762\u8BAE";
    }
    if (item.price.startsWith("\xA5") || item.price.startsWith("\uFFE5")) {
      return item.price;
    }
    return `\xA5${item.price}`;
  }
  function buildPriceAnswer(input) {
    const { query, products, consultingServices } = input;
    const matchedProducts = rankByQuery(products, query, (item) => `${item.name} ${item.category} ${item.summary}`).slice(0, 8);
    const matchedConsulting = rankByQuery(
      consultingServices,
      query,
      (item) => `${item.name} ${item.category} ${item.introduction}`
    ).slice(0, 5);
    if (matchedProducts.length === 0 && matchedConsulting.length === 0) {
      const examples = products.slice(0, 3).map((item) => item.name).join("\u3001");
      return `\u6682\u65E0\u7CBE\u786E\u5339\u914D\u3002\u4F60\u53EF\u4EE5\u8BD5\u8BD5\u8FD9\u4E9B\u793A\u4F8B\uFF1A${examples || "\u516D\u89D2\u5934\u87BA\u6813\u3001\u9AD8\u901F\u87BA\u4E1D\u673A"}\u3002`;
    }
    const lines = ["\u5DF2\u68C0\u7D22\u5230\u4EE5\u4E0B\u4EF7\u683C\u4FE1\u606F\uFF1A"];
    matchedProducts.forEach((item) => {
      var _a;
      lines.push(`- [${item.category}] ${item.name}\uFF1A${item.priceText}`);
      if ((_a = item.parameters) == null ? void 0 : _a.length) {
        lines.push(`  \u53C2\u6570\uFF1A${item.parameters.map((parameter) => `${parameter.label}=${parameter.value}`).join("\uFF1B")}`);
      }
    });
    matchedConsulting.forEach((item) => {
      lines.push(`- [\u54A8\u8BE2] ${item.name}\uFF1A${formatConsultingPrice(item)}`);
    });
    lines.push("\u3010\u53C2\u8003\u8D44\u6599\u3011");
    matchedProducts.forEach((item) => {
      lines.push(`- \u4EA7\u54C1\uFF1A${item.name}`);
    });
    matchedConsulting.forEach((item) => {
      lines.push(`- \u54A8\u8BE2\u670D\u52A1\uFF1A${item.name}`);
    });
    lines.push("\u5982\u9700\u6B63\u5F0F\u62A5\u4EF7\uFF0C\u8BF7\u63D0\u4EA4\u8054\u7CFB\u9700\u6C42\u3002");
    return lines.join("\n");
  }
  function buildDocumentAnswer(input) {
    const { query, knowledgeEntries, articles, products, consultingServices, contentSources, siteConfig } = input;
    const question = query.trim() || "\u8BF7\u4ECB\u7ECD\u4F60\u4EEC\u7684\u5E73\u53F0\u80FD\u529B";
    const matchedKnowledge = pickKnowledgeEntry(question, knowledgeEntries);
    if (matchedKnowledge) {
      const content2 = buildKnowledgeAnswer(matchedKnowledge, question);
      return input.returnMeta ? { content: content2, meta: { strategy: "knowledge", matchedKnowledgeEntry: matchedKnowledge, matchedContentSources: [] } } : content2;
    }
    const matchedArticles = rankByQuery(articles, question, (item) => `${item.title} ${item.summary} ${item.category}`).slice(0, 3);
    const matchedProducts = rankByQuery(products, question, (item) => `${item.name} ${item.category} ${item.summary}`).slice(0, 3);
    const matchedConsulting = rankByQuery(
      consultingServices,
      question,
      (item) => `${item.name} ${item.category} ${item.introduction}`
    ).slice(0, 2);
    const matchedSources = pickMatchedContentSources(question, contentSources);
    const lines = [
      "\u57FA\u4E8E\u5F53\u524D\u8D44\u6599\uFF0C\u7ED3\u6784\u5316\u7B54\u590D\u5982\u4E0B\uFF1A",
      `\u3010\u4F60\u7684\u95EE\u9898\u3011${question}`,
      `\u3010\u5E73\u53F0\u5B9A\u4F4D\u3011${siteConfig.heroTitle}`,
      `\u3010\u670D\u52A1\u7B80\u4ECB\u3011${siteConfig.about}`
    ];
    if (matchedArticles.length === 0 && matchedProducts.length === 0 && matchedConsulting.length === 0 && matchedSources.length === 0) {
      lines.push("\u3010\u8BF4\u660E\u3011\u5F53\u524D\u8D44\u6599\u6CA1\u6709\u76F4\u63A5\u547D\u4E2D\u8BE5\u95EE\u9898\u3002\u53EF\u4EE5\u8865\u5145\u77E5\u8BC6\u6761\u76EE\u540E\u518D\u56DE\u7B54\u3002");
      const content2 = lines.join("\n");
      return input.returnMeta ? { content: content2, meta: { strategy: "document", matchedKnowledgeEntry: null, matchedContentSources: [] } } : content2;
    }
    if (matchedArticles.length > 0) {
      lines.push("\u3010\u76F8\u5173\u6587\u6863\u6458\u8981\u3011");
      matchedArticles.forEach((item) => {
        lines.push(`- ${item.title}\uFF1A${item.summary}`);
      });
    }
    if (matchedProducts.length > 0) {
      lines.push("\u3010\u76F8\u5173\u4EA7\u54C1\u7EBF\u7D22\u3011");
      matchedProducts.forEach((item) => {
        var _a;
        lines.push(`- ${item.name}\uFF08${item.category}\uFF09\uFF1A${item.summary}`);
        if ((_a = item.parameters) == null ? void 0 : _a.length) {
          lines.push(`  \u53C2\u6570\uFF1A${item.parameters.map((parameter) => `${parameter.label}=${parameter.value}`).join("\uFF1B")}`);
        }
      });
    }
    if (matchedConsulting.length > 0) {
      lines.push("\u3010\u76F8\u5173\u54A8\u8BE2\u7EBF\u7D22\u3011");
      matchedConsulting.forEach((item) => {
        lines.push(`- ${item.name}\uFF1A${item.introduction}`);
      });
    }
    if (matchedSources.length > 0) {
      lines.push("\u3010\u76F8\u5173\u8D44\u6599\u6E90\u3011");
      matchedSources.forEach((item) => {
        var _a, _b;
        lines.push(`- [${formatContentSourceType(item.type)}] ${item.title}\uFF1A${item.summary}`);
        if ((_a = item.category) == null ? void 0 : _a.trim()) {
          lines.push(`  \u5206\u7C7B\uFF1A${item.category.trim()}`);
        }
        if ((_b = item.answerHints) == null ? void 0 : _b.length) {
          lines.push(`  \u56DE\u7B54\u8981\u70B9\uFF1A${item.answerHints.join("\uFF1B")}`);
        }
        const snippet = pickContentSourceSnippet(item, question);
        if (snippet) {
          lines.push(`  \u6458\u5F55\uFF1A${snippet}`);
        }
      });
    }
    lines.push("\u3010\u53C2\u8003\u8D44\u6599\u3011");
    matchedArticles.forEach((item) => {
      lines.push(`- \u6587\u6863\uFF1A${item.title}`);
    });
    matchedProducts.forEach((item) => {
      lines.push(`- \u4EA7\u54C1\uFF1A${item.name}`);
    });
    matchedConsulting.forEach((item) => {
      lines.push(`- \u54A8\u8BE2\u670D\u52A1\uFF1A${item.name}`);
    });
    matchedSources.forEach((item) => {
      const sourceRef = item.sourceUrl || item.sourceLabel || item.id;
      lines.push(`- ${formatContentSourceType(item.type)}\uFF1A${item.title} (${sourceRef})`);
    });
    const content = lines.join("\n");
    return input.returnMeta ? { content, meta: { strategy: "document", matchedKnowledgeEntry: null, matchedContentSources: matchedSources } } : content;
  }
  function looksLikePriceQuestion(query) {
    return /价格|报价|多少钱|费用|预算|采购价|单价/.test(query);
  }
  function buildAttachmentNotice(attachments) {
    if (!(attachments == null ? void 0 : attachments.length)) {
      return "";
    }
    const lines = ["\u3010\u5DF2\u6536\u5230\u9644\u4EF6\u3011"];
    attachments.forEach((attachment) => {
      lines.push(`- ${attachment.name}\uFF08${Math.max(1, Math.round(attachment.size / 1024))} KB\uFF09`);
    });
    lines.push("\u5F53\u524D MVP \u5DF2\u652F\u6301\u622A\u56FE\u968F\u4F1A\u8BDD\u7559\u5B58\uFF1B\u82E5\u9700\u56FE\u50CF\u8BC6\u522B\u7ED3\u8BBA\uFF0C\u8BF7\u7531\u5BA2\u670D\u8FDB\u4E00\u6B65\u5904\u7406\u6216\u63A5\u5165\u89C6\u89C9\u6A21\u578B\u3002");
    return lines.join("\n");
  }
  function buildAssistantReply(input) {
    let baseAnswer;
    let meta;
    if (looksLikePriceQuestion(input.query)) {
      baseAnswer = buildPriceAnswer({
        query: input.query,
        products: input.products,
        consultingServices: input.consultingServices
      });
      meta = { strategy: "price", matchedKnowledgeEntry: null, matchedContentSources: [] };
    } else {
      const documentResult = buildDocumentAnswer({ ...input, returnMeta: true });
      baseAnswer = documentResult.content;
      meta = documentResult.meta;
    }
    const attachmentNotice = buildAttachmentNotice(input.attachments);
    const content = [baseAnswer, attachmentNotice].filter(Boolean).join("\n\n");
    return input.returnMeta ? { content, meta } : content;
  }

  // src/chat-history.ts
  var STORAGE_KEY = "customer-bot:history:v1";
  function emptyHistory() {
    return {
      md: [],
      price: [],
      contact: []
    };
  }
  function normalizeRole(value) {
    return value === "user" || value === "assistant" ? value : null;
  }
  function normalizeAttachment(value) {
    if (!value || typeof value !== "object") {
      return null;
    }
    const candidate = value;
    if (typeof candidate.id !== "string" || !candidate.id || typeof candidate.name !== "string" || typeof candidate.mimeType !== "string" || typeof candidate.size !== "number" || typeof candidate.dataUrl !== "string") {
      return null;
    }
    return {
      id: candidate.id,
      name: candidate.name,
      mimeType: candidate.mimeType,
      size: candidate.size,
      dataUrl: candidate.dataUrl
    };
  }
  function normalizeMessage(value) {
    if (!value || typeof value !== "object") {
      return null;
    }
    const candidate = value;
    const role = normalizeRole(candidate.role);
    if (!role || typeof candidate.content !== "string") {
      return null;
    }
    return {
      id: typeof candidate.id === "string" && candidate.id ? candidate.id : `${role}-${Date.now()}`,
      role,
      content: candidate.content,
      createdAt: typeof candidate.createdAt === "number" ? candidate.createdAt : Date.now(),
      attachments: Array.isArray(candidate.attachments) ? candidate.attachments.map((item) => normalizeAttachment(item)).filter((item) => Boolean(item)) : void 0
    };
  }
  function normalizeHistory(value) {
    const base = emptyHistory();
    if (!value || typeof value !== "object") {
      return base;
    }
    for (const moduleId of Object.keys(base)) {
      const items = value[moduleId];
      if (!Array.isArray(items)) {
        continue;
      }
      base[moduleId] = items.map((item) => normalizeMessage(item)).filter((item) => Boolean(item));
    }
    return base;
  }
  function createConversationHistoryStore(storage = globalThis.localStorage) {
    return {
      load() {
        if (!storage) {
          return emptyHistory();
        }
        try {
          const raw = storage.getItem(STORAGE_KEY);
          if (!raw) {
            return emptyHistory();
          }
          return normalizeHistory(JSON.parse(raw));
        } catch {
          return emptyHistory();
        }
      },
      save(history) {
        if (!storage) {
          return;
        }
        try {
          storage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch {
        }
      },
      clear() {
        if (!storage) {
          return;
        }
        try {
          storage.removeItem(STORAGE_KEY);
        } catch {
        }
      }
    };
  }

  // src/iframe-host.ts
  function createIframeHost() {
    let container = null;
    return {
      mount(options) {
        if (container) {
          return;
        }
        container = document.createElement("div");
        container.className = "cbot-iframe-host";
        container.innerHTML = `
        <iframe
          title="Customer Bot"
          src="${options.iframeSrc}"
          style="position:fixed;right:16px;bottom:16px;width:380px;height:640px;border:0;border-radius:16px;box-shadow:0 20px 52px rgba(20,33,61,.2);z-index:9999;background:#fff;"
        ></iframe>
      `;
        document.body.appendChild(container);
      },
      destroy() {
        container == null ? void 0 : container.remove();
        container = null;
      }
    };
  }

  // src/llm-adapter.ts
  function createLlmAdapter(options) {
    return {
      async reply(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        async function fallbackResult() {
          return {
            content: await options.fallback(input),
            model: options.model || "",
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            status: "fallback"
          };
        }
        if (!options.endpoint || !options.apiKey || !options.model) {
          return fallbackResult();
        }
        try {
          const fetcher = options.fetcher || fetch;
          const soul = options.soulProfile ? [
            options.soulProfile.role ? `\u89D2\u8272\uFF1A${options.soulProfile.role}` : "",
            options.soulProfile.tone ? `\u8BED\u6C14\uFF1A${options.soulProfile.tone}` : "",
            ((_a = options.soulProfile.goals) == null ? void 0 : _a.length) ? `\u76EE\u6807\uFF1A${options.soulProfile.goals.join("\uFF1B")}` : ""
          ].filter(Boolean).join("\n") : "";
          const messages = [
            {
              role: "system",
              content: [options.systemPrompt || "", soul].filter(Boolean).join("\n\n")
            },
            ...(input.history || []).map((item) => ({
              role: item.role,
              content: item.content
            })),
            {
              role: "user",
              content: [input.context || "", input.message].filter(Boolean).join("\n\n")
            }
          ];
          const response = await fetcher(options.endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${options.apiKey}`
            },
            body: JSON.stringify({
              model: options.model,
              messages
            })
          });
          if (!response.ok) {
            return fallbackResult();
          }
          const data = await response.json();
          const content = (_e = (_d = (_c = (_b = data.choices) == null ? void 0 : _b[0]) == null ? void 0 : _c.message) == null ? void 0 : _d.content) == null ? void 0 : _e.trim();
          if (!content) {
            return fallbackResult();
          }
          return {
            content,
            model: options.model,
            inputTokens: ((_f = data.usage) == null ? void 0 : _f.prompt_tokens) || 0,
            outputTokens: ((_g = data.usage) == null ? void 0 : _g.completion_tokens) || 0,
            totalTokens: ((_h = data.usage) == null ? void 0 : _h.total_tokens) || 0,
            status: "success"
          };
        } catch {
          return fallbackResult();
        }
      }
    };
  }

  // src/widget.ts
  var STYLE_ID = "customer-bot-style";
  function trimTrailingSlash(value) {
    return value.replace(/\/+$/, "");
  }
  function buildApiUrl(path, apiBaseUrl) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    if (!apiBaseUrl) {
      return normalizedPath;
    }
    return `${trimTrailingSlash(apiBaseUrl)}${normalizedPath}`;
  }
  function ensureStyle(themeColor) {
    const existing = document.getElementById(STYLE_ID);
    if (existing) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
    .cbot-root {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 9999;
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: #102132;
      width: min(420px, calc(100vw - 24px));
    }
    .cbot-root[data-open="true"] .cbot-trigger {
      opacity: 0;
      pointer-events: none;
      transform: translateY(10px) scale(.98);
    }
    .cbot-trigger {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      border: 0;
      border-radius: 999px;
      background: linear-gradient(135deg, ${themeColor}, #0b5f7d);
      color: #fff;
      padding: 12px 16px 12px 14px;
      cursor: pointer;
      box-shadow: 0 18px 40px rgba(9, 45, 65, 0.28);
      transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
      overflow: hidden;
    }
    .cbot-trigger::after {
      content: "";
      position: absolute;
      inset: auto -40% -55% auto;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,.28), transparent 62%);
      pointer-events: none;
    }
    .cbot-trigger:hover {
      transform: translateY(-2px);
      box-shadow: 0 24px 46px rgba(9, 45, 65, 0.34);
    }
    .cbot-trigger-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      font-size: 16px;
      flex: none;
    }
    .cbot-trigger-copy {
      display: grid;
      gap: 2px;
      text-align: left;
    }
    .cbot-trigger-title {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.1;
    }
    .cbot-trigger-meta {
      font-size: 11px;
      line-height: 1.1;
      opacity: 0.82;
    }
    .cbot-trigger-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-left: 4px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.16);
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
    }
    .cbot-trigger-status::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #8cf0bd;
      box-shadow: 0 0 0 4px rgba(140, 240, 189, 0.16);
      flex: none;
    }
    .cbot-panel {
      display: none;
      width: 100%;
      height: min(720px, calc(100vh - 96px));
      margin-top: 12px;
      border: 1px solid rgba(188, 207, 220, 0.9);
      border-radius: 26px;
      background:
        radial-gradient(circle at top right, rgba(17, 138, 178, 0.12), transparent 34%),
        linear-gradient(180deg, #fcfeff, #f5f9fc 100%);
      overflow: hidden;
      box-shadow: 0 26px 70px rgba(20, 33, 61, 0.24);
      backdrop-filter: blur(8px);
    }
    .cbot-panel.is-open {
      display: grid;
      grid-template-rows: auto auto auto 1fr auto auto;
    }
    .cbot-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 14px;
      padding: 18px 18px 16px;
      background:
        radial-gradient(circle at top left, rgba(255,255,255,.38), transparent 30%),
        linear-gradient(135deg, rgba(11, 95, 125, 0.98), rgba(17, 138, 178, 0.92));
      border-bottom: 1px solid #e2e8f0;
    }
    .cbot-head-main {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      min-width: 0;
    }
    .cbot-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #fff;
      font-size: 14px;
      font-weight: 800;
      flex: none;
      backdrop-filter: blur(6px);
    }
    .cbot-head strong {
      display: block;
      font-size: 18px;
      line-height: 1.2;
      color: #fff;
    }
    .cbot-kicker {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(232, 246, 252, 0.82);
    }
    .cbot-subtitle {
      margin: 6px 0 0;
      font-size: 12px;
      line-height: 1.5;
      color: rgba(239, 248, 252, 0.84);
    }
    .cbot-service-line {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .cbot-service-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 10px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #f7fdff;
      font-size: 11px;
      line-height: 1;
      white-space: nowrap;
    }
    .cbot-close {
      width: 34px;
      height: 34px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      cursor: pointer;
      flex: none;
      backdrop-filter: blur(6px);
    }
    .cbot-templates {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid #edf2f7;
      overflow-x: auto;
      background: rgba(249, 251, 255, 0.8);
    }
    .cbot-overview {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      padding: 12px 16px 14px;
      border-bottom: 1px solid #edf2f7;
      background: rgba(249, 251, 255, 0.78);
      min-width: 0;
    }
    .cbot-overview-card {
      min-width: 0;
      padding: 10px 12px;
      border: 1px solid #dbe7f0;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.88);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
    }
    .cbot-overview-card.is-emphasis {
      border-color: rgba(17, 138, 178, 0.26);
      background: linear-gradient(180deg, rgba(230, 246, 252, 0.96), rgba(255, 255, 255, 0.96));
    }
    .cbot-overview-label {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #688197;
    }
    .cbot-overview-value {
      margin: 0;
      font-size: 13px;
      line-height: 1.45;
      color: #153147;
    }
    .cbot-context {
      display: grid;
      gap: 8px;
      padding: 12px 16px 14px;
      border-bottom: 1px solid #edf2f7;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 251, 254, 0.92));
      min-width: 0;
    }
    .cbot-context-label {
      margin: 0;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #688197;
    }
    .cbot-context-copy {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      color: #264156;
    }
    .cbot-welcome {
      display: grid;
      gap: 10px;
      margin-bottom: 14px;
      padding: 14px;
      border: 1px solid #dce8f1;
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(243, 248, 252, 0.96));
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }
    .cbot-welcome-title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.4;
      color: #173247;
    }
    .cbot-welcome-copy {
      margin: 0;
      font-size: 12px;
      line-height: 1.65;
      color: #5a7489;
    }
    .cbot-welcome-list {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .cbot-welcome-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12px;
      line-height: 1.55;
      color: #274156;
    }
    .cbot-welcome-dot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(17, 138, 178, 0.12);
      color: #0f6f90;
      font-size: 11px;
      font-weight: 700;
      flex: none;
      margin-top: 1px;
    }
    .cbot-template-btn,
    .cbot-send,
    .cbot-contact-submit {
      border-radius: 999px;
      cursor: pointer;
      transition: transform .16s ease, border-color .16s ease, background .16s ease, color .16s ease;
    }
    .cbot-template-btn {
      padding: 7px 12px;
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid #d7e3ef;
      color: #35526f;
      white-space: nowrap;
    }
    .cbot-template-btn:hover,
    .cbot-send:hover,
    .cbot-contact-submit:hover {
      transform: translateY(-1px);
    }
    .cbot-chat-log {
      display: flex;
      flex-direction: column;
      overflow: auto;
      padding: 14px 16px 10px;
      background:
        linear-gradient(180deg, rgba(250, 252, 255, 0.85), rgba(245, 250, 253, 0.92)),
        radial-gradient(circle at 0% 0%, rgba(17, 138, 178, 0.06), transparent 30%);
      min-height: 0;
    }
    .cbot-chat-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: min-content;
    }
    .cbot-message-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
    }
    .cbot-message-row.is-user {
      justify-content: flex-end;
    }
    .cbot-message-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(17, 138, 178, 0.16), rgba(11, 95, 125, 0.14));
      color: #0f6f90;
      font-size: 11px;
      font-weight: 800;
      flex: none;
    }
    .cbot-message-row.is-user .cbot-message-avatar {
      order: 2;
      background: linear-gradient(135deg, rgba(65, 166, 220, 0.18), rgba(108, 196, 242, 0.14));
      color: #1a6e95;
    }
    .cbot-message-row.is-system .cbot-message-avatar {
      background: rgba(242, 211, 155, 0.24);
      color: #9a6818;
    }
    .cbot-message-bubble {
      display: grid;
      gap: 6px;
      max-width: calc(100% - 40px);
    }
    .cbot-message {
      display: flex;
      flex-direction: column;
      width: fit-content;
      max-width: 100%;
      margin: 0;
      padding: 12px 14px;
      border-radius: 18px 18px 18px 8px;
      border: 1px solid #d8e4ef;
      background: rgba(255, 255, 255, 0.96);
      color: #1f3349;
      white-space: pre-wrap;
      line-height: 1.5;
      font-size: 13px;
      box-shadow: 0 12px 22px rgba(19, 43, 61, 0.06);
      text-align: left;
      align-self: flex-start;
    }
    .cbot-message.is-user {
      border-radius: 18px 18px 8px 18px;
      background: linear-gradient(180deg, #e2f5ff, #d6effd);
      border-color: #abd7ee;
    }
    .cbot-message.is-system {
      max-width: 100%;
      width: auto;
      margin-right: 0;
      border-style: dashed;
      background: #fff8ea;
      border-color: #f2d39b;
      color: #7a5822;
    }
    .cbot-message-meta {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 700;
      color: #56708a;
    }
    .cbot-message-note {
      font-size: 11px;
      line-height: 1.4;
      color: #6f8799;
      padding: 0 4px;
    }
    .cbot-message-body {
      display: grid;
      gap: 8px;
      justify-items: start;
      align-items: start;
      text-align: left;
    }
    .cbot-message-paragraph {
      margin: 0;
      width: 100%;
    }
    .cbot-chat-form,
    .cbot-contact-form {
      display: grid;
      gap: 10px;
      padding: 14px 16px 16px;
      border-top: 1px solid #edf2f7;
      background: rgba(255, 255, 255, 0.96);
    }
    .cbot-chat-form {
      grid-template-columns: 1fr auto;
      align-items: end;
      box-shadow: 0 -14px 30px rgba(19, 43, 61, 0.05);
    }
    .cbot-toolbar {
      grid-column: 1 / -1;
      display: grid;
      gap: 8px;
    }
    .cbot-input,
    .cbot-contact-form input,
    .cbot-contact-form select,
    .cbot-contact-form textarea {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #d4dce6;
      border-radius: 16px;
      padding: 12px 14px;
      font: inherit;
      background: #fff;
      color: #102132;
    }
    .cbot-input {
      min-height: 96px;
      resize: vertical;
      box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .cbot-send,
    .cbot-contact-submit {
      border: 0;
      background: linear-gradient(135deg, ${themeColor}, #0b5f7d);
      color: #fff;
      padding: 12px 16px;
      font-weight: 700;
      min-width: 84px;
    }
    .cbot-upload-btn {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 999px;
      background: #ecf5fb;
      color: #35526f;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
    }
    .cbot-file-input {
      display: none;
    }
    .cbot-attachment-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .cbot-attachment-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      border-radius: 12px;
      border: 1px solid #d7e3ef;
      background: #fff;
      font-size: 12px;
      color: #35526f;
    }
    .cbot-attachment-chip button {
      border: 0;
      background: transparent;
      color: #7a8fa3;
      cursor: pointer;
      padding: 0;
    }
    .cbot-message-attachments {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .cbot-message-attachment {
      display: block;
      width: 84px;
      height: 84px;
      overflow: hidden;
      border-radius: 12px;
      border: 1px solid #d7e3ef;
      background: #eef5fb;
    }
    .cbot-message-attachment img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }
    .cbot-contact-panel {
      display: none;
      padding: 0 16px 16px;
      border-top: 1px solid #edf2f7;
      background: #f8fbff;
      min-width: 0;
    }
    .cbot-contact-panel.is-active {
      display: block;
    }
    .cbot-contact-meta,
    .cbot-contact-notice {
      margin: 8px 0 0;
      font-size: 12px;
      line-height: 1.5;
      color: #35526f;
      white-space: pre-wrap;
    }
    .cbot-chat-status {
      min-height: 20px;
      padding: 6px 16px 10px;
      font-size: 12px;
      line-height: 1.5;
      color: #587186;
      background: rgba(255, 255, 255, 0.96);
      border-top: 1px solid rgba(237, 242, 247, 0.7);
    }
    .cbot-chat-status.is-error {
      color: #b4491f;
    }
    .cbot-send[disabled],
    .cbot-contact-submit[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    @media (max-width: 640px) {
      .cbot-root {
        right: 12px;
        left: 12px;
        bottom: 12px;
        width: auto;
      }
      .cbot-trigger {
        width: 100%;
        justify-content: center;
      }
      .cbot-panel {
        width: 100%;
        height: min(76vh, 680px);
      }
      .cbot-overview {
        grid-template-columns: 1fr;
      }
      .cbot-chat-form {
        grid-template-columns: 1fr;
      }
      .cbot-send {
        width: 100%;
      }
      .cbot-message-bubble {
        max-width: calc(100% - 8px);
      }
    }
  `;
    document.head.appendChild(style);
  }
  function createRoot(themeColor, siteName) {
    const root = document.createElement("div");
    root.className = "cbot-root";
    root.innerHTML = `
    <button type="button" class="cbot-trigger" aria-label="\u6253\u5F00 AI \u5BA2\u670D">
      <span class="cbot-trigger-badge">AI</span>
      <span class="cbot-trigger-copy">
        <span class="cbot-trigger-title">AI \u5BA2\u670D</span>
        <span class="cbot-trigger-meta">\u6587\u6863\u7B54\u7591 / \u62A5\u4EF7 / \u7559\u8D44</span>
      </span>
      <span class="cbot-trigger-status">\u5728\u7EBF</span>
    </button>
    <section class="cbot-panel" aria-label="AI \u5BA2\u670D">
      <header class="cbot-head">
        <div class="cbot-head-main">
          <span class="cbot-avatar">AI</span>
          <div>
            <p class="cbot-kicker">${siteName}</p>
            <strong>AI \u5BA2\u670D\u670D\u52A1\u53F0</strong>
<!--            <p class="cbot-subtitle">\u5148\u56DE\u7B54\u95EE\u9898\uFF0C\u518D\u5224\u65AD\u4EF7\u683C\u548C\u8054\u7CFB\u9700\u6C42\uFF0C\u51CF\u5C11\u6765\u56DE\u786E\u8BA4\u3002</p>-->
            <div class="cbot-service-line">
              <span class="cbot-service-pill">7 x 24 \u5728\u7EBF\u63A5\u5F85</span>
              <span class="cbot-service-pill">\u4F18\u5148\u57FA\u4E8E\u5F53\u524D\u8D44\u6599\u56DE\u7B54</span>
            </div>
          </div>
        </div>
        <button type="button" class="cbot-close" aria-label="\u5173\u95ED AI \u5BA2\u670D">\xD7</button>
      </header>
     <!--  <section class="cbot-overview" aria-label="\u5BA2\u670D\u80FD\u529B\u6982\u89C8">
        <article class="cbot-overview-card is-emphasis">
          <p class="cbot-overview-label">\u5F53\u524D\u7AD9\u70B9</p>
          <p class="cbot-overview-value">${siteName}</p>
        </article>
        <article class="cbot-overview-card">
          <p class="cbot-overview-label">\u54CD\u5E94\u65B9\u5F0F</p>
          <p class="cbot-overview-value">\u5148\u7B54\u7591\uFF0C\u518D\u62A5\u4EF7\uFF0C\u518D\u63A8\u8FDB\u8054\u7CFB</p>
        </article>
        <article class="cbot-overview-card">
          <p class="cbot-overview-label">\u9002\u7528\u573A\u666F</p>
          <p class="cbot-overview-value">\u65B9\u6848\u54A8\u8BE2\u3001\u4EA7\u54C1\u8BE2\u4EF7\u3001\u5408\u4F5C\u7559\u8D44</p>
        </article>
      </section>
     <section class="cbot-context" aria-live="polite">-->
<!--        <p class="cbot-context-label">\u5F53\u524D\u6A21\u5757\u8BF4\u660E</p>-->
<!--        <p class="cbot-context-copy"></p>-->
<!--      </section>-->
      <div class="cbot-templates"></div>
      <div class="cbot-chat-log"></div>
      <div class="cbot-chat-status" aria-live="polite"></div>
      <form class="cbot-chat-form">
        <textarea class="cbot-input" rows="2" placeholder="\u8BF7\u8F93\u5165\u95EE\u9898"></textarea>
        <div class="cbot-toolbar">
          <label class="cbot-upload-btn">
            <input class="cbot-file-input" type="file" accept="image/*" multiple />
            \u622A\u56FE\u9644\u4EF6
          </label>
          <div class="cbot-attachment-list"></div>
        </div>
        <button type="submit" class="cbot-send">\u53D1\u9001</button>
      </form>
      <section class="cbot-contact-panel">
        <p class="cbot-contact-meta"></p>
        <form class="cbot-contact-form">
          <input name="name" type="text" maxlength="50" placeholder="\u59D3\u540D" required />
          <input name="company" type="text" maxlength="100" placeholder="\u516C\u53F8" required />
          <input name="contact" type="text" maxlength="100" placeholder="\u624B\u673A\u53F7 / \u90AE\u7BB1 / \u5FAE\u4FE1" required />
          <select name="demandType" required>
            <option value="\u6C7D\u8F66\u4EA7\u4EF6\u8BE2\u4EF7">\u6C7D\u8F66\u4EA7\u4EF6\u8BE2\u4EF7</option>
            <option value="\u673A\u53F0\u8BBE\u5907\u8BE2\u4EF7">\u673A\u53F0\u8BBE\u5907\u8BE2\u4EF7</option>
            <option value="\u9879\u76EE\u5408\u4F5C\u54A8\u8BE2">\u9879\u76EE\u5408\u4F5C\u54A8\u8BE2</option>
          </select>
          <textarea name="message" maxlength="300" rows="2" placeholder="\u8865\u5145\u9700\u6C42\uFF08\u9009\u586B\uFF09"></textarea>
          <button type="submit" class="cbot-contact-submit">\u63D0\u4EA4\u8054\u7CFB\u9700\u6C42</button>
        </form>
        <p class="cbot-contact-notice"></p>
      </section>
    </section>
  `;
    ensureStyle(themeColor);
    document.body.appendChild(root);
    return root;
  }
  function createCustomerBot() {
    let root = null;
    let iframeHost = null;
    let activeModule = "md";
    let options = {};
    let isSending = false;
    const historyStore = createConversationHistoryStore();
    let tenantRuntimeConfig = null;
    let activeSessionId = null;
    let pendingAttachments = [];
    let initializedData = null;
    const promptTemplates = {
      md: [
        { label: "WMS \u662F\u4EC0\u4E48", prompt: "WMS \u662F\u600E\u6837\u4E00\u56DE\u4E8B\uFF1F" },
        { label: "\u91C7\u8D2D AI \u52A9\u624B", prompt: "\u91C7\u8D2D AI \u52A9\u624B\u80FD\u89E3\u51B3\u4EC0\u4E48\u95EE\u9898\uFF1F" },
        { label: "\u8D22\u7A0E OCR", prompt: "\u8D22\u7A0E OCR \u600E\u4E48\u843D\u5730\uFF1F" }
      ],
      price: [
        { label: "\u516D\u89D2\u5934\u87BA\u6813", prompt: "\u516D\u89D2\u5934\u87BA\u6813\u591A\u5C11\u94B1\uFF1F" },
        { label: "\u9AD8\u901F\u87BA\u4E1D\u673A", prompt: "\u9AD8\u901F\u87BA\u4E1D\u673A\u4EF7\u683C\u662F\u591A\u5C11\uFF1F" },
        { label: "\u54A8\u8BE2\u670D\u52A1", prompt: "\u667A\u80FD\u5DE5\u5382\u8BCA\u65AD\u54A8\u8BE2\u4EF7\u683C\u662F\u591A\u5C11\uFF1F" }
      ],
      contact: [
        { label: "\u8054\u7CFB\u65B9\u5F0F", prompt: "\u8BF7\u628A\u7535\u8BDD\u548C\u90AE\u7BB1\u544A\u8BC9\u6211\u3002" },
        { label: "\u6700\u5FEB\u6C9F\u901A", prompt: "\u600E\u6837\u6700\u5FEB\u8054\u7CFB\u5230\u4F60\u4EEC\uFF1F" },
        { label: "\u63D0\u9700\u6C42", prompt: "\u63D0\u4EA4\u5408\u4F5C\u9700\u6C42\u9700\u8981\u54EA\u4E9B\u4FE1\u606F\uFF1F" }
      ]
    };
    const moduleDescriptions = {
      md: "\u9002\u5408\u5148\u95EE\u7CFB\u7EDF\u6982\u5FF5\u3001\u843D\u5730\u65B9\u5F0F\u3001\u9002\u7528\u573A\u666F\u3002\u6211\u4F1A\u5C3D\u91CF\u57FA\u4E8E\u5F53\u524D\u79DF\u6237\u8D44\u6599\u7ED9\u4F60\u7ED3\u6784\u5316\u56DE\u7B54\u3002",
      price: "\u9002\u5408\u76F4\u63A5\u95EE\u4EA7\u54C1\u6216\u670D\u52A1\u4EF7\u683C\u3002\u5982\u679C\u8D44\u6599\u91CC\u6709\u547D\u4E2D\u7684\u4EA7\u54C1\u53C2\u6570\u6216\u54A8\u8BE2\u670D\u52A1\uFF0C\u6211\u4F1A\u4F18\u5148\u6309\u660E\u786E\u4EF7\u683C\u56DE\u7B54\u3002",
      contact: "\u9002\u5408\u51C6\u5907\u8FDB\u5165\u4EBA\u5DE5\u6C9F\u901A\u9636\u6BB5\u65F6\u4F7F\u7528\u3002\u4F60\u53EF\u4EE5\u76F4\u63A5\u62FF\u8054\u7CFB\u65B9\u5F0F\uFF0C\u6216\u63D0\u4EA4\u5408\u4F5C\u9700\u6C42\u8868\u5355\u3002"
    };
    const moduleWelcomeCards = {
      md: {
        title: "\u5148\u95EE\u6E05\u695A\uFF0C\u518D\u51B3\u5B9A\u8981\u4E0D\u8981\u7EE7\u7EED\u63A8\u8FDB",
        copy: "\u9002\u5408\u7B2C\u4E00\u6B21\u63A5\u89E6\u65B9\u6848\u65F6\u4F7F\u7528\u3002\u4F60\u53EF\u4EE5\u76F4\u63A5\u95EE\u6982\u5FF5\u3001\u6D41\u7A0B\u3001\u9002\u7528\u573A\u666F\u6216\u5B9E\u65BD\u65B9\u5F0F\u3002",
        bullets: ["\u53EF\u5148\u95EE\u7CFB\u7EDF\u662F\u4EC0\u4E48", "\u53EF\u8FFD\u95EE\u843D\u5730\u6B65\u9AA4", "\u53EF\u7ED3\u5408\u622A\u56FE\u6216\u8D44\u6599\u7EE7\u7EED\u8FFD\u95EE"]
      },
      price: {
        title: "\u5148\u786E\u8BA4\u540D\u79F0\uFF0C\u518D\u8FD4\u56DE\u53EF\u7528\u4EF7\u683C\u4FE1\u606F",
        copy: "\u9002\u5408\u4EA7\u54C1\u6216\u670D\u52A1\u8BE2\u4EF7\u3002\u8F93\u5165\u660E\u786E\u540D\u79F0\u65F6\uFF0C\u56DE\u590D\u4F1A\u66F4\u7A33\u5B9A\uFF1B\u5982\u679C\u540D\u79F0\u6A21\u7CCA\uFF0C\u6211\u4F1A\u5148\u5E2E\u4F60\u7F29\u5C0F\u8303\u56F4\u3002",
        bullets: ["\u4F18\u5148\u8F93\u5165\u4EA7\u54C1\u540D", "\u4E5F\u53EF\u95EE\u54A8\u8BE2\u670D\u52A1\u4EF7\u683C", "\u82E5\u8D44\u6599\u7F3A\u5931\uFF0C\u6211\u4F1A\u63D0\u9192\u8F6C\u4EBA\u5DE5\u786E\u8BA4"]
      },
      contact: {
        title: "\u8FDB\u5165\u4EBA\u5DE5\u6C9F\u901A\u524D\uFF0C\u628A\u5173\u952E\u4FE1\u606F\u4E00\u6B21\u8BF4\u6E05",
        copy: "\u9002\u5408\u51C6\u5907\u63A8\u8FDB\u5408\u4F5C\u65F6\u4F7F\u7528\u3002\u4F60\u53EF\u4EE5\u5148\u62FF\u8054\u7CFB\u65B9\u5F0F\uFF0C\u4E5F\u53EF\u4EE5\u76F4\u63A5\u63D0\u4EA4\u8868\u5355\uFF0C\u51CF\u5C11\u6765\u56DE\u8865\u5145\u3002",
        bullets: ["\u53EF\u5148\u62FF\u7535\u8BDD\u548C\u90AE\u7BB1", "\u53EF\u63D0\u4EA4\u516C\u53F8\u548C\u9700\u6C42", "\u9002\u5408\u62A5\u4EF7\u3001\u5408\u4F5C\u6216\u9879\u76EE\u54A8\u8BE2"]
      }
    };
    const history = historyStore.load();
    function persistHistory() {
      historyStore.save(history);
    }
    async function runLlmReply(module, message, fallback) {
      const adapter = createLlmAdapter({
        endpoint: options.llmEndpoint,
        apiKey: options.apiKey,
        model: options.model,
        fetcher: options.fetcher,
        systemPrompt: options.systemPrompt || "\u4F60\u662F\u5236\u9020\u4E1A\u7F51\u7AD9\u7684 AI \u5BA2\u670D\u3002\u4F60\u9700\u8981\u4FDD\u6301\u4E13\u4E1A\u3001\u53EF\u4FE1\u3001\u4E3B\u52A8\u63A8\u8FDB\u6210\u4EA4\uFF0C\u5E76\u5728\u5408\u9002\u65F6\u6536\u96C6\u7EBF\u7D22\u3002",
        soulProfile: options.soulProfile || {
          role: "\u5236\u9020\u4E1A\u89E3\u51B3\u65B9\u6848\u987E\u95EE",
          tone: "\u4E13\u4E1A\u3001\u76F4\u63A5\u3001\u53EF\u4FE1\u3001\u6709\u9500\u552E\u63A8\u8FDB\u610F\u8BC6",
          goals: ["\u5FEB\u901F\u5224\u65AD\u7528\u6237\u610F\u56FE", "\u63A8\u52A8\u54A8\u8BE2\u6216\u7559\u8D44", "\u56DE\u7B54\u65F6\u4FDD\u6301\u54C1\u724C\u4EBA\u683C"]
        },
        fallback: async () => fallback()
      });
      const result = await adapter.reply({
        message,
        history: history[module].filter((item) => item.content.trim()).slice(-6).map((item) => ({
          role: item.role,
          content: item.content
        })),
        context: initializedData ? [
          `\u7AD9\u70B9\uFF1A${initializedData.siteConfig.brandName}`,
          `\u7B80\u4ECB\uFF1A${initializedData.siteConfig.about}`,
          `\u4EA7\u54C1\u6570\uFF1A${initializedData.products.length}`,
          `\u54A8\u8BE2\u670D\u52A1\u6570\uFF1A${initializedData.consultingServices.length}`
        ].join("\n") : ""
      });
      return result.content;
    }
    function getPanel() {
      var _a;
      return (_a = root == null ? void 0 : root.querySelector(".cbot-panel")) != null ? _a : null;
    }
    function getSiteConfig() {
      if (tenantRuntimeConfig) {
        return {
          brandName: tenantRuntimeConfig.brandName,
          heroTitle: demoSiteConfig.heroTitle,
          about: demoSiteConfig.about,
          phone: tenantRuntimeConfig.contactPhone,
          email: tenantRuntimeConfig.contactEmail,
          address: tenantRuntimeConfig.contactAddress
        };
      }
      const mergedContact = options.contact || {};
      return {
        ...demoSiteConfig,
        ...mergedContact,
        brandName: options.siteName || mergedContact.brandName || demoSiteConfig.brandName
      };
    }
    function getFetcher() {
      return options.fetcher || fetch;
    }
    async function loadTenantRuntimeConfig() {
      if (!options.tenantId) {
        return;
      }
      const response = await getFetcher()(
        `${buildApiUrl("/api/embed/config", options.apiBaseUrl)}?tenantId=${encodeURIComponent(options.tenantId)}`
      );
      if (!response.ok) {
        throw new Error("Failed to load tenant config");
      }
      tenantRuntimeConfig = await response.json();
    }
    function syncRuntimeConfigToDom() {
      if (!root || !tenantRuntimeConfig) {
        return;
      }
      const kicker = root.querySelector(".cbot-kicker");
      if (kicker) {
        kicker.textContent = tenantRuntimeConfig.brandName;
      }
      const contactMeta = root.querySelector(".cbot-contact-meta");
      if (contactMeta) {
        contactMeta.textContent = `\u7535\u8BDD\uFF1A${tenantRuntimeConfig.contactPhone}
\u90AE\u7BB1\uFF1A${tenantRuntimeConfig.contactEmail}
\u5730\u5740\uFF1A${tenantRuntimeConfig.contactAddress}`;
      }
    }
    async function runBackendChat(message, attachments = []) {
      if (!options.tenantId) {
        throw new Error("tenantId is required");
      }
      const response = await getFetcher()(buildApiUrl("/api/chat", options.apiBaseUrl), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tenantId: options.tenantId,
          sessionId: activeSessionId,
          message,
          attachments
        })
      });
      if (!response.ok) {
        throw new Error("Failed to send chat message");
      }
      const data = await response.json();
      activeSessionId = data.sessionId || activeSessionId;
      return data.reply;
    }
    async function submitTenantLead(body) {
      if (!options.tenantId) {
        throw new Error("tenantId is required");
      }
      const response = await getFetcher()(buildApiUrl("/api/contact", options.apiBaseUrl), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...body,
          tenantId: options.tenantId,
          sessionId: activeSessionId
        })
      });
      if (!response.ok) {
        throw new Error("Failed to submit lead");
      }
      const data = await response.json();
      return data.message || "\u63D0\u4EA4\u6210\u529F\uFF0C\u6211\u4EEC\u4F1A\u5C3D\u5FEB\u8054\u7CFB\u4F60\u3002";
    }
    function renderTemplates() {
      const container = root == null ? void 0 : root.querySelector(".cbot-templates");
      if (!container) {
        return;
      }
      container.innerHTML = promptTemplates[activeModule].map((item) => `<button type="button" class="cbot-template-btn" data-prompt="${item.prompt}">${item.label}</button>`).join("");
    }
    function setChatStatus(message = "", type = "default") {
      const status = root == null ? void 0 : root.querySelector(".cbot-chat-status");
      if (!status) {
        return;
      }
      status.textContent = message;
      status.classList.toggle("is-error", type === "error");
    }
    function renderModuleContext() {
      const context = root == null ? void 0 : root.querySelector(".cbot-context-copy");
      if (!context) {
        return;
      }
      context.textContent = moduleDescriptions[activeModule];
    }
    function renderWelcomeCard() {
      const chatLog = root == null ? void 0 : root.querySelector(".cbot-chat-log");
      if (!chatLog || history[activeModule].length > 0) {
        return "";
      }
      const card = moduleWelcomeCards[activeModule];
      return `
      <section class="cbot-welcome">
        <p class="cbot-welcome-title">${card.title}</p>
        <p class="cbot-welcome-copy">${card.copy}</p>
        <ul class="cbot-welcome-list">
          ${card.bullets.map(
        (item, index) => `<li class="cbot-welcome-item"><span class="cbot-welcome-dot">${index + 1}</span><span>${item}</span></li>`
      ).join("")}
        </ul>
      </section>
    `;
    }
    function formatMessageContent(content) {
      const paragraphs = content.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
      if (!paragraphs.length) {
        return '<p class="cbot-message-paragraph"></p>';
      }
      return `<div class="cbot-message-body">${paragraphs.map((paragraph) => `<p class="cbot-message-paragraph">${paragraph.replace(/\n/g, "<br />")}</p>`).join("")}</div>`;
    }
    function setSendingState(nextState) {
      isSending = nextState;
      const sendButton = root == null ? void 0 : root.querySelector(".cbot-send");
      const input = root == null ? void 0 : root.querySelector(".cbot-input");
      const fileInput = root == null ? void 0 : root.querySelector(".cbot-file-input");
      if (sendButton) {
        sendButton.disabled = nextState;
        sendButton.textContent = nextState ? "\u53D1\u9001\u4E2D..." : "\u53D1\u9001";
      }
      if (input) {
        input.disabled = nextState;
      }
      if (fileInput) {
        fileInput.disabled = nextState;
      }
      if (nextState) {
        setChatStatus("AI \u6B63\u5728\u5904\u7406\u4F60\u7684\u95EE\u9898...", "default");
      }
    }
    function renderMessages() {
      const chatLog = root == null ? void 0 : root.querySelector(".cbot-chat-log");
      if (!chatLog) {
        return;
      }
      const messageMarkup = history[activeModule].map((item) => item).reduce((accumulator, item, index) => {
        var _a;
        if (index === 0) {
          const welcomeCard = renderWelcomeCard();
          if (welcomeCard) {
            accumulator.push(welcomeCard);
          }
        }
        accumulator.push(`
          <div class="cbot-message-row ${item.role === "user" ? "is-user" : item.role === "system" ? "is-system" : ""}">
            <span class="cbot-message-avatar">${item.role === "user" ? "\u6211" : item.role === "system" ? "!" : "AI"}</span>
            <div class="cbot-message-bubble">
              <article class="cbot-message ${item.role === "user" ? "is-user" : item.role === "system" ? "is-system" : ""}">
                <p class="cbot-message-meta">${item.role === "user" ? "\u4F60" : item.role === "system" ? "\u7CFB\u7EDF\u63D0\u793A" : "AI \u5BA2\u670D"}</p>
                ${formatMessageContent(item.content)}
                ${((_a = item.attachments) == null ? void 0 : _a.length) ? `<div class="cbot-message-attachments">${item.attachments.map(
          (attachment) => `<a class="cbot-message-attachment" href="${attachment.dataUrl}" target="_blank" rel="noreferrer"><img src="${attachment.dataUrl}" alt="${attachment.name}" /></a>`
        ).join("")}</div>` : ""}
              </article>
              <div class="cbot-message-note">${item.role === "user" ? "\u5DF2\u53D1\u9001" : item.role === "system" ? "\u8BF7\u5904\u7406\u540E\u91CD\u8BD5" : "\u57FA\u4E8E\u5F53\u524D\u8D44\u6599\u6574\u7406\u56DE\u590D"}</div>
            </div>
          </div>
        `);
        return accumulator;
      }, []).join("");
      chatLog.innerHTML = `<div class="cbot-chat-stack">${messageMarkup}</div>`;
      chatLog.scrollTop = chatLog.scrollHeight;
    }
    function renderActiveState() {
      const contactPanel = root == null ? void 0 : root.querySelector(".cbot-contact-panel");
      contactPanel == null ? void 0 : contactPanel.classList.toggle("is-active", activeModule === "contact");
      renderModuleContext();
      renderTemplates();
      renderMessages();
    }
    function pushMessage(module, role, content, attachments) {
      history[module].push({
        id: `${module}-${Date.now()}-${history[module].length + 1}`,
        role,
        content,
        createdAt: Date.now(),
        attachments: (attachments == null ? void 0 : attachments.length) ? structuredClone(attachments) : void 0
      });
      persistHistory();
      if (module === activeModule) {
        renderMessages();
      }
    }
    function renderPendingAttachments() {
      const container = root == null ? void 0 : root.querySelector(".cbot-attachment-list");
      if (!container) {
        return;
      }
      container.innerHTML = pendingAttachments.map(
        (attachment) => `<span class="cbot-attachment-chip">${attachment.name}<button type="button" data-remove-attachment="${attachment.id}">\u79FB\u9664</button></span>`
      ).join("");
    }
    function removePendingAttachment(attachmentId) {
      pendingAttachments = pendingAttachments.filter((item) => item.id !== attachmentId);
      renderPendingAttachments();
    }
    async function readFiles(files) {
      const inputFiles = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
      return Promise.all(
        inputFiles.map(
          (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                name: file.name,
                mimeType: file.type || "image/png",
                size: file.size,
                dataUrl: String(reader.result || "")
              });
            };
            reader.onerror = () => {
              reject(reader.error || new Error("Failed to read file"));
            };
            reader.readAsDataURL(file);
          })
        )
      );
    }
    function ensureWelcomeMessage(module) {
      if (history[module].length > 0) {
        return;
      }
      const welcomeMap = {
        md: "\u53EF\u4EE5\u76F4\u63A5\u5F00\u59CB\u63D0\u95EE\u3002\u6211\u4F1A\u4F18\u5148\u6839\u636E\u5F53\u524D\u7AD9\u70B9\u8D44\u6599\uFF0C\u6574\u7406\u6210\u66F4\u5BB9\u6613\u9605\u8BFB\u7684\u7ED3\u6784\u5316\u7B54\u590D\u3002",
        price: "\u53EF\u4EE5\u76F4\u63A5\u8F93\u5165\u4EA7\u54C1\u6216\u54A8\u8BE2\u670D\u52A1\u540D\u79F0\u3002\u6211\u4F1A\u5C3D\u91CF\u8FD4\u56DE\u547D\u4E2D\u7684\u4EF7\u683C\u4FE1\u606F\uFF0C\u5E76\u63D0\u9192\u662F\u5426\u9700\u8981\u4EBA\u5DE5\u7EE7\u7EED\u786E\u8BA4\u3002",
        contact: "\u53EF\u4EE5\u5148\u62FF\u8054\u7CFB\u65B9\u5F0F\uFF0C\u4E5F\u53EF\u4EE5\u76F4\u63A5\u63D0\u4EA4\u5408\u4F5C\u9700\u6C42\u3002\u6211\u4F1A\u5F15\u5BFC\u4F60\u628A\u5FC5\u8981\u4FE1\u606F\u4E00\u6B21\u8865\u9F50\u3002"
      };
      pushMessage(module, "assistant", welcomeMap[module]);
    }
    function bindEvents() {
      const trigger = root == null ? void 0 : root.querySelector(".cbot-trigger");
      const close = root == null ? void 0 : root.querySelector(".cbot-close");
      const templateContainer = root == null ? void 0 : root.querySelector(".cbot-templates");
      const chatForm = root == null ? void 0 : root.querySelector(".cbot-chat-form");
      const input = root == null ? void 0 : root.querySelector(".cbot-input");
      const fileInput = root == null ? void 0 : root.querySelector(".cbot-file-input");
      const contactForm = root == null ? void 0 : root.querySelector(".cbot-contact-form");
      trigger == null ? void 0 : trigger.addEventListener("click", () => {
        api.open();
      });
      close == null ? void 0 : close.addEventListener("click", () => {
        api.close();
      });
      templateContainer == null ? void 0 : templateContainer.addEventListener("click", (event) => {
        const target = event.target;
        if (!target.classList.contains("cbot-template-btn") || !input) {
          return;
        }
        input.value = target.dataset.prompt || "";
        chatForm == null ? void 0 : chatForm.requestSubmit();
      });
      root == null ? void 0 : root.addEventListener("click", (event) => {
        const target = event.target;
        const attachmentId = target == null ? void 0 : target.getAttribute("data-remove-attachment");
        if (!attachmentId) {
          return;
        }
        removePendingAttachment(attachmentId);
      });
      fileInput == null ? void 0 : fileInput.addEventListener("change", async () => {
        if (isSending) {
          return;
        }
        try {
          const attachments = await readFiles(fileInput.files);
          pendingAttachments = [...pendingAttachments, ...attachments].slice(0, 4);
          renderPendingAttachments();
        } finally {
          fileInput.value = "";
        }
      });
      chatForm == null ? void 0 : chatForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!input || !initializedData || isSending) {
          return;
        }
        const text = input.value.trim();
        if (!text) {
          return;
        }
        const attachments = pendingAttachments;
        pendingAttachments = [];
        renderPendingAttachments();
        pushMessage(activeModule, "user", text, attachments);
        input.value = "";
        setSendingState(true);
        try {
          if (options.tenantId) {
            const reply = await runBackendChat(text, attachments);
            pushMessage(activeModule, "assistant", reply);
            setChatStatus("");
            return;
          }
          if (activeModule === "md") {
            const reply = await runLlmReply(
              activeModule,
              text,
              () => buildAssistantReply({
                query: text,
                knowledgeEntries: initializedData.knowledge,
                articles: initializedData.articles,
                products: initializedData.products,
                consultingServices: initializedData.consultingServices,
                contentSources: [],
                siteConfig: initializedData.siteConfig,
                attachments
              })
            );
            pushMessage(activeModule, "assistant", reply);
            setChatStatus("");
            return;
          }
          if (activeModule === "price") {
            const reply = await runLlmReply(
              activeModule,
              text,
              () => buildPriceAnswer({
                query: text,
                products: initializedData.products,
                consultingServices: initializedData.consultingServices
              })
            );
            pushMessage(activeModule, "assistant", reply);
            setChatStatus("");
            return;
          }
          pushMessage(
            activeModule,
            "assistant",
            `\u53EF\u4EE5\u76F4\u63A5\u8054\u7CFB\u6211\uFF1A
- \u7535\u8BDD\uFF1A${initializedData.siteConfig.phone}
- \u90AE\u7BB1\uFF1A${initializedData.siteConfig.email}
- \u5730\u5740\uFF1A${initializedData.siteConfig.address}
\u4F60\u4E5F\u53EF\u4EE5\u4F7F\u7528\u4E0B\u65B9\u8868\u5355\u63D0\u4EA4\u9700\u6C42\u3002`
          );
          setChatStatus("");
        } catch (error) {
          const message = error instanceof Error ? error.message : "\u53D1\u9001\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002";
          pushMessage(activeModule, "system", `\u5F53\u524D\u6D88\u606F\u53D1\u9001\u5931\u8D25\u3002
${message}`);
          setChatStatus("\u5F53\u524D\u6D88\u606F\u53D1\u9001\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u673A\u5668\u4EBA\u670D\u52A1\u6216\u7A0D\u540E\u91CD\u8BD5\u3002", "error");
        } finally {
          setSendingState(false);
        }
      });
      contactForm == null ? void 0 : contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!initializedData) {
          return;
        }
        const notice = root == null ? void 0 : root.querySelector(".cbot-contact-notice");
        const formData = new FormData(contactForm);
        const body = {
          name: String(formData.get("name") || ""),
          company: String(formData.get("company") || ""),
          contact: String(formData.get("contact") || ""),
          demandType: String(formData.get("demandType") || ""),
          message: String(formData.get("message") || "")
        };
        if (options.tenantId) {
          try {
            const message = await submitTenantLead(body);
            if (notice) {
              notice.textContent = message;
            }
            contactForm.reset();
          } catch {
            if (notice) {
              notice.textContent = "\u63D0\u4EA4\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002";
            }
          }
          return;
        }
        if (options.submitEndpoint) {
          try {
            const response = await fetch(options.submitEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
            });
            const data = await response.json();
            if (notice) {
              notice.textContent = data.message || "\u63D0\u4EA4\u6210\u529F\uFF0C\u6211\u4EEC\u4F1A\u5C3D\u5FEB\u8054\u7CFB\u4F60\u3002";
            }
            contactForm.reset();
          } catch {
            if (notice) {
              notice.textContent = "\u63D0\u4EA4\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002";
            }
          }
          return;
        }
        if (notice) {
          notice.textContent = "\u63D0\u4EA4\u6210\u529F\uFF0C\u6211\u4EEC\u4F1A\u5728 1 \u4E2A\u5DE5\u4F5C\u65E5\u5185\u8054\u7CFB\u4F60\u3002";
        }
        contactForm.reset();
      });
    }
    const api = {
      init(initOptions = {}) {
        if (root || iframeHost) {
          return;
        }
        options = initOptions;
        if (options.mode === "iframe") {
          iframeHost = createIframeHost();
          iframeHost.mount({
            iframeSrc: options.iframeSrc || "./customer-bot-frame.html"
          });
          return;
        }
        initializedData = {
          knowledge: options.knowledge || assistantKnowledgeEntries,
          articles: options.articles || demoArticles,
          products: options.products || demoProducts,
          consultingServices: options.consultingServices || demoConsultingServices,
          siteConfig: getSiteConfig()
        };
        root = createRoot(options.themeColor || "#118ab2", options.siteName || initializedData.siteConfig.brandName);
        bindEvents();
        syncRuntimeConfigToDom();
        renderPendingAttachments();
        setChatStatus("");
        const contactMeta = root.querySelector(".cbot-contact-meta");
        if (contactMeta && !tenantRuntimeConfig) {
          contactMeta.textContent = `\u7535\u8BDD\uFF1A${initializedData.siteConfig.phone}
\u90AE\u7BB1\uFF1A${initializedData.siteConfig.email}
\u5730\u5740\uFF1A${initializedData.siteConfig.address}`;
        }
        ensureWelcomeMessage(activeModule);
        renderActiveState();
        if (options.tenantId) {
          void loadTenantRuntimeConfig().then(() => {
            initializedData = initializedData ? {
              ...initializedData,
              siteConfig: getSiteConfig()
            } : initializedData;
            syncRuntimeConfigToDom();
          });
        }
      },
      open() {
        var _a;
        if (iframeHost) {
          return;
        }
        (_a = getPanel()) == null ? void 0 : _a.classList.add("is-open");
      },
      close() {
        var _a;
        if (iframeHost) {
          return;
        }
        (_a = getPanel()) == null ? void 0 : _a.classList.remove("is-open");
      },
      destroy() {
        iframeHost == null ? void 0 : iframeHost.destroy();
        iframeHost = null;
        pendingAttachments = [];
        root == null ? void 0 : root.remove();
        root = null;
      }
    };
    return api;
  }

  // src/index.ts
  var instance = createCustomerBot();
  var globalApi = {
    init: instance.init,
    open: instance.open,
    close: instance.close,
    destroy: instance.destroy
  };
  if (typeof window !== "undefined") {
    ;
    window.CustomerBot = globalApi;
  }
  return __toCommonJS(src_exports);
})();
