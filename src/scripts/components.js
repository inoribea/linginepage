const themeListeners = new Set();

window.lingineUI = {
  currentTheme: "dark",
  setTheme(theme, tokens) {
    this.currentTheme = theme;
    document.documentElement.style.setProperty("--accent-grad", tokens.accent);
    if (tokens?.accent) {
      document.documentElement.style.setProperty("--band-gradient", tokens.accent);
    }
    themeListeners.forEach((fn) => fn(theme, tokens));
  },
  subscribe(fn) {
    themeListeners.add(fn);
    return () => themeListeners.delete(fn);
  },
};

const componentFactories = {
  "visual-stack": (el) => {
    const canvas = document.getElementById("stellar-map") || el.querySelector("#stellar-map");
    const cleanupParticle = initParticleField(canvas);
    const liquidBand = document.createElement("div");
    liquidBand.className = "liquid-band";
    el.prepend(liquidBand);
    const fogLayer = document.createElement("div");
    fogLayer.className = "fog-layer";
    el.appendChild(fogLayer);
    const unsub = window.lingineUI.subscribe((theme, tokens) => {
      el.style.setProperty("--visual-border", tokens.accent);
      el.style.setProperty("--visual-glow", theme === "dark" ? "rgba(150,247,255,0.2)" : "rgba(90,110,180,0.3)");
      if (tokens?.accent) {
        liquidBand.style.background = tokens.accent;
      }
      fogLayer.style.opacity = theme === "dark" ? "0.85" : "0.7";
      liquidBand.style.animationDuration = theme === "dark" ? "16s" : "12s";
    });
    // 初始化一次，避免订阅前无样式
    const currentGradient = getComputedStyle(document.documentElement).getPropertyValue("--band-gradient");
    if (currentGradient) {
      liquidBand.style.background = currentGradient;
    }
    fogLayer.style.opacity = "0.8";
    liquidBand.style.animationDuration = "14s";
    return () => {
      cleanupParticle?.();
      unsub?.();
      liquidBand.remove();
      fogLayer.remove();
    };
  },
  "ribbon-glow": (el) => {
    const glow = document.createElement("div");
    glow.className = "ribbon-glow";
    el.appendChild(glow);

    const handleMove = (event) => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      glow.style.setProperty("--glow-x", `${x}%`);
      glow.style.setProperty("--glow-y", `${y}%`);
      glow.style.opacity = "1";
    };

    const handleLeave = () => {
      glow.style.opacity = "0";
    };

    const unsub = window.lingineUI.subscribe((_, tokens) => {
      if (tokens?.accent) {
        glow.style.background = `radial-gradient(circle at var(--glow-x,50%) var(--glow-y,50%), rgba(150, 247, 255, 0.16), transparent 38%), ${tokens.accent}`;
      }
    });

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", handleLeave);

    return () => {
      unsub?.();
      glow.remove();
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
    };
  },
  "stage-card": (el) => {
    const orb = document.createElement("div");
    orb.className = "stage-orb";
    el.appendChild(orb);
    const unsub = window.lingineUI.subscribe((_, tokens) => {
      orb.style.background = tokens.accent;
    });
    return () => {
      unsub?.();
      orb.remove();
    };
  },
};

window.lingineComponentHost = {
  mount(name, el) {
    const factory = componentFactories[name];
    if (!factory) {
      return () => {};
    }
    return factory(el);
  },
};

function initParticleField(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const particles = [];
  let viewWidth = 0;
  let viewHeight = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    viewWidth = rect.width;
    viewHeight = rect.height;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnParticles(count = 24) {
    particles.length = 0;
    for (let i = 0; i < count; i += 1) {
      const baseSpeed = 0.00012;
      const variance = 0.00035;
      const slowFactor = 0.05; // 放慢 20 倍
      particles.push({
        x: Math.random(),
        y: Math.random(),
        r: 1 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.7,
        speed: (baseSpeed + Math.random() * variance) * slowFactor,
      });
    }
  }

  function draw() {
    // 添加安全检查，确保canvas上下文仍然可用
    if (!ctx) return;

    ctx.clearRect(0, 0, viewWidth, viewHeight);

    // 绘制粒子
    particles.forEach((p) => {
      p.y -= p.speed * viewHeight;
      if (p.y < 0) p.y = 1;

      // 添加一些随机漂移动画
      p.x += (Math.random() - 0.5) * 0.0002 * viewWidth;
      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;

      ctx.beginPath();
      // 使用更霓虹的颜色
      ctx.fillStyle = `rgba(150, 247, 255, ${p.alpha})`;
      ctx.arc(p.x * viewWidth, p.y * viewHeight, p.r, 0, Math.PI * 2);
      ctx.fill();

      // 绘制粒子的光晕效果
      const gradient = ctx.createRadialGradient(
        p.x * viewWidth, p.y * viewHeight, 0,
        p.x * viewWidth, p.y * viewHeight, p.r * 3
      );
      gradient.addColorStop(0, `rgba(150, 247, 255, ${p.alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(150, 247, 255, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x * viewWidth, p.y * viewHeight, p.r * 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 添加连接线效果，增强视觉连续性
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = (particles[i].x - particles[j].x) * viewWidth;
        const dy = (particles[i].y - particles[j].y) * viewHeight;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(150, 247, 255, ${0.2 * (1 - distance/100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x * viewWidth, particles[i].y * viewHeight);
          ctx.lineTo(particles[j].x * viewWidth, particles[j].y * viewHeight);
          ctx.stroke();
        }
      }
    }

    frame = requestAnimationFrame(draw);
  }

  resize();
  spawnParticles();
  let frame = requestAnimationFrame(draw);
  window.addEventListener("resize", resize);

  // 返回清理函数，确保动画和事件监听器被正确清理
  return () => {
    if (frame) {
      cancelAnimationFrame(frame);
    }
    window.removeEventListener("resize", resize);
  };
}

function autoMountComponents() {
  // 确保元素确实存在且未被重复挂载
  document.querySelectorAll("[data-component]").forEach((el) => {
    // 避免重复挂载同一个组件
    if (el._lingineMounted) {
      return;
    }

    const key = el.dataset.component;
    const unmount = window.lingineComponentHost.mount(key, el);
    el._lingineUnmount = unmount;
    el._lingineMounted = true; // 标记为已挂载
  });
}

// 使用 MutationObserver 来检测元素移除，替代已弃用的 DOMNodeRemoved 事件
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      // 检查是否有被移除的节点
      for (const node of mutation.removedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 检查此元素或其子元素是否包含组件
          if (node._lingineUnmount) {
            node._lingineUnmount();
          }
          // 检查此元素内是否有组件元素
          const components = node.querySelectorAll && node.querySelectorAll("[data-component]");
          if (components) {
            components.forEach(comp => {
              if (comp._lingineUnmount) {
                comp._lingineUnmount();
              }
            });
          }
        }
      }
    }
  }
});

// 开始观察整个文档的变化
observer.observe(document, {
  childList: true,
  subtree: true
});

// 改进DOM加载检测
function ensureDOMLoaded() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMountComponents);
  } else if (document.readyState === "interactive" || document.readyState === "complete") {
    // 即使DOM已交互，也等待一会确保所有元素完全渲染
    setTimeout(autoMountComponents, 0);
  }
}

// 立即尝试挂载，或等待DOM加载
ensureDOMLoaded();

// 扩展现有的lingineComponentHost对象
if (window.lingineComponentHost) {
  window.lingineComponentHost.mountAll = autoMountComponents; // 添加重新挂载所有组件的方法
}
