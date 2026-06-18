/* ===========================================================
   MY-DOCS 交互脚本 — 完整版
   - 4 套主题预设（01MVP / Linear / Claude / Blueprint）
   - 明暗主题切换
   - 风格切换 Popover
   - Presenter 模式（带页码进度 + 翻页）
   - Zen 模式
   - ⌘K 搜索弹窗
   - 侧边栏折叠 / 移动端抽屉
   - 公告关闭
   - 代码块复制
   - TOC 滚动高亮
   - 反馈点赞
   - 键盘快捷键
   =========================================================== */

(function () {
  'use strict';

  const root = document.documentElement;
  const layout = document.querySelector('.layout');
  const STORAGE = {
    theme:   'mydocs-theme',
    preset:  'mydocs-preset',
    sidebar: 'mydocs-sidebar',
    announce: 'mydocs-announce-closed',
  };

  const PRESETS = [
    { id: '01mvp',     label: '01MVP'    },
    { id: 'linear',    label: 'Linear'   },
    { id: 'claude',    label: 'Claude'   },
    { id: 'blueprint', label: 'Blueprint'},
  ];

  /* =========================================================
     1) 主题 / 预设管理
     ========================================================= */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE.theme, theme); } catch (_) {}
  }
  function applyPreset(preset) {
    root.setAttribute('data-preset', preset);
    try { localStorage.setItem(STORAGE.preset, preset); } catch (_) {}
    // 顶部 preset label
    document.querySelectorAll('[data-current-preset]').forEach((el) => {
      const found = PRESETS.find((p) => p.id === preset);
      el.textContent = found ? found.label : preset;
    });
    // popover 选中态
    document.querySelectorAll('.preset-card').forEach((c) => {
      c.classList.toggle('is-active', c.getAttribute('data-preset') === preset);
    });
  }

  function getStored(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : v; }
    catch (_) { return fallback; }
  }
  function prefersDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // 初始化
  const initialTheme  = ['light', 'dark'].includes(getStored(STORAGE.theme, ''))
    ? getStored(STORAGE.theme)
    : (prefersDark() ? 'dark' : 'light');
  applyTheme(initialTheme);

  const initialPreset = PRESETS.some((p) => p.id === getStored(STORAGE.preset, ''))
    ? getStored(STORAGE.preset)
    : '01mvp';
  applyPreset(initialPreset);

  /* =========================================================
     2) 主题切换
     ========================================================= */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* =========================================================
     3) 风格切换 Popover
     ========================================================= */
  const popover      = document.getElementById('presetPopover');
  const popoverBackdrop = document.querySelector('[data-close-presets]');
  const popoverTriggers = document.querySelectorAll('[data-open-presets]');

  function openPopover() {
    if (!popover) return;
    // 定位到触发按钮的下方
    const trigger = popoverTriggers[0];
    if (trigger) {
      const r = trigger.getBoundingClientRect();
      popover.style.top  = (r.bottom + 8) + 'px';
      popover.style.left = Math.max(16, r.right - 320) + 'px';
    }
    popover.classList.add('is-open');
    if (popoverBackdrop) popoverBackdrop.classList.add('is-open');
  }
  function closePopover() {
    if (!popover) return;
    popover.classList.remove('is-open');
    if (popoverBackdrop) popoverBackdrop.classList.remove('is-open');
  }
  popoverTriggers.forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popover.classList.contains('is-open')) closePopover();
    else openPopover();
  }));
  if (popoverBackdrop) popoverBackdrop.addEventListener('click', closePopover);

  // 选择 preset
  document.querySelectorAll('.preset-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-preset');
      if (PRESETS.some((p) => p.id === id)) {
        applyPreset(id);
        closePopover();
      }
    });
  });

  // 点外部关闭
  document.addEventListener('click', (e) => {
    if (!popover) return;
    if (popover.contains(e.target)) return;
    if ([...popoverTriggers].some((t) => t.contains(e.target))) return;
    closePopover();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popover && popover.classList.contains('is-open')) {
      closePopover();
    }
  });

  /* =========================================================
     4) ⌘K 搜索弹窗
     ========================================================= */
  const cmdk = document.getElementById('cmdk');
  const cmdkInput = document.getElementById('cmdkInput');
  const cmdkList = document.getElementById('cmdkList');
  const openSearchBtns = document.querySelectorAll('[data-open-search]');

  // 占位符搜索数据
  const SEARCH_ITEMS = [
    { title: '实战手册 · 概览',      group: '手册',     href: '#' },
    { title: 'Step 1：想法与验证',   group: 'Step 1',   href: '#why' },
    { title: 'Step 2：开工准备',     group: 'Step 2',   href: '#what' },
    { title: 'Step 3：构建 MVP',     group: 'Step 3',   href: '#code' },
    { title: 'Step 4：上线部署',     group: 'Step 4',   href: '#warn' },
    { title: 'Step 5：收费与变现',   group: 'Step 5',   href: '#checklist' },
    { title: 'Step 6：推广与运营',   group: 'Step 6',   href: '#next' },
    { title: '案例库',               group: '资源',     href: '#' },
    { title: '资源库',               group: '资源',     href: '#' },
    { title: '01MVP Start 模板',     group: '模板',     href: '#' },
  ];

  function openSearch() {
    if (!cmdk) return;
    cmdk.classList.add('is-open');
    setTimeout(() => cmdkInput && cmdkInput.focus(), 30);
  }
  function closeSearch() {
    if (!cmdk) return;
    cmdk.classList.remove('is-open');
    if (cmdkInput) cmdkInput.value = '';
    renderSearch('');
  }
  openSearchBtns.forEach((b) => b.addEventListener('click', openSearch));
  if (cmdk) {
    cmdk.addEventListener('click', (e) => {
      if (e.target === cmdk) closeSearch();
    });
  }

  function renderSearch(q) {
    if (!cmdkList) return;
    const ql = q.trim().toLowerCase();
    const items = ql
      ? SEARCH_ITEMS.filter((i) => i.title.toLowerCase().includes(ql))
      : SEARCH_ITEMS;
    if (!items.length) {
      cmdkList.innerHTML = '<div class="cmdk-empty">没有匹配的结果</div>';
      return;
    }
    cmdkList.innerHTML = items.map((i) => `
      <a class="cmdk-item" href="${i.href}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <path d="M14 2v6h6"></path>
        </svg>
        <span>${i.title}</span>
        <small>${i.group}</small>
      </a>
    `).join('');
    // 点击关闭
    cmdkList.querySelectorAll('.cmdk-item').forEach((a) => {
      a.addEventListener('click', () => setTimeout(closeSearch, 50));
    });
  }
  if (cmdkInput) cmdkInput.addEventListener('input', (e) => renderSearch(e.target.value));

  /* =========================================================
     5) Presenter 模式
     ========================================================= */
  const presenterBtns = document.querySelectorAll('[data-toggle-presenter]');
  const presenterCount = document.getElementById('presenterCount');
  const presenterPrev  = document.querySelector('[data-presenter-prev]');
  const presenterNext  = document.querySelector('[data-presenter-next]');

  // Presenter 模式下分节的"段落"：H1 + 每个 H2 各算一节
  function getPresenterSections() {
    const sections = [];
    const h1 = document.querySelector('.article h1');
    if (h1) sections.push({ el: h1, label: h1.textContent.trim() });
    document.querySelectorAll('.article h2').forEach((h) => {
      sections.push({ el: h, label: h.textContent.trim() });
    });
    return sections;
  }
  let presenterIndex = 0;
  function updatePresenter() {
    const sections = getPresenterSections();
    if (presenterIndex < 0) presenterIndex = 0;
    if (presenterIndex >= sections.length) presenterIndex = sections.length - 1;
    if (presenterCount) presenterCount.textContent = (presenterIndex + 1) + ' / ' + sections.length;
    // 滚动到当前段落
    if (sections[presenterIndex]) {
      sections[presenterIndex].el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  function togglePresenter() {
    if (!layout) return;
    const isOn = layout.getAttribute('data-presenter') === 'true';
    layout.setAttribute('data-presenter', String(!isOn));
    presenterBtns.forEach((b) => b.setAttribute('aria-pressed', String(!isOn)));
    if (!isOn) {
      presenterIndex = 0;
      updatePresenter();
    }
  }
  presenterBtns.forEach((b) => b.addEventListener('click', togglePresenter));
  if (presenterPrev) presenterPrev.addEventListener('click', () => { presenterIndex--; updatePresenter(); });
  if (presenterNext) presenterNext.addEventListener('click', () => { presenterIndex++; updatePresenter(); });

  /* =========================================================
     6) Zen 模式
     ========================================================= */
  const zenBtns = document.querySelectorAll('[data-toggle-zen]');
  function toggleZen() {
    if (!layout) return;
    const isOn = layout.getAttribute('data-zen') === 'true';
    layout.setAttribute('data-zen', String(!isOn));
    document.querySelectorAll('[data-toggle-zen]').forEach((b) =>
      b.setAttribute('aria-pressed', String(!isOn)));
  }
  zenBtns.forEach((b) => b.addEventListener('click', toggleZen));

  /* =========================================================
     7) 侧边栏折叠
     ========================================================= */
  const sidebarToggle  = document.querySelector('[data-sidebar-toggle]');
  const sidebarCollapse = document.querySelector('[data-sidebar-collapse]');
  const sidebar = document.getElementById('sidebar');

  function setSidebarCollapsed(collapsed) {
    if (!layout) return;
    layout.setAttribute('data-sidebar-collapsed', String(collapsed));
    try { localStorage.setItem(STORAGE.sidebar, String(collapsed)); } catch (_) {}
  }

  // 恢复折叠状态
  if (getStored(STORAGE.sidebar, 'false') === 'true' &&
      window.matchMedia('(min-width: 1025px)').matches) {
    setSidebarCollapsed(true);
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 1024px)').matches) {
        toggleMobileSidebar();
      } else {
        const cur = layout.getAttribute('data-sidebar-collapsed') === 'true';
        setSidebarCollapsed(!cur);
      }
    });
  }
  if (sidebarCollapse) {
    sidebarCollapse.addEventListener('click', () => setSidebarCollapsed(true));
  }

  // 移动端抽屉
  let backdrop = null;
  function ensureBackdrop() {
    if (backdrop) return backdrop;
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', closeMobileSidebar);
    return backdrop;
  }
  function openMobileSidebar() {
    if (!sidebar) return;
    ensureBackdrop().classList.add('is-open');
    sidebar.classList.add('is-open');
  }
  function closeMobileSidebar() {
    if (!sidebar) return;
    if (backdrop) backdrop.classList.remove('is-open');
    sidebar.classList.remove('is-open');
  }
  function toggleMobileSidebar() {
    if (!sidebar) return;
    if (sidebar.classList.contains('is-open')) closeMobileSidebar();
    else openMobileSidebar();
  }

  /* =========================================================
     8) 公告关闭
     ========================================================= */
  const announcement = document.getElementById('announcement');
  const announcementClose = document.querySelector('[data-close-announcement]');
  if (announcement && getStored(STORAGE.announce, 'false') === 'true') {
    announcement.classList.add('is-hidden');
  }
  if (announcementClose && announcement) {
    announcementClose.addEventListener('click', () => {
      announcement.classList.add('is-hidden');
      try { localStorage.setItem(STORAGE.announce, 'true'); } catch (_) {}
    });
  }

  /* =========================================================
     9) 代码块复制
     ========================================================= */
  document.querySelectorAll('.code-block').forEach((block) => {
    const btn = block.querySelector('.code-copy');
    const code = block.querySelector('pre code') || block.querySelector('pre');
    if (!btn || !code) return;

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.innerText);
        btn.classList.add('is-copied');
        setTimeout(() => btn.classList.remove('is-copied'), 1500);
      } catch (e) {
        const range = document.createRange();
        range.selectNodeContents(code);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  });

  /* =========================================================
     10) TOC 滚动高亮
     ========================================================= */
  const tocLinks = document.querySelectorAll('.toc-link');
  if (tocLinks.length) {
    const targets = Array.from(tocLinks)
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    function setActive(id) {
      tocLinks.forEach((a) => {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      });
    }

    if ('IntersectionObserver' in window && targets.length) {
      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible.length) setActive(visible[0].target.id);
        },
        { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
      );
      targets.forEach((t) => io.observe(t));
    }
    tocLinks.forEach((a) => {
      a.addEventListener('click', () => {
        const id = a.getAttribute('href').slice(1);
        setActive(id);
      });
    });
  }

  /* =========================================================
     11) 反馈点赞
     ========================================================= */
  const feedback = document.getElementById('feedback');
  if (feedback) {
    feedback.querySelectorAll('.feedback-btn').forEach((b) => {
      b.addEventListener('click', () => {
        feedback.classList.add('is-submitted');
        b.classList.add('is-active');
      });
    });
  }

  /* =========================================================
     12) 导航项折叠
     ========================================================= */
  document.querySelectorAll('[data-toggle-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      el.classList.toggle('is-expanded');
    });
  });

  /* =========================================================
     13) 全局键盘快捷键
     ========================================================= */
  document.addEventListener('keydown', (e) => {
    // ⌘K / Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      cmdk && cmdk.classList.contains('is-open') ? closeSearch() : openSearch();
      return;
    }
    // 搜索/弹窗打开时，Esc 关闭
    if (e.key === 'Escape') {
      if (cmdk && cmdk.classList.contains('is-open')) { closeSearch(); return; }
      if (popover && popover.classList.contains('is-open')) { closePopover(); return; }
    }
    // 不在输入框里时，启用字母快捷键
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    if (e.key === 'p' || e.key === 'P') { togglePresenter(); e.preventDefault(); }
    else if (e.key === 'z' || e.key === 'Z') { toggleZen(); e.preventDefault(); }
    else if (e.key === '/') { e.preventDefault(); openSearch(); }
    // Presenter 模式下左右箭头切页
    if (layout && layout.getAttribute('data-presenter') === 'true') {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        presenterIndex++; updatePresenter(); e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        presenterIndex--; updatePresenter(); e.preventDefault();
      }
    }
  });

  /* =========================================================
     14) 视口尺寸变化：清理移动端抽屉
     ========================================================= */
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 1025px)').matches) {
      closeMobileSidebar();
    }
  });
})();
