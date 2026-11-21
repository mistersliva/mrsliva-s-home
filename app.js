(() => {
  "use strict";

  const USER = "mistersliva";
  // Репозитории, которые не показываются на сайте
  const HIDDEN = new Set(["mrsliva-s-home", "mistersliva", "themenew"]);

  // Запасной список на случай, если GitHub API недоступен (лимит запросов и т.п.)
  const FALLBACK = [
    { name: "SourceSpeedrunMod", description: "SpeedrunMod for source-based mods. Based on Obsoletium", language: "C++", stars: 1, forks: 0, pushed: "2026-11-17" },
    { name: "SSM-Cutsceneless", description: "Cutsceneless HL2 maps (by peng), packaged for SourceSpeedrunMod", language: null, stars: 0, forks: 0, pushed: "2026-11-16" },
    { name: "schoolboy-runaway-hl1-movement", description: "Half-Life 1 / Source movement mod for SchoolBoy Runaway (BepInEx): bhop, air strafing, noclip, speedometer, speedrun timer", language: "C#", stars: 0, forks: 0, pushed: "2026-11-15" },
    { name: "MonoDownloader", description: "MonoDownloader — to download songs", language: "Kotlin", stars: 0, forks: 0, pushed: "2026-10-31" },
    { name: "HLSR-CommunityEdition", description: "Frontend improvements of HLSR Launcher", language: null, stars: 0, forks: 0, pushed: "2026-10-12" },
    { name: "openHLSR", description: "Updated HLSR with opened source code", language: null, stars: 0, forks: 0, pushed: "2026-10-10" },
    { name: "MiMUI", description: "An immediate-mode GUI library for Rust: markup-like syntax, CSS-style styling, declarative animation and PNG/SVG images, on wgpu.", language: "Rust", stars: 0, forks: 0, pushed: "2026-10-03", topics: ["animation", "gui", "immediate-mode", "rust", "ui-toolkit", "wgpu"] },
    { name: "SourceEngineClean", description: null, language: "C++", stars: 1, forks: 1, pushed: "2026-09-25" },
    { name: "PhotonEngineWeb", description: null, language: "Rust", stars: 0, forks: 0, pushed: "2026-09-05" },
    { name: "PhotonEngine", description: "Rust Vulkan-based lightweight game 3d engine", language: "Rust", stars: 0, forks: 0, pushed: "2026-09-01" },
    { name: "MijnMagister", description: "Custom Magister client that gives more possibilities for customization. (Vibecoded)", language: "JavaScript", stars: 1, forks: 0, pushed: "2026-08-18" },
    { name: "aetherra1n", description: "Hello bypass script for A13 tethered downgrade (vibecoded)", language: "Shell", stars: 0, forks: 0, pushed: "2026-08-02" },
    { name: "nfsmw-hl-2005", description: null, language: null, stars: 0, forks: 0, pushed: "2026-06-07" },
    { name: "67", description: null, language: "HTML", stars: 0, forks: 0, pushed: "2026-06-06" },
    { name: "FreshUI", description: "FreshUI is vibecoded ui for Source SDK 2013. it supports xml/css files.", language: "C++", stars: 0, forks: 0, pushed: "2026-05-29" },
    { name: "HL-F-Site", description: null, language: "HTML", stars: 0, forks: 0, pushed: "2026-05-26" },
    { name: "SLVspeed", description: null, language: "Python", stars: 0, forks: 0, pushed: "2026-03-02" },
    { name: "HLSR-CE", description: null, language: null, stars: 0, forks: 0, pushed: "2026-11-20", fork: true },
    { name: "source-physics", description: null, language: null, stars: 0, forks: 0, pushed: "2026-09-23", fork: true },
    { name: "Source-SDK-2013-sFusionUI", description: null, language: null, stars: 0, forks: 0, pushed: "2026-07-16", fork: true },
  ];

  const GLYPH = {
    "C++": "C++", "C": "C", "C#": "C#", "Rust": "Rs", "Kotlin": "Kt", "JavaScript": "JS",
    "TypeScript": "TS", "Python": "Py", "Shell": ">_", "HTML": "</>", "CSS": "{ }", "Lua": "Lua",
    "Java": "Jv", "Go": "Go",
  };

  const ACCENTS = [
    "#0078d7", "#0063b1", "#8e8cd8", "#6b69d6", "#8764b8", "#744da9", "#b146c2", "#881798",
    "#e74856", "#e81123", "#ea005e", "#c30052", "#ca5010", "#da3b01", "#ff8c00", "#ca5010",
    "#00b7c3", "#038387", "#00b294", "#018574", "#00cc6a", "#10893e", "#7a7574", "#567c73",
  ].filter((c, i, a) => a.indexOf(c) === i);

  // ---------- storage (может быть недоступно) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
  };

  const settings = {
    theme: store.get("theme", "system"),
    accent: store.get("accent", "#0078d7"),
    live: store.get("live", true),
  };

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const glyph = (r) => GLYPH[r.language] || (r.fork ? "⑂" : r.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2) || "•");
  const fmtDate = (d) => new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const human = (name) => name.replace(/[-_]/g, " ");
  function ago(d) {
    const days = Math.floor((Date.now() - new Date(d)) / 864e5);
    if (days < 1) return "сегодня";
    if (days < 2) return "вчера";
    if (days < 30) return `${days} дн. назад`;
    const m = Math.floor(days / 30);
    if (m < 12) return `${m} мес. назад`;
    return `${Math.floor(m / 12)} г. назад`;
  }
  const ICON = {
    star: '<svg viewBox="0 0 16 16"><path d="M8 .8l2.2 4.6 5 .7-3.6 3.5.9 5L8 12.2l-4.5 2.4.9-5L.8 6.1l5-.7z"/></svg>',
    ext: '<svg viewBox="0 0 16 16"><path d="M9 1h6v6h-1V2.7L7.4 9.3l-.7-.7L13.3 2H9zM1 3h6v1H2v10h10V9h1v6H1z"/></svg>',
    search: '<svg viewBox="0 0 16 16"><path d="M10 1a5 5 0 0 0-3.9 8.2L1 14.3l.7.7 5.1-5.1A5 5 0 1 0 10 1zm0 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>',
  };

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v + (amt > 0 ? (255 - v) * amt : v * amt))));
    const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  // ---------- theme ----------
  const mq = matchMedia("(prefers-color-scheme: light)");
  function applyTheme() {
    const t = settings.theme === "system" ? (mq.matches ? "light" : "dark") : settings.theme;
    document.documentElement.dataset.theme = t;
    const s = document.documentElement.style;
    s.setProperty("--accent", settings.accent);
    s.setProperty("--accent-light", shade(settings.accent, .3));
    s.setProperty("--accent-dark", shade(settings.accent, -.3));
  }
  mq.addEventListener?.("change", applyTheme);
  applyTheme();

  // ---------- data ----------
  let repos = FALLBACK.slice();
  let live = false;
  const readmeCache = new Map();

  async function loadRepos() {
    try {
      const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("bad data");
      repos = data.map((r) => ({
        name: r.name, description: r.description, language: r.language,
        stars: r.stargazers_count, forks: r.forks_count, pushed: r.pushed_at,
        created: r.created_at, fork: r.fork, homepage: r.homepage, topics: r.topics || [],
        license: r.license && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null,
        issues: r.open_issues_count, branch: r.default_branch,
      }));
      live = true;
    } catch { /* остаётся FALLBACK */ }
  }

  const visible = () => repos
    .filter((r) => !HIDDEN.has(r.name))
    .sort((a, b) => (b.stars - a.stars) || (new Date(b.pushed) - new Date(a.pushed)));
  const own = () => visible().filter((r) => !r.fork);

  // ---------- reveal highlight ----------
  document.addEventListener("pointermove", (e) => {
    const zone = e.target.closest?.(".reveal-zone, .navpane");
    if (!zone) return;
    zone.querySelectorAll(".reveal, .reveal-border").forEach((el) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
  }, { passive: true });

  // ---------- nav pane ----------
  const pane = $("#navpane"), scrim = $("#scrim"), ham = $("#hamburger");
  function setPane(open) {
    pane.classList.toggle("open", open);
    scrim.classList.toggle("show", open);
    ham.setAttribute("aria-expanded", open);
  }
  ham.addEventListener("click", () => setPane(!pane.classList.contains("open")));
  scrim.addEventListener("click", () => setPane(false));
  pane.addEventListener("click", (e) => {
    if (e.target.closest("a.nav-item") && innerWidth <= 640) setPane(false);
  });

  // ---------- title bar ----------
  const backBtn = $("#backBtn");
  let depth = 0;
  backBtn.addEventListener("click", () => history.back());
  $("#fullBtn").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  });

  // ---------- live tiles ----------
  let flipTimer = null, clockTimer = null;
  function startLiveTiles() {
    clearInterval(flipTimer);
    if (!settings.live || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    flipTimer = setInterval(() => {
      const tiles = [...document.querySelectorAll(".tile[data-flip]")];
      if (!tiles.length) return;
      const t = tiles[Math.floor(Math.random() * tiles.length)];
      t.classList.toggle("flipped");
    }, 2200);
  }
  function tickClock() {
    const now = new Date();
    document.querySelectorAll(".tile.clock").forEach((t) => {
      $(".time", t).textContent = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      $(".date", t).textContent = now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
    });
  }

  function tileHTML(r, size, i) {
    const desc = r.description || "Без описания";
    const back = size === "small" ? "" : `
      <div class="face back">
        <div class="tdesc">${esc(desc)}</div>
        <div class="tmeta">${r.language ? `<span>${esc(r.language)}</span>` : ""}<span>★ ${r.stars}</span><span>${ago(r.pushed)}</span></div>
      </div>`;
    return `
      <a class="tile ${size}" href="#/project/${encodeURIComponent(r.name)}" style="--i:${i}" ${size !== "small" ? "data-flip" : ""} title="${esc(r.name)}">
        <div class="tile-faces">
          <div class="face front">
            ${r.stars ? `<span class="badge">★ ${r.stars}</span>` : ""}
            <div class="glyph">${esc(glyph(r))}</div>
            <div class="tname">${esc(r.name)}</div>
          </div>
          ${back}
        </div>
      </a>`;
  }

  // ---------- pages ----------
  const content = $("#content");
  const progress = '<div class="progress" aria-label="Загрузка"><i></i><i></i><i></i><i></i><i></i></div>';

  function pageHome() {
    const list = own();
    const pattern = ["wide", "medium", "medium", "wide", "medium", "small", "small", "medium", "small", "small", "wide", "medium", "medium", "small", "small", "small", "small", "medium"];
    let i = 0;
    const tiles = list.map((r) => tileHTML(r, pattern[i % pattern.length], i++)).join("");
    const forks = visible().filter((r) => r.fork);
    return `
      <section class="page">
        <div class="hero">
          <img src="https://github.com/${USER}.png?size=176" alt="" onerror="this.style.visibility='hidden'">
          <div>
            <h1 class="page-title">Привет, я ${USER}</h1>
            <p>Моды для Source Engine, движки на Rust, UI-библиотеки и всякие полезные утилиты.</p>
          </div>
        </div>

        <h2 class="group-title">Начало <small>${list.length} проектов</small></h2>
        <div class="tiles">
          <a class="tile wide clock" href="#/about" style="--i:0" aria-label="Обо мне">
            <div class="tile-faces"><div class="face front"><div class="time"></div><div class="date"></div></div></div>
          </a>
          <a class="tile medium profile" href="https://github.com/${USER}" target="_blank" rel="noopener" style="--i:1">
            <img src="https://github.com/${USER}.png?size=220" alt="" onerror="this.remove()">
            <div class="face front"><div class="tname">GitHub</div></div>
          </a>
          <a class="tile medium" href="#/projects" style="--i:2">
            <div class="tile-faces"><div class="face front"><div class="glyph">${list.length}</div><div class="tname">Все проекты</div></div></div>
          </a>
          ${tiles}
        </div>

        ${forks.length ? `
        <h2 class="group-title">Форки <small>${forks.length}</small></h2>
        <div class="tiles">${forks.map((r, j) => tileHTML(r, "medium", j)).join("")}</div>` : ""}
      </section>`;
  }

  let filter = store.get("filter", "Все");
  let query = "";

  function listItem(r, i) {
    return `
      <a class="list-item reveal-border reveal" href="#/project/${encodeURIComponent(r.name)}" style="--i:${i}">
        <div class="li-icon">${esc(glyph(r))}</div>
        <div class="li-main">
          <div class="li-name">${esc(r.name)} ${r.fork ? '<span class="chip">форк</span>' : ""}</div>
          <div class="li-desc">${esc(r.description || "Без описания")}</div>
        </div>
        <div class="li-meta">
          <span>${esc(r.language || "—")}${r.stars ? ` · ★ ${r.stars}` : ""}</span>
          <span>${ago(r.pushed)}</span>
        </div>
      </a>`;
  }

  function filtered() {
    let l = visible();
    if (filter === "Форки") l = l.filter((r) => r.fork);
    else if (filter !== "Все") l = l.filter((r) => r.language === filter && !r.fork);
    if (query) {
      const q = query.toLowerCase();
      l = l.filter((r) => (r.name + " " + (r.description || "") + " " + (r.topics || []).join(" ")).toLowerCase().includes(q));
    }
    return l;
  }

  function pageProjects() {
    const langs = {};
    own().forEach((r) => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
    const tabs = ["Все", ...Object.keys(langs).sort((a, b) => langs[b] - langs[a]), ...(visible().some((r) => r.fork) ? ["Форки"] : [])];
    if (!tabs.includes(filter)) filter = "Все";
    return `
      <section class="page">
        <h1 class="page-title">Проекты</h1>
        <p class="page-sub">${live ? "Данные загружены с GitHub." : "Показан сохранённый список — GitHub API сейчас недоступен."}</p>
        <div class="pivot" role="tablist">
          ${tabs.map((t) => `<button role="tab" class="${t === filter ? "active" : ""}" data-tab="${esc(t)}">${esc(t)}</button>`).join("")}
        </div>
        <label class="searchbox">
          <input type="search" id="search" placeholder="Поиск" value="${esc(query)}" aria-label="Поиск по проектам">
          ${ICON.search}
        </label>
        <div class="list reveal-zone" id="list"></div>
      </section>`;
  }
  function renderList() {
    const l = filtered();
    $("#list").innerHTML = l.length ? l.map(listItem).join("") : '<div class="empty">Ничего не найдено.</div>';
  }
  function bindProjects() {
    renderList();
    content.querySelectorAll(".pivot button").forEach((b) => b.addEventListener("click", () => {
      filter = b.dataset.tab; store.set("filter", filter);
      content.querySelectorAll(".pivot button").forEach((x) => x.classList.toggle("active", x === b));
      renderList();
    }));
    $("#search").addEventListener("input", (e) => { query = e.target.value.trim(); renderList(); });
  }

  function pageProject(name) {
    const r = repos.find((x) => x.name === name);
    if (!r) return `<section class="page"><h1 class="page-title">Не найдено</h1><p class="page-sub">Проекта «${esc(name)}» нет.</p><a class="btn accent" href="#/projects">К проектам</a></section>`;
    const url = `https://github.com/${USER}/${encodeURIComponent(r.name)}`;
    return `
      <section class="page">
        <div class="detail-head">
          <div class="li-icon">${esc(glyph(r))}</div>
          <div style="min-width:0">
            <h1 class="page-title">${esc(r.name)}</h1>
            <p class="page-sub" style="margin:0">${esc(r.description || "Без описания")}</p>
          </div>
        </div>
        <div class="actions">
          <a class="btn accent" href="${url}" target="_blank" rel="noopener">Открыть на GitHub ${ICON.ext}</a>
          ${r.homepage ? `<a class="btn" href="${esc(r.homepage)}" target="_blank" rel="noopener">Сайт ${ICON.ext}</a>` : ""}
          <a class="btn" href="${url}/archive/HEAD.zip">Скачать ZIP</a>
        </div>
        ${(r.topics || []).length ? `<div class="topics">${r.topics.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : ""}
        <div class="facts">
          <div class="fact"><span>Язык</span><b>${esc(r.language || "—")}</b></div>
          <div class="fact"><span>Звёзды</span><b>${r.stars}</b></div>
          <div class="fact"><span>Форки</span><b>${r.forks}</b></div>
          <div class="fact"><span>Обновлён</span><b>${fmtDate(r.pushed)}</b></div>
          ${r.license ? `<div class="fact"><span>Лицензия</span><b>${esc(r.license)}</b></div>` : ""}
          ${r.fork ? `<div class="fact"><span>Тип</span><b>Форк</b></div>` : ""}
        </div>
        <h2 class="group-title">README</h2>
        <div class="card"><div class="readme" id="readme">${progress}</div></div>
      </section>`;
  }
  async function bindProject(name) {
    const el = $("#readme");
    if (!el) return;
    let html = readmeCache.get(name);
    if (html === undefined) {
      try {
        const res = await fetch(`https://api.github.com/repos/${USER}/${encodeURIComponent(name)}/readme`, {
          headers: { Accept: "application/vnd.github.html+json" },
        });
        html = res.ok ? await res.text() : null;
      } catch { html = null; }
      readmeCache.set(name, html);
    }
    if (!document.body.contains(el)) return;
    if (!html) {
      el.innerHTML = `<p style="color:var(--fg-3)">README не найден или GitHub сейчас недоступен. <a href="https://github.com/${USER}/${encodeURIComponent(name)}" target="_blank" rel="noopener">Открыть репозиторий</a>.</p>`;
      return;
    }
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script, style, iframe, object, embed, form").forEach((n) => n.remove());
    doc.querySelectorAll("*").forEach((n) => [...n.attributes].forEach((a) => { if (/^on/i.test(a.name)) n.removeAttribute(a.name); }));
    const base = `https://github.com/${USER}/${encodeURIComponent(name)}/`;
    const raw = `https://raw.githubusercontent.com/${USER}/${encodeURIComponent(name)}/HEAD/`;
    doc.querySelectorAll("a[href]").forEach((a) => {
      const h = a.getAttribute("href");
      if (/^javascript:/i.test(h)) { a.removeAttribute("href"); return; }
      if (h.startsWith("#")) { a.removeAttribute("href"); return; }
      if (!/^[a-z]+:/i.test(h)) a.href = new URL(h, base + "blob/HEAD/").href;
      a.target = "_blank"; a.rel = "noopener";
    });
    doc.querySelectorAll("img[src]").forEach((img) => {
      const s = img.getAttribute("src");
      if (!/^[a-z]+:/i.test(s)) img.src = new URL(s, raw).href;
      img.loading = "lazy";
    });
    el.innerHTML = doc.body.innerHTML;
  }

  function pageAbout() {
    const all = own();
    const langs = {};
    all.forEach((r) => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
    const stars = visible().reduce((s, r) => s + (r.stars || 0), 0);
    return `
      <section class="page">
        <div class="hero">
          <img src="https://github.com/${USER}.png?size=176" alt="" onerror="this.style.visibility='hidden'">
          <div>
            <h1 class="page-title">${USER}</h1>
            <p>Разработчик: Source Engine, Rust, моды и speedrun-инструменты.</p>
          </div>
        </div>
        <div class="facts" style="margin-top:24px">
          <div class="fact"><span>Своих проектов</span><b>${all.length}</b></div>
          <div class="fact"><span>Форков</span><b>${visible().length - all.length}</b></div>
          <div class="fact"><span>Звёзд</span><b>${stars}</b></div>
          <div class="fact"><span>Языков</span><b>${Object.keys(langs).length}</b></div>
        </div>
        <h2 class="group-title">Языки</h2>
        <div class="topics">${Object.entries(langs).sort((a, b) => b[1] - a[1]).map(([l, n]) => `<span class="chip">${esc(l)} · ${n}</span>`).join("")}</div>
        <h2 class="group-title">Ссылки</h2>
        <div class="about-links reveal-zone">
          <a class="list-item reveal-border reveal" href="https://github.com/${USER}" target="_blank" rel="noopener">
            <div class="li-icon">GH</div>
            <div class="li-main"><div class="li-name">GitHub</div><div class="li-desc">github.com/${USER}</div></div>
          </a>
        </div>
      </section>`;
  }

  function pageSettings() {
    return `
      <section class="page">
        <h1 class="page-title">Параметры</h1>
        <p class="page-sub">Персонализация — как в Windows 10.</p>
        <div class="setting">
          <h3>Режим приложения</h3>
          ${[["dark", "Тёмный"], ["light", "Светлый"], ["system", "Как в системе"]].map(([v, l]) => `
            <label class="radio"><input type="radio" name="theme" value="${v}" ${settings.theme === v ? "checked" : ""}> ${l}</label>`).join("")}
        </div>
        <div class="setting">
          <h3>Цвет элементов</h3>
          <div class="swatches">
            ${ACCENTS.map((c) => `<button class="swatch ${c === settings.accent ? "active" : ""}" style="background:${c}" data-c="${c}" aria-label="Цвет ${c}"></button>`).join("")}
          </div>
        </div>
        <div class="setting">
          <h3>Живые плитки</h3>
          <label class="toggle"><input type="checkbox" id="liveT" ${settings.live ? "checked" : ""}> <span>${settings.live ? "Вкл." : "Откл."}</span></label>
        </div>
      </section>`;
  }
  function bindSettings() {
    content.querySelectorAll("input[name=theme]").forEach((i) => i.addEventListener("change", () => {
      settings.theme = i.value; store.set("theme", i.value); applyTheme();
    }));
    content.querySelectorAll(".swatch").forEach((b) => b.addEventListener("click", () => {
      settings.accent = b.dataset.c; store.set("accent", settings.accent); applyTheme();
      content.querySelectorAll(".swatch").forEach((x) => x.classList.toggle("active", x === b));
    }));
    const t = $("#liveT");
    t.addEventListener("change", () => {
      settings.live = t.checked; store.set("live", t.checked);
      t.nextElementSibling.textContent = t.checked ? "Вкл." : "Откл.";
      startLiveTiles();
    });
  }

  // ---------- router ----------
  const TITLES = { home: "Главная", projects: "Проекты", about: "Обо мне", settings: "Параметры" };
  function route() {
    const [, page = "home", arg] = (location.hash || "#/home").split("/");
    const name = arg ? decodeURIComponent(arg) : "";
    clearInterval(clockTimer);

    let html;
    switch (page) {
      case "projects": html = pageProjects(); break;
      case "project": html = pageProject(name); break;
      case "about": html = pageAbout(); break;
      case "settings": html = pageSettings(); break;
      default: html = pageHome();
    }
    content.innerHTML = html;
    content.scrollTop = 0;

    if (page === "projects") bindProjects();
    if (page === "project") bindProject(name);
    if (page === "settings") bindSettings();
    if (content.querySelector(".tile.clock")) { tickClock(); clockTimer = setInterval(tickClock, 1000); }

    const active = page === "project" ? "projects" : (TITLES[page] ? page : "home");
    document.querySelectorAll(".nav-item[data-route]").forEach((a) => a.classList.toggle("active", a.dataset.route === active));
    const sub = page === "project" ? name : TITLES[active];
    $("#tbTitle").textContent = `${USER} — ${sub}`;
    document.title = `${sub} · ${USER}`;
    backBtn.disabled = depth <= 0;
  }

  // Стек посещённых страниц для кнопки «Назад» в заголовке
  const stack = [location.hash || "#/home"];
  window.addEventListener("hashchange", () => {
    const h = location.hash || "#/home";
    if (stack.length > 1 && stack[stack.length - 2] === h) stack.pop();
    else stack.push(h);
    depth = stack.length - 1;
    route();
  });

  route();
  startLiveTiles();
  loadRepos().then(() => { if (live) route(); });
})();
