export const heroContent = {
  lead: {
    cn: "以<strong>自然语言 · 低成本 · 交互式智能结合</strong>，完成 <strong>创意 → 路由 → 资产 → 迭代</strong> 全链路闭环。",
    en: "Blend <strong>natural language, low cost, and interactive intelligence</strong> to complete the full loop of <strong>Ideation → Routing → Assets → Iteration</strong>.",
  },
  steps: [
    {
      key: "ideation",
      cn: { title: "创意生成", desc: "自然语言/语音输入叠加提示词缓存" },
      en: { title: "Ideation", desc: "Voice/Text input blended with prompt memory" },
    },
    {
      key: "analysis",
      cn: { title: "智能解析", desc: "Lingine Router 自分析任务能力需求" },
      en: { title: "Intelligence", desc: "Lingine Router evaluates task capabilities" },
    },
    {
      key: "assets",
      cn: { title: "资产生成", desc: "级联 AI智能进行素材生成/迭代" },
      en: { title: "Asset Forge", desc: "Cascaded prompts drive asset generation & edits" },
    },
    {
      key: "extension",
      cn: { title: "创意延伸", desc: "产出下一轮灵感建议与商业洞察" },
      en: { title: "Extension", desc: "Delivers next-round ideas & business insights" },
    },
  ],
};

export const workflowContent = [
  {
    key: "ideation",
    cn: { title: "创意生成", desc: "Prompt Bank 记忆上下文，复用灵感，减少重复成本。" },
    en: { title: "Ideation", desc: "Prompt bank stores context to cut repeated cost." },
  },
  {
    key: "analysis",
    cn: { title: "智能解析", desc: "Router 基于语义 + 能力标签自动路由最优模型，展示延迟/成本。" },
    en: { title: "Intelligence", desc: "Router picks optimal models by intent, exposing latency/cost." },
  },
  {
    key: "deployment",
    cn: { title: "脚本部署", desc: "自组装引擎脚本注入角色卡，实现即插即用。" },
    en: { title: "Deployment", desc: "Self-assembling scripts plug role cards into the engine." },
  },
  {
    key: "feedback",
    cn: { title: "资产闭环", desc: "生成/修改素材，并回写引擎形成反馈闭环。" },
    en: { title: "Asset Loop", desc: "Generated assets sync back to the engine for feedback." },
  },
];

const sharedInputText = {
  title: { cn: "语言描述", en: "Language Description" },
  desc: { cn: "支持语音/文本与提示词拼接", en: "Supports voice/text with prompt concatenation" },
  placeholder: { cn: "例如：做一个叫炎魔的 Boss...", en: "e.g., Create a Boss called Flame Demon..." },
  help: {
    cn: "在此输入您想要创建的角色描述，例如：\"创建一个叫炎魔的Boss，血量和防御极高，使用火球和地狱火\"",
    en: "Enter the character description you want to create, e.g., \"Create a Flame Demon Boss with high HP and defense, using fireballs and hellfire\"",
  },
};

// 界面文本翻译
export const uiText = {
  nav: {
    hero: { cn: "概览", en: "Overview" },
    pipeline: { cn: "代码", en: "Code" },
    intelligence: { cn: "链路", en: "Intelligence" },
    creative: { cn: "创意", en: "Creative" },
    business: { cn: "数据", en: "Data" },
  },
  hero: {
    title: { cn: "端到端 AI 角色与素材工作流", en: "End-to-End AI Character & Asset Workflow" },
    runDemo: { cn: "开始创作", en: "Start Interactive Demo" },
    manualMode: {
      off: { cn: "手动模式：关闭", en: "Manual Mode: Off" },
      on: { cn: "手动模式：开启", en: "Manual Mode: On" }
    },
    layerLabels: {
      intelligentLayer: { cn: "动态级联", en: "Dynamic Cascade" },
      visualConsciousness: { cn: "视觉表达", en: "Visual Expression" }
    },
    visualDesc: { cn: "层级光带与霓虹动态，突出核心视觉焦点。", en: "Layered glow and neon motion highlighting the focal point." },
    workflow: { cn: "工作流：Creative → Parse → Assets → Extend", en: "Workflow: Creative → Parse → Assets → Extend" },
    currentModel: { cn: "当前优先模型：", en: "Current Primary Model: " },
    performanceStats: { cn: "性能统计：", en: "Performance Stats: " }
  },
  pipeline: {
    title: { cn: "演示代码", en: "Code Demo" },
    input: sharedInputText,
    prompt: {
      title: { cn: "提示词注入", en: "Prompt Injection" },
      desc: { cn: "[Pasted Content 1837 chars]", en: "[Pasted Content 1837 chars]" }
    },
    roleCard: {
      title: { cn: "角色卡 JSON", en: "Role Card JSON" },
      desc: { cn: "引擎可直接解析的结构", en: "Structure directly parsable by engine" }
    },
    codeScript: {
      title: { cn: "代码自生成", en: "GDScript Output" },
      desc: { cn: "自然语言 + 提示词生成引擎代码", en: "Combine natural language and prompts to produce GDScript" }
    },
    chips: {
      tankBoss: { cn: "坦克 Boss", en: "Tank Boss" },
      assassinHeroine: { cn: "刺客女主", en: "Assassin Heroine" },
      arcaneMage: { cn: "奥术法师", en: "Arcane Mage" }
    },
    waiting: { cn: "等待生成...", en: "Waiting to generate..." }
  },
  intelligence: {
    title: {
      cn: "素材描述",
      en: "Lingine Intelligent Routing"
    },
    desc: {
      cn: "输入生成素材的提示词",
      en: "Semantic → Capability → Fallback Chain Full Process"
    },
    expandLog: { cn: "展开日志", en: "Expand Log" },
    assetWall: {
      title: { cn: "参考图", en: "Asset Wall" },
      desc: { cn: "将参考图传递给级联 AI", en: "Cascade routing results to image generation AI (mock)" }
    },
    refresh: { cn: "刷新生成", en: "Refresh Generation" },
    finalPrompt: { cn: "最终 Prompt 摘要", en: "Final Prompt Summary" },
    engineScript: {
      title: { cn: "引擎自组装脚本", en: "Engine Self-Assembling Script" },
      desc: { cn: "基于角色卡自动配置 @export 参数", en: "Auto-configure @export parameters based on role card" }
    },
    enginePreview: {
      title: { cn: "实时引擎预览", en: "Real-time Engine Preview (mock)" },
      desc: { cn: "展示如何写入 res://assets/characters/{id}", en: "Show how to write to res://assets/characters/{id}" }
    },
    materialBrief: {
      title: { cn: "素材需求", en: "Material Brief" },
      desc: { cn: "输入要传递给 AI 的 Prompt", en: "Enter the prompt passed to AI" },
      placeholder: {
        cn: "例如：需要一组霓虹风格的城市街景，道具充满赛博元素...",
        en: "e.g., Need neon city streets with cyberpunk props..."
      },
      tip: {
        cn: "内容会同步到生成流程，保持简洁明确。",
        en: "Shared with generators, keep it concise."
      }
    },
    referenceUpload: {
      title: { cn: "参考上传", en: "Reference Upload" },
      tip: { cn: "支持多图上传，自动生成预览。", en: "Supports multi-image upload with previews." },
      button: { cn: "上传参考", en: "Upload" },
      aria: { cn: "参考图预览区域", en: "Reference preview area" }
    },
    gallery: {
      title: { cn: "素材展示", en: "Material Gallery" },
      desc: { cn: "生成图片素材", en: "Auto-load images under resource directory" },
      reload: { cn: "重新加载", en: "Reload" },
      empty: { cn: "暂未检测到图片，请将素材放入 resource 文件夹。", en: "No images found. Drop files into resource folder." },
      error: { cn: "读取素材时出现问题，请检查 resource 目录。", en: "Failed to load assets. Check the resource directory." },
      aria: { cn: "resource 素材展示", en: "Resource gallery" }
    },
    notOutput: { cn: "尚未输出", en: "Not yet output" },
    ioWrite: { cn: "数据写入：", en: "Data Write: " },
    textureOverlay: { cn: "纹理覆盖：", en: "Texture Overlay: " },
    scriptDeploy: { cn: "脚本部署：", en: "Script Deploy: " }
  },
  creative: {
    title: { cn: "创意输入输出", en: "Creative I/O" },
    input: sharedInputText,
    output: {
      waiting: { cn: "等待生成...", en: "Waiting to generate..." },
      invalid: { cn: "JSON 解析失败，请检查格式", en: "JSON parse error, please check format" },
    },
  },
  business: {
    title: { cn: "提升效果", en: "Effect Uplift" },
    desc: {
      cn: "基于 Lingine Workflow 的成本/速度/复用率对比",
      en: "Cost/speed/reuse rate comparison powered by Lingine Workflow",
    },
    chartDesc: {
      cn: "图表数据由 mockCommercialMetrics() 生成，未来可接入真实 BI。",
      en: "Chart data generated by mockCommercialMetrics(), with future BI integration.",
    },
  },
  misc: {
    langToggle: { cn: "切换语言", en: "Switch Language" },
    langLabel: { cn: "中", en: "EN" },
    waitingGenerate: { cn: "生成中...", en: "Generating..." },
    building: { cn: "构建中...", en: "Building..." },
    pending: { cn: "等待中...", en: "Pending..." },
    writing: { cn: "写入中...", en: "Writing..." },
    generated: { cn: "张", en: " items" },
    waitingAssets: { cn: "等待素材...", en: "Waiting for assets..." }
  }
};
