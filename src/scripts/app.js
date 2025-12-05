import { heroContent, workflowContent, uiText } from "../data/narrative.js";

const promptTemplate = `## Role
You are a JSON assistant for the Lingine engine. Convert the player's natural language description into an engine-ready JSON card.

## Constraints
- Use snake_case keys
- Resource paths live under res://assets/characters/{id}/
- Infer base_stats from description
- visuals.sprite_path must include sprite.png

## Ready`;

const templates = {
  tank_boss:
    "创建一个叫炎魔的Boss，血量和防御极高，使用火球和地狱火，风格残暴、暗红色盔甲。",
  assassin_heroine:
    "设计一位敏捷的刺客少女，双匕首，高闪避与超高速度，暗影蓝紫配色。",
  arcane_mage:
    "需要一个奥术法师，低体高魔，银发、星象主题，擅长远程控制和爆发。",
};

const routingStepCopy = {
  semantic: { cn: "语义解析", en: "Semantic Parsing" },
  capabilities: { cn: "能力匹配", en: "Capability Match" },
  fallback: { cn: "降级链", en: "Fallback Chain" },
};

const rolePreviewText = {
  stats: { cn: "基础属性", en: "Base Stats" },
  skills: { cn: "技能列表", en: "Skills" },
};

const narrativeSectionText = {
  art: { cn: "美术设计", en: "Art Direction" },
  lore: { cn: "角色背景", en: "Character Lore" },
  behavior: { cn: "行为逻辑", en: "Behavior Logic" },
};

const DEFAULT_PORTRAIT = "./assets/characters/demo/portrait.png";

const TYPEWRITER_DEFAULTS = {
  prompt: { chunk: 6, minDelay: 8, maxDelay: 18, initialDelay: 24 },
  json: { chunk: 2, minDelay: 16, maxDelay: 36, initialDelay: 120 },
  code: { chunk: 4, minDelay: 14, maxDelay: 32, initialDelay: 180 },
  manifest: { chunk: 3, minDelay: 18, maxDelay: 34, initialDelay: 220 },
};

const typewriterControllers = new Map();

const ROLE_CARD_TEMPLATE = {
  id: "dragonborn_paladin",
  name: "龙裔圣骑士",
  description:
    "拥有远古龙族血统的英勇骑士，身披闪亮银色重板甲与鲜艳红披风。手持注魔发光巨剑，誓言以祖先之力净化地牢。",
  tags: ["dragonborn", "paladin", "hero", "melee", "tank", "high_mobility"],
  visuals: {
    portrait_path: "res://assets/characters/dragonborn_paladin/portrait.png",
    sprite_path: "res://assets/characters/dragonborn_paladin/sprite.png",
    theme_color: "#FFD700",
  },
  base_stats: {
    hp_max: 850,
    mp_max: 240,
    atk: 95,
    str: 90,
    def: 85,
    spd: 300,
  },
  skills: ["dragon_rush_charge", "radiant_greatsword_sweep", "bullet_bane_cleave"],
  ai_config: {
    behavior_tree: "mobile_melee_aggressor",
    aggro_radius: 450,
  },
};

const ROLE_ARCHETYPES = [
  {
    id: "dragonborn_paladin",
    keywords: ["圣骑士", "龙裔", "守护", "paladin", "骑士"],
    name: "龙裔圣骑士",
    description:
      "拥有远古龙族血统的英勇骑士，身披闪亮银色重板甲与鲜艳红披风，手持注魔巨剑，以祖灵之力守护王国。",
    tags: [...ROLE_CARD_TEMPLATE.tags],
    themeColor: ROLE_CARD_TEMPLATE.visuals.theme_color,
    skills: [...ROLE_CARD_TEMPLATE.skills],
    ai_config: { ...ROLE_CARD_TEMPLATE.ai_config },
    stats: { ...ROLE_CARD_TEMPLATE.base_stats },
  },
  {
    id: "shadow_assassin",
    keywords: ["刺客", "暗影", "assassin", "潜行"],
    name: "影契刺客",
    description: "穿梭暗影的双匕首刺客，惯用瞬步与高爆发袭击首领弱点，擅长蓝紫霓虹风格的残影移动。",
    tags: ["assassin", "rogue", "stealth", "crit", "agile"],
    themeColor: "#5C73FF",
    skills: ["shadow_step", "umbral_rush", "silent_bloom"],
    ai_config: {
      behavior_tree: "stealth_highburst",
      aggro_radius: 380,
    },
    stats: { hp_max: 560, mp_max: 320, atk: 140, str: 70, def: 45, spd: 380 },
  },
  {
    id: "arcane_mage",
    keywords: ["法师", "奥术", "mage", "术士"],
    name: "星辉奥术师",
    description: "操纵星象魔法的长距离控制者，以银白与蔚蓝为主调，凭借魔阵与流星引导范围爆发。",
    tags: ["mage", "ranged", "control", "burst", "support"],
    themeColor: "#6CE0FF",
    skills: ["astral_bind", "meteor_array", "mana_refraction"],
    ai_config: {
      behavior_tree: "ranged_controller",
      aggro_radius: 420,
    },
    stats: { hp_max: 600, mp_max: 520, atk: 125, str: 60, def: 55, spd: 260 },
  },
  {
    id: "inferno_overlord",
    keywords: ["boss", "炎魔", "恶魔", "demon", "火", "地狱"],
    name: "炎魔统御者",
    description: "统御熔岩火海的地狱统帅，深红骨甲与炽燃巨斧象征毁灭，擅长群体压制与持续灼烧。",
    tags: ["boss", "fire", "aoe", "siege"],
    themeColor: "#FF5A2F",
    skills: ["hellfire_barrier", "meteor_maw", "abyssal_chain"],
    ai_config: {
      behavior_tree: "aggressive_boss_ai",
      aggro_radius: 520,
    },
    stats: { hp_max: 1100, mp_max: 260, atk: 155, str: 130, def: 90, spd: 280 },
  },
];

function selectArchetype(description = "") {
  const normalized = description.toLowerCase();
  return (
    ROLE_ARCHETYPES.find((archetype) =>
      archetype.keywords.some((keyword) => {
        const keyLower = keyword.toLowerCase();
        return normalized.includes(keyLower) || description.includes(keyword);
      }),
    ) ?? ROLE_ARCHETYPES[0]
  );
}

function extractRoleName(description = "") {
  if (!description) return "";
  const namedMatch = description.match(/叫([^\s，。,.]+)/);
  if (namedMatch?.[1]) return namedMatch[1];
  const enMatch = description.match(/named\s+([a-z0-9_\-]+)/i);
  if (enMatch?.[1]) return enMatch[1];
  return description.slice(0, Math.min(10, description.length));
}

function buildRoleCardFromDescription(description = "") {
  const trimmed = description.trim();
  const archetype = selectArchetype(trimmed);
  const slugSource = trimmed || archetype.id;
  const slugCandidate = slugify(slugSource);
  const slug = slugCandidate.replace(/^_+|_+$/g, "");
  const roleId = slug || archetype.id;
  const derivedName = extractRoleName(trimmed) || archetype.name;
  const composedDescription = trimmed ? `${trimmed}。${archetype.description}` : archetype.description;

  return {
    id: roleId,
    name: derivedName,
    description: composedDescription,
    tags: [...archetype.tags],
    visuals: {
      portrait_path: `res://assets/characters/${roleId}/portrait.png`,
      sprite_path: `res://assets/characters/${roleId}/sprite.png`,
      theme_color: archetype.themeColor,
    },
    base_stats: { ...archetype.stats },
    skills: [...archetype.skills],
    ai_config: { ...archetype.ai_config },
  };
}

function buildPromptFromDescription(description = "") {
  const trimmed = description.trim();
  if (!trimmed) return promptTemplate;
  return `${promptTemplate}

## Player Description
${trimmed}

## Output Requirements
- Emit JSON with id, name, description, tags, visuals, base_stats, skills, ai_config`;
}

const state = {
  input: "",
  creativeDescription: "",
  manual: false,
  generating: false,
  lastDecision: null,
  creativeCard: null,
  pipelineCard: null,
  lastMetrics: null,
  theme: "dark",
  lang: "cn",
  currentScreen: "hero",
  heroFull: true,
  heroCollapsing: false,
  materialBriefReady: false,
  referenceCount: 0,
  assetGenerating: false,
  assetsReady: false,
  pipelineOutputsVisible: false,
  promptTypingPromise: Promise.resolve(),
};

const animationState = {
  rafId: null,
  lastActive: "hero",
  lastRibbonTarget: null,
  ribbonFlyBusy: false,
  heroScrollBound: false,
};

let navHoverZone = null;
let navHideTimer = null;
const HERO_COLLAPSE_RANGE = 320;
const HERO_SCROLL_FACTOR = 0.35;
let heroVirtualScroll = 0;
let touchStartY = null;
let heroProgressTarget = 0;
let heroProgressCurrent = 0;
let heroProgressRaf = null;

// 添加DOM元素安全获取函数
function getElementById(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id "${id}" not found`);
  }
  return element;
}

function getElementsBySelector(selector) {
  return document.querySelectorAll(selector);
}

// 延迟DOM元素获取，确保在DOM完全加载后再获取
function getDomElements() {
  return {
    runDemo: getElementById("run-demo"),
    toggleManual: getElementById("toggle-manual"),
    topNav: document.querySelector(".top-nav"),
    input: getElementById("user-input"),
    creativeInput: getElementById("creative-input"),
    promptPreview: getElementById("prompt-preview"),
    roleCardEditor: getElementById("role-card-json"),
    creativePreview: getElementById("creative-preview"),
    materialBriefInput: getElementById("material-brief-input"),
    materialBriefTitle: getElementById("material-brief-title"),
    materialBriefDesc: getElementById("material-brief-desc"),
    materialBriefTip: getElementById("material-brief-tip"),
    referenceUploadTitle: getElementById("reference-upload-title"),
    referenceUploadTip: getElementById("reference-upload-tip"),
    referenceUploadTrigger: getElementById("reference-upload-trigger"),
    referenceUploadInput: getElementById("reference-upload-input"),
    referencePreviewGrid: getElementById("reference-preview-grid"),
    resourceGalleryTitle: getElementById("resource-gallery-title"),
    resourceGalleryDesc: getElementById("resource-gallery-desc"),
    resourceGalleryEmpty: getElementById("resource-gallery-empty"),
    resourceReload: getElementById("resource-reload"),
    codeScript: getElementById("code-script-preview"),
    codeScriptManifest: getElementById("code-script-manifest"),
    assetGrid: getElementById("asset-grid"),
    commercialGrid: getElementById("commercial-grid"),
    navSteps: getElementsBySelector(".nav-steps button"),
    screens: getElementsBySelector(".screen"),
    workflowRibbon: document.getElementById("workflow-ribbon"),
    themeToggle: getElementById("theme-toggle"),
    themeIcon: getElementById("theme-icon"),
    langToggle: getElementById("lang-toggle"),
    heroCard: getElementById("hero-flip-card"),
    heroLayerRouting: getElementById("hero-layer-routing"),
    heroLayerVisual: getElementById("hero-layer-visual"),
    heroVisualDesc: getElementById("hero-visual-desc"),
    heroLeadCn: getElementById("hero-lead-cn"),
    heroLeadEn: getElementById("hero-lead-en"),
    heroSteps: getElementById("hero-steps"),
    workflowRibbon: getElementById("workflow-ribbon"),
  };
}

function setupFloatingTopNav() {
  if (!dom || !dom.topNav) return;

  document.body.classList.add("floating-nav-ready");

  if (!navHoverZone) {
    navHoverZone = document.getElementById("top-hover-zone");
  }
  if (!navHoverZone) {
    navHoverZone = document.createElement("div");
    navHoverZone.id = "top-hover-zone";
    navHoverZone.setAttribute("aria-hidden", "true");
    document.body.appendChild(navHoverZone);
  }

  const showNav = () => {
    window.clearTimeout(navHideTimer);
    document.body.classList.add("floating-nav-open");
  };

  const scheduleHide = () => {
    window.clearTimeout(navHideTimer);
    navHideTimer = window.setTimeout(() => {
      document.body.classList.remove("floating-nav-open");
    }, 240);
  };

  [navHoverZone, dom.topNav].forEach((target) => {
    if (!target) return;
    target.addEventListener("pointerenter", showNav);
    target.addEventListener("pointerleave", scheduleHide);
    target.addEventListener("touchstart", showNav);
  });

  dom.topNav.addEventListener("focusin", showNav);
  dom.topNav.addEventListener("focusout", (event) => {
    if (event.relatedTarget && dom.topNav.contains(event.relatedTarget)) return;
    scheduleHide();
  });
}

function setHeroCollapseProgress(value = 0) {
  const clamped = Math.min(1, Math.max(0, value));
  document.body.style.setProperty("--hero-collapse-progress", clamped.toFixed(3));
}

function setHeroCollapseProgressTarget(value = 0) {
  heroProgressTarget = clamp(value, 0, 1);
  if (heroProgressRaf) return;
  heroProgressRaf = window.requestAnimationFrame(driveHeroCollapseAnimation);
}

function driveHeroCollapseAnimation() {
  const diff = heroProgressTarget - heroProgressCurrent;
  const step = diff * 0.18;
  if (Math.abs(diff) < 0.002) {
    heroProgressCurrent = heroProgressTarget;
  } else {
    heroProgressCurrent += step;
  }
  heroVirtualScroll = heroProgressCurrent * HERO_COLLAPSE_RANGE;
  setHeroCollapseProgress(heroProgressCurrent);

  if (heroProgressTarget >= 1 && heroProgressCurrent >= 0.995 && state.heroFull && !state.heroCollapsing) {
    collapseHeroFullscreen();
  }

  if (state.heroFull || state.heroCollapsing) {
    heroProgressRaf = window.requestAnimationFrame(driveHeroCollapseAnimation);
  } else {
    heroProgressRaf = null;
  }
}

function bindHeroScrollCollapse() {
  if (animationState.heroScrollBound) return;
  animationState.heroScrollBound = true;

  const updateProgress = (delta) => {
    heroVirtualScroll = Math.min(Math.max(heroVirtualScroll + delta * HERO_SCROLL_FACTOR, 0), HERO_COLLAPSE_RANGE);
    const progress = heroVirtualScroll / HERO_COLLAPSE_RANGE;
    setHeroCollapseProgressTarget(progress);
  };

  const handleWheel = (event) => {
    if (state.heroFull) {
      event.preventDefault();
      updateProgress(event.deltaY);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }
    if (state.heroCollapsing) {
      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  };

  const handleScrollLock = () => {
    if (state.heroFull || state.heroCollapsing) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  };

  const handleTouchStart = (event) => {
    if (!state.heroFull || state.heroCollapsing) return;
    if (event.touches && event.touches.length) {
      touchStartY = event.touches[0].clientY;
    }
  };

  const handleTouchMove = (event) => {
    if (!(state.heroFull || state.heroCollapsing)) return;
    if (touchStartY === null || !event.touches || !event.touches.length) return;
    event.preventDefault();
    const currentY = event.touches[0].clientY;
    const delta = touchStartY - currentY;
    if (state.heroFull) {
      updateProgress(delta);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const handleTouchEnd = () => {
    touchStartY = null;
  };

  const handleKeydown = (event) => {
    if (!(state.heroFull || state.heroCollapsing)) return;
    const keys = ["ArrowDown", "PageDown", "ArrowUp", "PageUp", " "];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (state.heroFull) {
      const delta = event.key === "ArrowUp" || event.key === "PageUp" ? -120 : 120;
      updateProgress(delta);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("scroll", handleScrollLock, { passive: true });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });
  window.addEventListener("keydown", handleKeydown, { passive: false });
}

// 初始化时先设置为null，等DOM加载完成后再获取
let dom = null;

function initializeApp() {
  // 确保在DOM完全加载后再初始化应用
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
  } else {
    startApp();
  }
}

function startApp() {
  // 现在获取DOM元素
  dom = getDomElements();
  setupFloatingTopNav();
  clearLanguageInputs();
  resetPromptPreview();
  resetRoleCardPreview();
  setPipelineOutputsVisible(false);
  updateEnginePreview(null);
  state.promptTypingPromise = Promise.resolve();
  if (dom.assetGrid) {
    dom.assetGrid.hidden = true;
  }
  mountComponents();
  attachEvents();
  hydrateNarrative();
  bindRibbonEvents();
  renderLanguage();
  updateUIText(); // 更新界面文本
  setScreen("hero", { scrollIntoView: false });
  startHeroIntro();
  enterHeroFullscreen();
  document.body.dataset.theme = state.theme;
  bindHeroScrollCollapse();
  bindHeroTilt();
  startAnimationDriver();
  applyLingineTokens(state.theme);
  if (dom.themeIcon) dom.themeIcon.textContent = state.theme === "dark" ? "\u263E" : "\u2600";
}

let chipButtons = [];

function clearLanguageInputs() {
  state.input = "";
  state.creativeDescription = "";
  state.materialBriefReady = false;
  state.referenceCount = 0;
  if (dom?.input) {
    dom.input.value = "";
  }
  if (dom?.creativeInput) {
    dom.creativeInput.value = "";
  }
  if (dom?.materialBriefInput) {
    dom.materialBriefInput.value = "";
  }
  updateResourceButtonState();
}

function setPipelineOutputsVisible(active) {
  if (!dom) return;
  state.pipelineOutputsVisible = Boolean(active);
  const visible = state.pipelineOutputsVisible;

  if (dom.promptPreview) {
    dom.promptPreview.hidden = !visible;
    dom.promptPreview.setAttribute("aria-hidden", String(!visible));
    const promptPanel = dom.promptPreview.closest("article");
    if (promptPanel) {
      promptPanel.dataset.visible = visible ? "true" : "false";
      promptPanel.hidden = !visible;
    }
    if (!visible) {
      resetPromptPreview();
      state.promptTypingPromise = Promise.resolve();
    }
  }

  const codePane = dom.codeScript?.closest(".code-script-pane");
  if (codePane) {
    codePane.dataset.visible = visible ? "true" : "false";
    codePane.hidden = !visible;
  }
  if (dom.codeScript) {
    dom.codeScript.hidden = !visible;
    dom.codeScript.setAttribute("aria-hidden", String(!visible));
    if (!visible) {
      primeTextArea(dom.codeScript, uiText.misc.waitingGenerate[state.lang]);
    }
  }

  const manifestPane = dom.codeScriptManifest?.closest(".code-script-pane");
  if (manifestPane) {
    manifestPane.dataset.visible = visible ? "true" : "false";
    manifestPane.hidden = !visible;
  }
  if (dom.codeScriptManifest) {
    dom.codeScriptManifest.hidden = !visible;
    dom.codeScriptManifest.setAttribute("aria-hidden", String(!visible));
    if (!visible) {
      primeTextArea(dom.codeScriptManifest, uiText.misc.waitingGenerate[state.lang]);
    }
  }
}

function stopTypewriter(target) {
  if (!target) return;
  const timer = typewriterControllers.get(target);
  if (timer) {
    window.clearTimeout(timer);
    typewriterControllers.delete(target);
  }
  target.dataset.typing = "false";
}

function typewriterEffect(target, text, options = {}) {
  if (!target) return Promise.resolve();
  const {
    chunk = 2,
    minDelay = 14,
    maxDelay = 32,
    initialDelay = 0,
    onStart,
    onComplete,
    instant = false,
  } = options;

  stopTypewriter(target);

  return new Promise((resolve) => {
    const fullText = text ?? "";
    if (instant || fullText.length === 0) {
      target.value = fullText;
      target.dataset.typing = "false";
      if (typeof onComplete === "function") onComplete();
      resolve();
      return;
    }

    target.value = "";
    target.dataset.typing = "true";
    if (typeof onStart === "function") onStart();
    let index = 0;

    const step = () => {
      if (index >= fullText.length) {
        target.value = fullText;
        target.dataset.typing = "false";
        typewriterControllers.delete(target);
        if (typeof onComplete === "function") onComplete();
        resolve();
        return;
      }

      const nextChunk = fullText.slice(index, index + chunk);
      index += chunk;
      target.value += nextChunk;
      target.scrollTop = target.scrollHeight;
      const delay = minDelay + Math.random() * Math.max(1, maxDelay - minDelay);
      const timer = window.setTimeout(step, delay);
      typewriterControllers.set(target, timer);
    };

    const starter = window.setTimeout(step, Math.max(0, initialDelay));
    typewriterControllers.set(target, starter);
  });
}

function primeTextArea(element, placeholder = "") {
  if (!element) return;
  stopTypewriter(element);
  element.value = "";
  if (placeholder) {
    element.placeholder = placeholder;
  }
  element.dataset.typing = "false";
  element.dataset.state = "idle";
}

function resetPromptPreview() {
  if (!dom || !dom.promptPreview) return;
  primeTextArea(dom.promptPreview, uiText.misc.waitingGenerate[state.lang]);
  dom.promptPreview.dataset.state = "pending";
}

function updatePromptPreview(description) {
  if (!dom || !dom.promptPreview) return Promise.resolve();
  const trimmed = (description || "").trim();
  if (!trimmed) {
    resetPromptPreview();
    return Promise.resolve();
  }
  dom.promptPreview.dataset.state = "ready";
  const config = TYPEWRITER_DEFAULTS.prompt;
  return typewriterEffect(dom.promptPreview, buildPromptFromDescription(trimmed), {
    chunk: config.chunk,
    minDelay: config.minDelay,
    maxDelay: config.maxDelay,
    initialDelay: config.initialDelay,
  });
}

function resetRoleCardPreview() {
  if (!dom) return;
  state.creativeCard = null;
  if (dom.roleCardEditor) {
    primeTextArea(dom.roleCardEditor, uiText.misc.waitingGenerate[state.lang]);
  }
  renderRoleCardPreview(null);
}

function driveDescriptionChange(value, options = {}) {
  if (!dom) return null;
  const normalized = typeof value === "string" ? value : "";
  state.input = normalized;
  const trimmed = normalized.trim();
  if (!trimmed) {
    setPipelineOutputsVisible(false);
    state.promptTypingPromise = Promise.resolve();
    state.pipelineCard = null;
    updateEnginePreview(null);
    return null;
  }
  setPipelineOutputsVisible(true);
  state.promptTypingPromise = updatePromptPreview(normalized);
  return trimmed;
}

function handleCreativeDescriptionChange(rawValue) {
  const description = typeof rawValue === "string" ? rawValue : "";
  state.creativeDescription = description;
  const trimmed = description.trim();
  if (!trimmed) {
    resetRoleCardPreview();
    return;
  }
  const card = buildRoleCardFromDescription(trimmed);
  updateCreativeRoleCard(card, { animate: true });
}

function handleReferenceUpload(fileList) {
  if (!dom || !dom.referencePreviewGrid) return;
  const files = Array.from(fileList ?? []);
  const container = dom.referencePreviewGrid;
  container.innerHTML = "";

  state.referenceCount = files.length;
  updateResourceButtonState();
  if (!files.length) {
    container.dataset.state = "empty";
    return;
  }

  files.forEach((file, index) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const img = document.createElement("img");
      img.className = "reference-preview-image";
      img.alt = file.name || `reference-${index + 1}`;
      if (typeof reader.result === "string") {
        img.src = reader.result;
      }

      container.appendChild(img);
    });
    reader.addEventListener("error", () => {
      console.error("Reference preview failed", reader.error);
    });
    reader.readAsDataURL(file);
  });

  container.dataset.state = "filled";
}

function canGenerateAssets() {
  return state.materialBriefReady && state.referenceCount > 0;
}

function updateResourceButtonState() {
  if (!dom || !dom.resourceReload) return;
  const ready = canGenerateAssets();
  dom.resourceReload.disabled = !ready || state.assetGenerating;
  dom.resourceReload.dataset.ready = ready ? "true" : "false";
  dom.resourceReload.dataset.loading = state.assetGenerating ? "true" : "false";
}

function showResourceMessage(key) {
  if (!dom || !dom.resourceGalleryEmpty) return;
  const copy = uiText.intelligence.gallery[key]?.[state.lang];
  if (copy) {
    dom.resourceGalleryEmpty.textContent = copy;
  }
  dom.resourceGalleryEmpty.hidden = false;
  if (dom.assetGrid) {
    dom.assetGrid.hidden = true;
  }
}

function hideResourceMessage() {
  if (!dom || !dom.resourceGalleryEmpty) return;
  dom.resourceGalleryEmpty.hidden = true;
}

function triggerResourceGeneration(options = {}) {
  const override = options.override === true;
  if (state.assetGenerating) return Promise.resolve([]);
  if (!override && !canGenerateAssets()) {
    showResourceMessage("empty");
    return Promise.resolve([]);
  }
  return loadResourceImages({ override });
}

function setPipelineDescription(value, options = {}) {
  if (!dom) return;
  if (dom.input && dom.input.value !== value) dom.input.value = value;
  if (options.mirrorCreative && dom.creativeInput && dom.creativeInput.value !== value) {
    dom.creativeInput.value = value;
  }
  driveDescriptionChange(value, { force: options.force === true });
}

function resolvePortraitPath(path) {
  if (!path) return DEFAULT_PORTRAIT;
  if (path.startsWith("res://")) {
    return `./${path.replace("res://", "")}`;
  }
  return path;
}

function hexToRgb(hex) {
  if (!hex) return null;
  const normalized = hex.replace("#", "").trim();
  if (normalized.length !== 6) return null;
  const int = Number.parseInt(normalized, 16);
  if (Number.isNaN(int)) return null;
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function handleRoleCardEditorInput() {
  if (!dom || !dom.roleCardEditor) return;
  if (dom.roleCardEditor.dataset.typing === "true") {
    return;
  }
  const raw = dom.roleCardEditor.value.trim();
  const waitingCn = uiText.misc.waitingGenerate?.cn;
  const waitingEn = uiText.misc.waitingGenerate?.en;
  if (!raw || raw === waitingCn || raw === waitingEn) {
    renderRoleCardPreview(null);
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    state.creativeCard = parsed;
    renderRoleCardPreview(parsed);
  } catch (error) {
    const fallbackMessage =
      state.lang === "cn"
        ? "JSON 解析失败，请检查格式"
        : "JSON parse error, please check format";
    const baseMessage = uiText.creative.output.invalid?.[state.lang] ?? fallbackMessage;
    renderRoleCardPreview(null, `${baseMessage}: ${error.message}`);
  }
}

function attachEvents() {
  if (!dom) return; // 确保dom对象已初始化

  chipButtons = Array.from(document.querySelectorAll(".chip"));
  if (dom.input) {
    dom.input.addEventListener("input", () => {
      driveDescriptionChange(dom.input.value);
    });
  }
  if (dom.creativeInput) {
    dom.creativeInput.addEventListener("input", () => {
      handleCreativeDescriptionChange(dom.creativeInput.value);
    });
    handleCreativeDescriptionChange(dom.creativeInput.value || "");
  }

  if (dom.runDemo) dom.runDemo.addEventListener("click", runDemoFlow);
  if (dom.toggleManual) dom.toggleManual.addEventListener("click", () => {
    state.manual = !state.manual;
    if (dom.toggleManual) dom.toggleManual.textContent = `手动模式：${state.manual ? "开启" : "关闭"}`;
  });
  if (dom.referenceUploadTrigger && dom.referenceUploadInput) {
    dom.referenceUploadTrigger.addEventListener("click", () => dom.referenceUploadInput.click());
    dom.referenceUploadInput.addEventListener("change", () => handleReferenceUpload(dom.referenceUploadInput.files));
  }
  if (dom.materialBriefInput) {
    dom.materialBriefInput.addEventListener("input", () => {
      state.materialBriefReady = Boolean(dom.materialBriefInput.value.trim());
      updateResourceButtonState();
    });
  }
  if (dom.resourceReload) {
    dom.resourceReload.addEventListener("click", () => {
      triggerResourceGeneration();
    });
  }
  if (dom.themeToggle) dom.themeToggle.addEventListener("click", toggleTheme);
  if (dom.langToggle) dom.langToggle.addEventListener("click", toggleLanguage);
  if (dom.navSteps) {
    const navTargets = ["hero", "creative", "intelligence", "pipeline", "business"];
    dom.navSteps.forEach((btn, idx) => {
      if (!btn) return;
      if (navTargets[idx]) {
        btn.dataset.target = navTargets[idx];
      }
      btn.addEventListener("click", () => setScreen(btn.dataset.target, { scrollIntoView: true }));
    });
  }
  chipButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const preset = templates[btn.dataset.template];
      if (preset) {
        setPipelineDescription(preset, { force: true });
      }
    }),
  );

  if (dom.roleCardEditor) {
    dom.roleCardEditor.addEventListener("input", handleRoleCardEditorInput);
    handleRoleCardEditorInput();
  }

  updateResourceButtonState();
}

async function runDemoFlow() {
  if (!dom) {
    console.warn("DOM not initialized yet");
    return;
  }
  if (state.generating) {
    return;
  }

  try {
    state.generating = true;
    collapseHeroFullscreen();
    const rawDescription = dom.input?.value ?? dom.creativeInput?.value ?? "";
    const description = rawDescription.trim() || templates.tank_boss;
    renderPipelineSkeletons();
    await wait(180);
    setPipelineDescription(description, { force: true });
    await wait(220);

    const payload = buildRoutingPayload(description);
    const decision = await mockRouteDecision(payload);
    const card = await mockRoleCard(decision, payload);
    const script = await mockEngineScript(card);
    const metrics = await mockCommercialMetrics();

    updateRouting(decision);
    await updateEngineScript(script, card);
    updateEnginePreview(card);
    state.materialBriefReady = true;
    state.referenceCount = Math.max(1, state.referenceCount);
    updateResourceButtonState();
    updateCommercial(metrics);
  } catch (error) {
    console.error("Demo flow error:", error);
    // 在UI上显示错误信息
    if (dom.roleCardEditor) {
      dom.roleCardEditor.value = `错误: ${error.message || "演示流程出现错误"}`;
    }
    renderRoleCardPreview(null, state.lang === "cn" ? "演示流程出现错误" : "Demo flow failed");
  } finally {
    state.generating = false;
  }
}

function buildRoutingPayload(description) {
  return {
    description,
    capabilities: { vision: true, structured_output: true },
    timestamp: Date.now(),
  };
}

function buildScriptManifest(card, script) {
  const lang = state.lang;
  const waiting = uiText.misc.waitingGenerate[lang];
  if (!card) return waiting;

  const visuals = card.visuals ?? {};
  const statsEntries = Object.entries(card.base_stats ?? {});
  const statsLines = statsEntries.length ? statsEntries.map(([key, value]) => `  - ${key}: ${value}`) : ["  - —"];
  const skills = Array.isArray(card.skills) && card.skills.length
    ? card.skills
    : [lang === "cn" ? "未配置技能" : "skill_pending"];

  const manifest = [
    `role_id: ${card.id ?? "—"}`,
    `name: ${card.name ?? "—"}`,
    `theme_color: ${visuals.theme_color ?? "—"}`,
    `sprite_path: ${visuals.sprite_path ?? "—"}`,
    `portrait_path: ${visuals.portrait_path ?? "—"}`,
    ``,
    `base_stats:`,
    ...statsLines,
    ``,
    `skills:`,
    ...skills.map((skill) => `  - ${skill}`),
  ];

  if (script) {
    manifest.push("", `script_lines: ${script.split("\n").length}`);
  }

  return manifest.join("\n");
}

function renderPipelineSkeletons() {
  if (!dom) return;
  const lang = state.lang;
  state.pipelineCard = null;
  setPipelineOutputsVisible(false);
  resetPromptPreview();
  state.promptTypingPromise = Promise.resolve();
  if (dom.codeScript) primeTextArea(dom.codeScript, uiText.misc.waitingGenerate[lang]);
  if (dom.codeScriptManifest) primeTextArea(dom.codeScriptManifest, uiText.misc.waitingGenerate[lang]);
  updateEnginePreview(null);
}

function toggleTheme() {
  if (!dom) {
    console.warn('DOM not initialized yet');
    return;
  }

  try {
    state.theme = state.theme === "dark" ? "light" : "dark";
    if (document.body) {
      document.body.dataset.theme = state.theme;
    }
    applyLingineTokens(state.theme);
    if (dom.themeIcon) {
      dom.themeIcon.textContent = state.theme === "dark" ? "\u263E" : "\u2600";
    }
  } catch (error) {
    console.error('Theme toggle error:', error);
  }
}

function toggleLanguage() {
  if (!dom) {
    console.warn('DOM not initialized yet');
    return;
  }

  state.lang = state.lang === "cn" ? "en" : "cn";
  renderLanguage();
  updateUIText();
}

function renderLanguage() {
  if (!dom) {
    console.warn('DOM not initialized yet');
    return;
  }

  document.body.dataset.lang = state.lang;
  if (dom.langToggle) {
    dom.langToggle.textContent = state.lang === "cn" ? uiText.misc.langLabel.cn : uiText.misc.langLabel.en;
    dom.langToggle.setAttribute("aria-label", uiText.misc.langToggle[state.lang]);
  }
}

// 更新界面文本
function updateUIText() {
  if (!dom) {
    console.warn('DOM not initialized yet');
    return;
  }

  const lang = state.lang;

  // 更新导航按钮文本
  const navButtons = document.querySelectorAll(".nav-steps button");
  navButtons.forEach((button) => {
    const target = button.dataset.target;
    if (uiText.nav[target]) {
      button.textContent = uiText.nav[target][lang];
    }
  });

  const setPanelCopy = (panel, copy) => {
    if (!panel || !copy) return;
    const header = panel.querySelector("header");
    if (!header) return;
    const titleEl = header.querySelector("h2");
    const descEl = header.querySelector("p");
    if (titleEl) titleEl.textContent = copy.title[lang];
    if (descEl) descEl.textContent = copy.desc[lang];
  };

  // 更新概览页内容
  const setCopyPair = (root, cn, en) => {
    if (!root) return;
    const cnEl = root.querySelector(".copy-cn");
    const enEl = root.querySelector(".copy-en");
    if (cnEl) cnEl.textContent = cn;
    if (enEl) enEl.textContent = en;
  };
  setCopyPair(document.getElementById("hero-product-title"), "Lingine Workflow", "Lingine Workflow");
  setCopyPair(document.getElementById("hero-title"), uiText.hero.title.cn, uiText.hero.title.en);

  const stellarCanvas = document.getElementById("stellar-map");
  if (stellarCanvas) stellarCanvas.setAttribute("aria-label", state.lang === "cn" ? "星空地图可视化" : "Stellar map visualization");

  // 更新演示按钮
  if (dom.runDemo) dom.runDemo.textContent = uiText.hero.runDemo[lang];

  // 更新手动模式按钮
  if (dom.toggleManual) {
    dom.toggleManual.textContent = state.manual
      ? uiText.hero.manualMode.on[lang]
      : uiText.hero.manualMode.off[lang];
  }
  if (dom.heroLayerRouting) dom.heroLayerRouting.textContent = uiText.hero.layerLabels.intelligentLayer[lang];
  if (dom.heroLayerVisual) dom.heroLayerVisual.textContent = uiText.hero.layerLabels.visualConsciousness?.[lang] || "Lingine Visual Consciousness";
  if (dom.heroVisualDesc) dom.heroVisualDesc.textContent = uiText.hero.visualDesc[lang];
  // hero workflow stats移除，不再更新

  // 更新工作流页面文本
  const pipelineTitle = document.getElementById("pipeline-title");
  if (pipelineTitle) pipelineTitle.textContent = uiText.pipeline.title[lang];
  if (dom.workflowRibbon) dom.workflowRibbon.setAttribute("aria-label", uiText.pipeline.title[lang]);

  const pipelineSection = document.querySelector('section[data-screen="pipeline"]');
  if (pipelineSection) {
    setPanelCopy(pipelineSection.querySelector('[data-panel="pipeline-input"]'), uiText.pipeline.input);
    setPanelCopy(pipelineSection.querySelector('[data-panel="pipeline-prompt"]'), uiText.pipeline.prompt);
    setPanelCopy(pipelineSection.querySelector('[data-panel="pipeline-script"]'), uiText.pipeline.codeScript);
  }

  // 更新智能链路页面文本
  const intelligenceTitle = document.querySelector('section[data-screen="intelligence"] h2:first-of-type');
  const intelligenceDesc = document.querySelector('section[data-screen="intelligence"] p:first-of-type');
  const assetWallTitle = document.querySelector('section[data-screen="intelligence"] .panel:nth-child(2) h2');
  const assetWallDesc = document.querySelector('section[data-screen="intelligence"] .panel:nth-child(2) p');
  const engineScriptTitle = document.querySelector('section[data-screen="intelligence"] .panel:nth-child(3) h2');
  const engineScriptDesc = document.querySelector('section[data-screen="intelligence"] .panel:nth-child(3) p');
  const enginePreviewTitle = document.querySelector('section[data-screen="intelligence"] .panel:nth-child(4) h2');
  const enginePreviewDesc = document.querySelector('section[data-screen="intelligence"] .panel:nth-child(4) p');

  if (intelligenceTitle) intelligenceTitle.textContent = uiText.intelligence.title[lang];
  if (intelligenceDesc) intelligenceDesc.textContent = uiText.intelligence.desc[lang];
  if (dom.toggleLog) dom.toggleLog.textContent = uiText.intelligence.expandLog[lang];
  if (assetWallTitle) assetWallTitle.textContent = uiText.intelligence.assetWall.title[lang];
  if (assetWallDesc) assetWallDesc.textContent = uiText.intelligence.assetWall.desc[lang];
  if (dom.refreshAssets) dom.refreshAssets.textContent = uiText.intelligence.refresh[lang];
  if (dom.assetGrid) dom.assetGrid.setAttribute("aria-label", state.lang === "cn" ? "生成的素材资产网格" : "Generated asset grid");
  if (dom.finalPromptHeading) dom.finalPromptHeading.textContent = uiText.intelligence.finalPrompt[lang];
  if (engineScriptTitle) engineScriptTitle.textContent = uiText.intelligence.engineScript.title[lang];
  if (engineScriptDesc) engineScriptDesc.textContent = uiText.intelligence.engineScript.desc[lang];
  if (enginePreviewTitle) enginePreviewTitle.textContent = uiText.intelligence.enginePreview.title[lang];
  if (enginePreviewDesc) enginePreviewDesc.textContent = uiText.intelligence.enginePreview.desc[lang];
  if (dom.ioLabel) dom.ioLabel.textContent = uiText.intelligence.ioWrite[lang];
  if (dom.textureLabel) dom.textureLabel.textContent = uiText.intelligence.textureOverlay[lang];
  if (dom.scriptLabel) dom.scriptLabel.textContent = uiText.intelligence.scriptDeploy[lang];
  if (dom.engineStatusLine) {
    dom.engineStatusLine.textContent = state.pipelineCard ? getEngineStatusMessage(state.pipelineCard) : uiText.intelligence.notOutput[lang];
    dom.engineStatusLine.dataset.lock = state.pipelineCard ? "true" : "false";
  }

  // Additional copy for redesigned intelligence layout
  if (dom.materialBriefTitle) dom.materialBriefTitle.textContent = uiText.intelligence.materialBrief.title[lang];
  if (dom.materialBriefDesc) dom.materialBriefDesc.textContent = uiText.intelligence.materialBrief.desc[lang];
  if (dom.materialBriefTip) dom.materialBriefTip.textContent = uiText.intelligence.materialBrief.tip[lang];
  if (dom.materialBriefInput) {
    dom.materialBriefInput.placeholder = uiText.intelligence.materialBrief.placeholder[lang];
    dom.materialBriefInput.setAttribute("aria-label", uiText.intelligence.materialBrief.title[lang]);
  }
  if (dom.referenceUploadTitle) dom.referenceUploadTitle.textContent = uiText.intelligence.referenceUpload.title[lang];
  if (dom.referenceUploadTip) dom.referenceUploadTip.textContent = uiText.intelligence.referenceUpload.tip[lang];
  if (dom.referenceUploadTrigger) dom.referenceUploadTrigger.textContent = uiText.intelligence.referenceUpload.button[lang];
  if (dom.referencePreviewGrid) dom.referencePreviewGrid.setAttribute("aria-label", uiText.intelligence.referenceUpload.aria[lang]);
  if (dom.resourceGalleryTitle) dom.resourceGalleryTitle.textContent = uiText.intelligence.gallery.title[lang];
  if (dom.resourceGalleryDesc) dom.resourceGalleryDesc.textContent = uiText.intelligence.gallery.desc[lang];
  if (dom.resourceReload) dom.resourceReload.textContent = uiText.intelligence.gallery.reload[lang];
  if (dom.resourceGalleryEmpty) dom.resourceGalleryEmpty.textContent = uiText.intelligence.gallery.empty[lang];
  if (dom.assetGrid) dom.assetGrid.setAttribute("aria-label", uiText.intelligence.gallery.aria[lang]);

  // 更新商业页面文本
  const businessSection = document.querySelector('section[data-screen="business"]');
  if (businessSection) {
    const commercialHeader = businessSection.querySelector('.commercial header');
    const businessTitle = commercialHeader?.querySelector('h2');
    const businessDesc = commercialHeader?.querySelector('p');
    const chartDesc = businessSection.querySelector('.chart-placeholder p');
    if (businessTitle) businessTitle.textContent = uiText.business.title[lang];
    if (businessDesc) businessDesc.textContent = uiText.business.desc[lang];
    if (chartDesc) chartDesc.textContent = uiText.business.chartDesc[lang];
  }

  const creativeTitle = document.getElementById("creative-title");
  if (creativeTitle) creativeTitle.textContent = uiText.creative.title[lang];
  const creativeSection = document.querySelector('section[data-screen="creative"]');
  if (creativeSection) {
    const creativeInputPanel = dom.creativeInput?.closest("article.panel");
    const creativeJsonPanel = creativeSection.querySelector('.creative-json[data-panel="pipeline-role"]');
    const creativeOutputPanel = creativeSection.querySelector(".creative-output");
    setPanelCopy(creativeInputPanel, uiText.creative.input);
    setPanelCopy(creativeJsonPanel, uiText.pipeline.roleCard);
    setPanelCopy(creativeOutputPanel, uiText.creative.output);
  }

  // 更新占位文本
  if (dom.input) {
    dom.input.placeholder = uiText.pipeline.input.placeholder[lang];
    dom.input.setAttribute("aria-label", uiText.pipeline.input.title[lang]);
  }
  if (dom.creativeInput) {
    dom.creativeInput.placeholder = uiText.creative.input.placeholder[lang];
    dom.creativeInput.setAttribute("aria-label", uiText.creative.input.title[lang]);
  }
  const inputHelp = document.getElementById('user-input-help');
  if (inputHelp) inputHelp.textContent = uiText.pipeline.input.help[lang];
  const creativeHelp = document.getElementById("creative-input-help");
  if (creativeHelp) creativeHelp.textContent = uiText.creative.input.help[lang];

  // 更新chip按钮文本
  if (state.lastDecision) {
    updateRouting(state.lastDecision);
  }
  if (state.lastMetrics) {
    updateCommercial(state.lastMetrics);
  }

  // 更新等待文本
  if (dom.codeScriptManifest) {
    if (state.pipelineCard) {
      stopTypewriter(dom.codeScriptManifest);
      dom.codeScriptManifest.value = buildScriptManifest(state.pipelineCard, dom.codeScript?.value ?? "");
    } else {
      primeTextArea(dom.codeScriptManifest, uiText.misc.waitingGenerate[lang]);
    }
  }
  if (state.input.trim()) {
    state.promptTypingPromise = updatePromptPreview(state.input);
  } else {
    state.promptTypingPromise = Promise.resolve();
    resetPromptPreview();
  }
  updateSkeletonTexts();
  updateResourceButtonState();
  handleRoleCardEditorInput();
}

// 更新占位文本
function updateSkeletonTexts() {
  if (!dom) return;

  const lang = state.lang;

  if (!state.creativeCard) {
    if (dom.roleCardEditor) primeTextArea(dom.roleCardEditor, uiText.misc.waitingGenerate[lang]);
    renderRoleCardPreview(null);
  }

  if (!state.pipelineCard) {
    if (dom.codeScript) primeTextArea(dom.codeScript, uiText.misc.waitingGenerate[lang]);
    if (dom.codeScriptManifest) primeTextArea(dom.codeScriptManifest, uiText.misc.waitingGenerate[lang]);
    setPipelineOutputsVisible(false);
    state.promptTypingPromise = Promise.resolve();
    if (dom.finalPrompt) dom.finalPrompt.textContent = uiText.misc.building[lang];
    if (dom.ioStatus) dom.ioStatus.textContent = uiText.misc.writing[lang];
    if (dom.scriptStatus) dom.scriptStatus.textContent = uiText.misc.writing[lang];
    if (dom.textureStatus) dom.textureStatus.textContent = uiText.misc.waitingAssets[lang];
    if (dom.engineStatusLine) {
      dom.engineStatusLine.textContent = uiText.intelligence.notOutput[lang];
      dom.engineStatusLine.dataset.lock = "false";
    }
  }
}

function setScreen(target, options = {}) {
  if (!dom) {
    console.warn('DOM not initialized yet');
    return;
  }

  const { scrollIntoView = false } = options;
  const prevScreen = state.currentScreen;
  state.currentScreen = target;
  animationState.lastActive = target;
  if (dom.navSteps) dom.navSteps.forEach((btn) => {
    if (btn) btn.classList.toggle("active", btn.dataset.target === target);
  });
  if (dom.screens) dom.screens.forEach((screen) => {
    if (screen) screen.classList.toggle("visible", screen.dataset.screen === target);
  });
  if (scrollIntoView && dom.screens) {
    const targetScreen = Array.from(dom.screens).find((screen) => screen?.dataset.screen === target);
    if (targetScreen) {
      const navOffset = (dom.topNav?.offsetHeight ?? 72) + 16;
      const top = targetScreen.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }
  handleRibbonTransition(prevScreen, target);
}

function mountComponents() {
  const mounts = [];
  const nodes = document.querySelectorAll("[data-component]");
  nodes.forEach((node) => {
    const name = node.dataset.component;
    const unmount = window.lingineComponentHost?.mount?.(name, node);
    if (typeof unmount === "function") {
      mounts.push(unmount);
    }
  });
  return () => mounts.forEach((fn) => {
    try {
      fn();
    } catch (error) {
      console.warn('Component unmount failed', error);
    }
  });
}

function startHeroIntro() {
  window.requestAnimationFrame(() => {
    document.body.classList.add("page-entered");
  });
}

function enterHeroFullscreen() {
  document.body.classList.add("hero-fullscreen");
  state.heroFull = true;
  heroVirtualScroll = 0;
  heroProgressTarget = 0;
  heroProgressCurrent = 0;
  if (!heroProgressRaf) {
    heroProgressRaf = window.requestAnimationFrame(driveHeroCollapseAnimation);
  }
  setHeroCollapseProgress(0);
}

function collapseHeroFullscreen() {
  if (!state.heroFull || state.heroCollapsing) return;
  state.heroCollapsing = true;
  heroVirtualScroll = HERO_COLLAPSE_RANGE;
  heroProgressTarget = 1;
  heroProgressCurrent = 1;
  setHeroCollapseProgress(1);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.body.classList.add("hero-collapsing");
  // 保持全屏类直到动画结束，避免跳变
  window.setTimeout(() => {
    document.body.classList.remove("hero-fullscreen");
    document.body.classList.remove("hero-collapsing");
    state.heroFull = false;
    state.heroCollapsing = false;
  }, 900);
}

function bindHeroTilt() {
  if (!dom || !dom.heroCard) return;
  const inner = dom.heroCard.querySelector(".hero-card-inner");
  if (!inner) return;
  const maxTilt = 6;
  let tiltFrame = null;
  let tiltState = { x: 0, y: 0, scale: 1 };

  const applyTilt = () => {
    inner.style.setProperty("--hero-tilt-x", `${tiltState.x.toFixed(2)}deg`);
    inner.style.setProperty("--hero-tilt-y", `${tiltState.y.toFixed(2)}deg`);
    inner.style.setProperty("--hero-tilt-scale", tiltState.scale.toFixed(2));
    tiltFrame = null;
  };

  const scheduleTilt = () => {
    if (tiltFrame !== null) return;
    tiltFrame = window.requestAnimationFrame(applyTilt);
  };

  const handleMove = (event) => {
    const rect = dom.heroCard.getBoundingClientRect();
    const xRatio = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const yRatio = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    tiltState = {
      x: -yRatio * maxTilt,
      y: xRatio * maxTilt,
      scale: 1.01,
    };
    scheduleTilt();
  };

  const resetTilt = () => {
    tiltState = { x: 0, y: 0, scale: 1 };
    scheduleTilt();
  };

  dom.heroCard.addEventListener("pointermove", handleMove);
  dom.heroCard.addEventListener("pointerleave", resetTilt);
}

// Ribbon顺序：1=创意，2=链路，3=代码，4=数据
const stageOrder = ["creative", "intelligence", "pipeline", "business"];
const ribbonKeyToScreen = {
  ideation: "creative",
  analysis: "intelligence",
  deployment: "pipeline",
  feedback: "business",
};

function bindRibbonEvents() {
  if (!dom?.workflowRibbon) return;
  const items = Array.from(dom.workflowRibbon.querySelectorAll(".ribbon-item"));
  items.forEach((item, index) => {
    const targetScreen = stageOrder[index];
    if (!targetScreen) return;
    item.dataset.targetScreen = targetScreen;
    item.tabIndex = 0;
    item.addEventListener("click", () => setScreen(targetScreen, { scrollIntoView: true }));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setScreen(targetScreen, { scrollIntoView: true });
      }
    });
  });
}

function handleRibbonTransition(prev, next) {
  // 飘入动画移除后，仅记录当前目标
  animationState.lastRibbonTarget = next || animationState.lastRibbonTarget;
}

function triggerRibbonFly(index, targetScreen) {
  // 飘入动画移除，保留函数占位避免调用异常
  return;
}

function syncScreenStylesByScroll(sections, viewportHeight) {
  if (state.heroFull || state.heroCollapsing) return;
  if (!sections.length) return;
  const focusLine = viewportHeight * 0.32;
  let closest = animationState.lastActive;
  let closestDelta = Number.POSITIVE_INFINITY;

  sections.forEach((section) => {
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height * 0.5;
    const centerDelta = Math.abs(sectionCenter - viewportHeight * 0.5);
    const delta = Math.abs(rect.top - focusLine);
    const visibility = clamp(1 - delta / (viewportHeight * 0.85), 0, 1);
    const prominence = clamp(1 - centerDelta / (viewportHeight * 1.1), 0, 1);
    const shift = Math.max(12, (1 - visibility) * 64);
    const opacity = Math.max(0.35, 0.45 + visibility * 0.55);
    const scale = 0.96 + prominence * 0.04;
    const glow = 0.25 + prominence * 0.65;

    if (delta < closestDelta) {
      closestDelta = delta;
      closest = section.dataset.screen;
    }
    section.style.setProperty("--screen-shift", `${shift}px`);
    section.style.setProperty("--screen-opacity", opacity.toFixed(3));
    section.style.setProperty("--screen-scale", scale.toFixed(3));
    section.style.setProperty("--screen-progress", prominence.toFixed(3));
    section.style.setProperty("--screen-glow-opacity", glow.toFixed(3));
  });

  if (closest && closest !== animationState.lastActive) {
    animationState.lastActive = closest;
    // 仅当目标卡片完全进入视窗才触发视觉切换
    const screenEl = sections.find((s) => s?.dataset.screen === closest);
    if (screenEl) {
      const rect = screenEl.getBoundingClientRect();
      const fullyVisible = rect.top >= 0 && rect.bottom <= viewportHeight;
      if (!fullyVisible) return;
    }
    setScreen(closest, { scrollIntoView: false });
  }
}

function startAnimationDriver() {
  if (!dom || !dom.screens?.length) return;
  const sections = Array.from(dom.screens);

  const loop = () => {
    const viewportHeight = window.innerHeight || 1;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const docHeight = document.documentElement.scrollHeight - viewportHeight;
    const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
    document.documentElement.style.setProperty("--page-progress", progress.toFixed(4));
    if (state.heroFull && scrollY > viewportHeight * 0.18) {
      collapseHeroFullscreen();
    }
    syncScreenStylesByScroll(sections, viewportHeight);
    animationState.rafId = window.requestAnimationFrame(loop);
  };

  if (animationState.rafId) {
    window.cancelAnimationFrame(animationState.rafId);
  }
  animationState.rafId = window.requestAnimationFrame(loop);
}

function updateRouting(decision) {
  if (!dom) {
    console.warn('DOM not initialized yet');
    return;
  }

  state.lastDecision = decision;
  if (dom.modelHighlight) dom.modelHighlight.textContent = decision.selectedModel;
  if (dom.modelMetrics) {
    const metricsText = state.lang === "cn"
      ? `响应 ${decision.metrics.latency}ms · 成本 $${decision.metrics.cost}`
      : `Latency ${decision.metrics.latency}ms · Cost $${decision.metrics.cost}`;
    dom.modelMetrics.textContent = metricsText;
  }

  const steps = [
    { key: "semantic", detail: decision.reasoning.semantic[state.lang] },
    { key: "capabilities", detail: decision.reasoning.capabilities[state.lang] },
    { key: "fallback", detail: decision.reasoning.fallback[state.lang] },
  ];
  if (dom.timeline) dom.timeline.innerHTML = steps
    .map((s) => `<li><h4>${routingStepCopy[s.key][state.lang]}</h4><p>${s.detail}</p></li>`)
    .join("");
  if (dom.routingLog) dom.routingLog.value = JSON.stringify(decision, null, 2);
}

function updateCreativeRoleCard(card, options = {}) {
  if (!dom) {
    console.warn('DOM not initialized yet');
    return;
  }

  const { animate = false } = options;
  state.creativeCard = card || null;
  if (!card) {
    resetRoleCardPreview();
    return;
  }

  const jsonText = JSON.stringify(card, null, 2);
  if (!dom.roleCardEditor) {
    renderRoleCardPreview(card);
    return;
  }

  if (!animate) {
    stopTypewriter(dom.roleCardEditor);
    dom.roleCardEditor.value = jsonText;
    renderRoleCardPreview(card);
    return;
  }

  renderRoleCardPreview(null);
  const config = TYPEWRITER_DEFAULTS.json;
  typewriterEffect(dom.roleCardEditor, jsonText, {
    chunk: config.chunk,
    minDelay: config.minDelay,
    maxDelay: config.maxDelay,
    initialDelay: config.initialDelay,
    onComplete: () => renderRoleCardPreview(card),
  });
}

async function updateEngineScript(script, card = state.pipelineCard) {
  if (!dom) {
    console.warn('DOM not initialized yet');
    return;
  }

  setPipelineOutputsVisible(true);
  const codeText = script ?? "";
  try {
    await state.promptTypingPromise;
  } catch {
    // ignore prompt failures
  }
  if (dom.codeScript) {
    const config = TYPEWRITER_DEFAULTS.code;
    await typewriterEffect(dom.codeScript, codeText, {
      chunk: config.chunk,
      minDelay: config.minDelay,
      maxDelay: config.maxDelay,
      initialDelay: config.initialDelay,
    });
  }
  if (dom.codeScriptManifest) {
    const manifestConfig = TYPEWRITER_DEFAULTS.manifest;
    await typewriterEffect(dom.codeScriptManifest, buildScriptManifest(card, codeText), {
      chunk: manifestConfig.chunk,
      minDelay: manifestConfig.minDelay,
      maxDelay: manifestConfig.maxDelay,
      initialDelay: manifestConfig.initialDelay,
    });
  }
}

function updateEnginePreview(card) {
  if (!dom) {
    console.warn('DOM not initialized yet');
    return;
  }

  state.pipelineCard = card || null;
  const lang = state.lang;
  const hasCard = Boolean(card);
  if (dom.engineStatusLine) {
    dom.engineStatusLine.textContent = hasCard ? getEngineStatusMessage(card) : uiText.intelligence.notOutput[lang];
    dom.engineStatusLine.dataset.lock = hasCard ? "true" : "false";
  }
  if (dom.ioStatus) {
    dom.ioStatus.textContent = hasCard ? `res://assets/characters/${card.id}/data.json` : uiText.misc.writing[lang];
  }
  if (dom.scriptStatus) {
    dom.scriptStatus.textContent = hasCard ? "engine/scripts/autogen/role_controller.gd" : uiText.misc.writing[lang];
  }
}

function updateCommercial(metrics) {
  if (!dom) {
    console.warn('DOM not initialized yet');
    return;
  }

  state.lastMetrics = metrics;
  const lang = state.lang;
  if (dom.commercialGrid) dom.commercialGrid.innerHTML = metrics
    .map(
      (item) => `
        <article class="commercial-card">
          <h3>${item.title?.[lang] ?? item.title}</h3>
          <p>${item.summary?.[lang] ?? item.summary}</p>
          <ul>
            <li>${lang === "cn" ? `生成耗时：${item.tts} 秒` : `Generation time: ${item.tts} s`}</li>
            <li>${lang === "cn" ? `模型成本：$${item.cost.toFixed(3)}` : `Model cost: $${item.cost.toFixed(3)}`}</li>
            <li>${lang === "cn" ? `复用率：${item.reuse}%` : `Reuse rate: ${item.reuse}%`}</li>
          </ul>
        </article>`,
    )
    .join("");
}

async function loadResourceImages(options = {}) {
  if (!dom || !dom.assetGrid) return [];
  const { override = false } = options;
  if (!override && !canGenerateAssets()) {
    showResourceMessage("empty");
    return [];
  }
  const gallery = dom.assetGrid;
  gallery.innerHTML = "";
  gallery.classList.add("is-loading");
  gallery.dataset.revealed = "false";
  hideResourceMessage();
  state.assetGenerating = true;
  updateResourceButtonState();

  try {
    const images = await fetchResourceImages();
    if (!images.length) {
      showResourceMessage("missing");
      return [];
    }

    await revealResourceImagesSequential(images);
    gallery.dataset.revealed = "true";
    hideResourceMessage();
    state.assetsReady = true;
    dom.assetGrid.hidden = false;

    return images;
  } catch (error) {
    console.error("Resource load error:", error);
    showResourceMessage("error");
    return [];
  } finally {
    gallery.classList.remove("is-loading");
    state.assetGenerating = false;
    updateResourceButtonState();
  }
}

function revealResourceImagesSequential(images) {
  if (!dom || !dom.assetGrid) return Promise.resolve([]);
  const gallery = dom.assetGrid;
  gallery.innerHTML = "";
  return new Promise((resolve) => {
    if (!images.length) {
      resolve([]);
      return;
    }
    images.forEach((src, idx) => {
      window.setTimeout(() => {
        const item = document.createElement("figure");
        item.className = "resource-item";
        item.style.setProperty("--reveal-order", String(idx));

        const img = document.createElement("img");
        img.src = src;
        img.alt = `resource-${idx + 1}`;
        img.loading = "lazy";

        const caption = document.createElement("figcaption");
        caption.className = "sr-only";
        caption.textContent = `resource-${idx + 1}`;

        item.append(img, caption);
        gallery.appendChild(item);

        if (idx === images.length - 1) {
          resolve(images);
        }
      }, idx * 180);
    });
  });
}

async function fetchResourceImages() {
  const directorySources = await fetchResourceDirectoryListing();
  const manifestSources = await fetchResourceManifest();

  if (directorySources.length) {
    if (!manifestSources.length) return directorySources;
    const normalizedSet = new Set(directorySources);
    const merged = [...directorySources];
    manifestSources.forEach((src) => {
      if (!normalizedSet.has(src)) {
        normalizedSet.add(src);
        merged.push(src);
      }
    });
    return merged;
  }

  return manifestSources;
}

async function fetchResourceManifest() {
  try {
    const response = await fetch("./resource/manifest.json", { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    const entries = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.images)
        ? payload.images
        : [];
    const normalized = entries
      .map((file) => normalizeResourcePath(file))
      .filter(Boolean);
    return Array.from(new Set(normalized));
  } catch (error) {
    return [];
  }
}

async function fetchResourceDirectoryListing() {
  try {
    const response = await fetch("./resource/", { cache: "no-store" });
    if (!response.ok) return [];
    const text = await response.text();
    const matches = Array.from(
      text.matchAll(/href="([^"]+\.(?:png|jpe?g|gif|webp|bmp))"/gi),
    );
    const normalized = matches
      .map((match) => match[1])
      .filter(Boolean)
      .map((file) => normalizeResourcePath(file));
    return Array.from(new Set(normalized));
  } catch (error) {
    return [];
  }
}

function normalizeResourcePath(file) {
  if (typeof file !== "string" || !file.trim()) return null;
  const clean = file.replace(/\\/g, "/").replace(/^\.?\/*/, "");
  if (/^resource\//.test(clean)) {
    return `./${clean}`;
  }
  return `./resource/${clean}`;
}

function renderRoleCardPreview(card, errorMessage) {
  if (!dom || !dom.creativePreview) return;
  const container = dom.creativePreview;
  const lang = state.lang;

  container.dataset.revealed = card && !errorMessage ? "true" : "false";
  container.classList.toggle("skeleton", !card && !errorMessage);

  if (errorMessage) {
    container.classList.remove("skeleton");
    container.classList.add("is-empty");
    container.innerHTML = `<p class="role-preview-error">${errorMessage}</p>`;
    container.style.removeProperty("--role-theme-rgb");
    container.style.removeProperty("--role-theme");
    return;
  }

  if (!card) {
    container.classList.add("is-empty");
    container.innerHTML = `<p>${uiText.creative.output.waiting[lang]}</p>`;
    container.style.removeProperty("--role-theme-rgb");
    container.style.removeProperty("--role-theme");
    return;
  }

  container.classList.remove("skeleton");
  container.classList.remove("is-empty");
  container.innerHTML = "";
  const themeColor = card.visuals?.theme_color || "#5bc6ff";
  const rgb = hexToRgb(themeColor);
  container.style.setProperty("--role-theme", themeColor);
  if (rgb) {
    container.style.setProperty("--role-theme-rgb", `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`);
  }

  const meta = document.createElement("div");
  meta.className = "role-card-meta-card";

  const avatarWrap = document.createElement("div");
  avatarWrap.className = "role-card-avatar";
  const avatarImg = document.createElement("img");
  avatarImg.alt = card.name || "role portrait";
  const resolvedPortrait = resolvePortraitPath(card.visuals?.portrait_path);
  avatarImg.src = resolvedPortrait || DEFAULT_PORTRAIT;
  avatarImg.onerror = () => {
    avatarImg.dataset.fallback = "true";
    avatarImg.src = DEFAULT_PORTRAIT;
  };
  avatarWrap.appendChild(avatarImg);

  const metaInfo = document.createElement("div");
  metaInfo.className = "role-card-meta-info";
  const nameEl = document.createElement("h3");
  nameEl.textContent = card.name || (lang === "cn" ? "未命名角色" : "Untitled Role");

  const tagsWrap = document.createElement("div");
  tagsWrap.className = "role-card-tags";
  const tags = Array.isArray(card.tags) && card.tags.length ? card.tags : [lang === "cn" ? "待定" : "pending"];
  tags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "role-card-tag";
    span.textContent = `#${tag}`;
    tagsWrap.appendChild(span);
  });

  const themeChip = document.createElement("span");
  themeChip.className = "role-card-tag";
  themeChip.textContent = themeColor;
  tagsWrap.appendChild(themeChip);

  const skillsSection = document.createElement("div");
  skillsSection.className = "role-card-skills";
  const skillsTitle = document.createElement("h4");
  skillsTitle.textContent = rolePreviewText.skills[lang];
  const skillsList = document.createElement("ul");
  const skills = Array.isArray(card.skills) && card.skills.length ? card.skills : [lang === "cn" ? "未配置技能" : "skill_pending"];
  skills.forEach((skill) => {
    const li = document.createElement("li");
    li.textContent = skill;
    skillsList.appendChild(li);
  });
  skillsSection.append(skillsTitle, skillsList);

  metaInfo.append(nameEl, tagsWrap, skillsSection);

  const statsColumn = document.createElement("div");
  statsColumn.className = "role-card-meta-stats";
  const statsTitle = document.createElement("h4");
  statsTitle.textContent = rolePreviewText.stats[lang];
  statsColumn.appendChild(statsTitle);
  const statsGrid = document.createElement("div");
  statsGrid.className = "role-card-meta-stats-grid";
  const statLabels = {
    hp_max: { cn: "生命", en: "HP" },
    mp_max: { cn: "能量", en: "MP" },
    atk: { cn: "攻击", en: "ATK" },
    def: { cn: "防御", en: "DEF" },
    str: { cn: "力量", en: "STR" },
    spd: { cn: "速度", en: "SPD" },
  };
  ["hp_max", "mp_max", "atk", "def", "str", "spd"].forEach((key) => {
    const statCard = document.createElement("div");
    statCard.className = "role-card-stat";
    const label = document.createElement("span");
    label.textContent = statLabels[key][lang];
    const value = document.createElement("strong");
    value.textContent = card.base_stats?.[key] ?? "—";
    statCard.append(label, value);
    statsGrid.appendChild(statCard);
  });
  statsColumn.appendChild(statsGrid);
  meta.append(avatarWrap, metaInfo, statsColumn);

  const sections = [
    { key: "lore", body: buildLoreNarrative(card) },
    { key: "art", body: buildArtNarrative(card) },
    { key: "behavior", body: buildBehaviorNarrative(card) },
  ];

  const insightGrid = document.createElement("div");
  insightGrid.className = "role-card-insight-grid";

  sections.forEach((entry) => {
    const block = document.createElement("article");
    block.className = "role-card-insight";
    const title = document.createElement("h3");
    title.textContent = narrativeSectionText[entry.key]?.[lang] ?? entry.key;
    const input = document.createElement("textarea");
    input.className = "role-card-insight-input";
    input.value = entry.body;
    input.rows = 6;
    input.spellcheck = false;
    block.append(title, input);
    insightGrid.appendChild(block);
  });

  container.append(meta, insightGrid);
}

function buildArtNarrative(card) {
  const lang = state.lang;
  const description = (dom?.creativeInput?.value || "").trim();
  const paragraphs = description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const art = paragraphs[2] || "";
  const fallback = lang === "cn" ? "暂无美术设计信息" : "No art direction data provided.";
  return art || fallback;
}

function buildLoreNarrative(card) {
  const lang = state.lang;
  const description = (dom?.creativeInput?.value || "").trim();
  const paragraphs = description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const lore = paragraphs[1] || "";
  return lore || (lang === "cn" ? "暂无背景描述" : "No backstory yet.");
}

function buildBehaviorNarrative(card) {
  const lang = state.lang;
  const description = (dom?.creativeInput?.value || "").trim();
  const paragraphs = description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const behavior = paragraphs[3] || "";
  if (behavior) return behavior;

  const aiConfig = card.ai_config ?? {};
  const entries = Object.entries(aiConfig).map(([key, value]) => `${key}: ${value}`);
  if (entries.length > 0) {
    return entries.join(" · ");
  }
  if (Array.isArray(card.skills) && card.skills.length > 0) {
    const label = lang === "cn" ? "技能驱动：" : "Skill-driven:";
    return `${label} ${card.skills.join(", ")}`;
  }
  return lang === "cn" ? "暂无行为逻辑信息" : "No behavior logic specified.";
}

async function mockRouteDecision(payload) {
  await wait(400);
  const models = ["gemini-flash-lite", "gpt-5-all", "qvq-plus", "claude-sonnet-4-all"];
  const selectedModel = payload.description.includes("刺客")
    ? "gpt-5-all"
    : models[Math.floor(Math.random() * models.length)];
  const keywords = extractKeywords(payload.description).join(" / ") || "N/A";
  const chain = "gemini-flash-lite → gpt-5-all → qvq-plus → claude-sonnet-4-all";
  return {
    id: crypto.randomUUID(),
    selectedModel,
    metrics: {
      latency: 240 + Math.floor(Math.random() * 60),
      cost: (0.00005 + Math.random() * 0.0003).toFixed(5),
    },
    reasoning: {
      semantic: {
        cn: `检测到关键词：${keywords}`,
        en: `Keywords detected: ${keywords}`,
      },
      capabilities: {
        cn: "需求：vision + structured_output，优先视觉模型。",
        en: "Needs: vision + structured_output, prioritizing vision models.",
      },
      fallback: {
        cn: `链路：${chain}`,
        en: `Chain: ${chain}`,
      },
    },
  };
}

async function mockRoleCard(decision, payload) {
  await wait(300);
  return buildRoleCardFromDescription(payload.description);
}

async function mockEngineScript(card) {
  await wait(200);
  return `extends CharacterBody2D

@export var role_id: String = "${card.id}"
@export var theme_color: Color = Color("${card.visuals.theme_color}")
@export var base_speed: float = ${clamp(card.base_stats.spd / 2, 80, 220)}

var sprite: Sprite2D
var stats = ${JSON.stringify(card.base_stats)}

func _ready() -> void:
    sprite = _ensure_sprite()
    sprite.texture = load("${card.visuals.sprite_path}")

func _physics_process(delta: float) -> void:
    velocity = Vector2(base_speed, 0).rotated(Time.get_ticks_msec() * 0.001)
    move_and_slide()

func _ensure_sprite() -> Sprite2D:
    if has_node("Sprite"):
        return get_node("Sprite")
    var inst = Sprite2D.new()
    inst.name = "Sprite"
    add_child(inst)
    return inst`;
}

async function mockCommercialMetrics() {
  await wait(200);
  return [
    {
      title: { cn: "量产 Boss", en: "Mass Boss Production" },
      summary: { cn: "每日 200 角色 · GPU 集群自动扩缩", en: "200 characters/day · auto-scaling GPU clusters" },
      tts: 42,
      cost: 0.018,
      reuse: 78,
    },
    {
      title: { cn: "联动 IP", en: "IP Collaborations" },
      summary: { cn: "版权提示词模板 + 自动合规", en: "Licensed prompt templates with automatic compliance" },
      tts: 51,
      cost: 0.021,
      reuse: 64,
    },
    {
      title: { cn: "UGC 市场", en: "UGC Marketplace" },
      summary: { cn: "玩家自定义角色卡 + 引擎资源包输出", en: "Player-made role cards + engine-ready asset packs" },
      tts: 68,
      cost: 0.024,
      reuse: 82,
    },
  ];
}

// Utilities --------------------------------------------------

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function extractKeywords(text) {
  return text
    .split(/[,，。.\s]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
}

// Narrative + theme hydration -------------------------------

function hydrateNarrative() {
  if (!dom) {
    console.warn('DOM not initialized yet');
    return;
  }

  try {
    // 根据当前语言设置显示内容
    const lang = state.lang;
    if (dom.heroLeadCn && lang === 'cn') dom.heroLeadCn.innerHTML = heroContent.lead.cn;
    if (dom.heroLeadEn && lang === 'en') dom.heroLeadEn.innerHTML = heroContent.lead.en;

    if (dom.heroSteps) {
      dom.heroSteps.innerHTML = heroContent.steps
        .map(
          (step, idx) => `
            <li data-key="${step.key}">
              <span>${String(idx + 1).padStart(2, "0")}</span>
              <strong class="copy-cn">${step.cn.title}</strong>
              <strong class="copy-en">${step.en.title}</strong>
              <em class="copy-cn">${step.cn.desc}</em>
              <em class="copy-en">${step.en.desc}</em>
            </li>`,
        )
        .join("");
    }

    if (dom.workflowRibbon) {
      dom.workflowRibbon.innerHTML = workflowContent
        .map(
          (item) => `
            <div class="ribbon-item" data-key="${item.key}">
              <span class="copy-cn">${item.cn.title}</span>
              <span class="copy-en">${item.en.title}</span>
              <p class="copy-cn">${item.cn.desc}</p>
              <p class="copy-en">${item.en.desc}</p>
            </div>`,
        )
        .join("");
    }
    bindRibbonEvents();
  } catch (error) {
    console.error('Narrative hydration error:', error);
  }
}

const lingineThemeTokens = {
  light: {
    primary: "#1b2b5a",
    background: "#f6f8ff",
    accent: "linear-gradient(135deg, #5bc6ff, #6c8bff 35%, #ff78c4)",
  },
  dark: {
    primary: "#8de4ff",
    background: "#04070f",
    accent: "linear-gradient(135deg, #a6f3ff, #7dd0ff 35%, #ff7dd7)",
  },
};

function applyLingineTokens(theme) {
  const tokens = lingineThemeTokens[theme];
  window.lingineUI?.setTheme(theme, tokens);
}

function getEngineStatusMessage(card) {
  if (!card) {
    return uiText.intelligence.notOutput[state.lang];
  }
  return state.lang === "cn"
    ? `角色 ${card.name} 已推送`
    : `Character ${card.name} pushed`;
}

// Boot -------------------------------------------------------

// 调用初始化函数
initializeApp();
