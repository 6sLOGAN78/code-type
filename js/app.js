/**
 * codeType - Main Multi-Language Application Controller
 * Handles UI views, keyboard routing, language switching (C++, Python, Go, CUDA, Rust),
 * theme management, modals, result dashboard rendering, and history views.
 */

class CodeTypeApp {
  constructor() {
    this.storage = storage;
    this.sound = soundManager;
    this.engine = null;
    this.chart = null;

    // Active state
    this.currentLanguage = this.storage.settings.language || "cpp";
    this.currentMode = this.storage.settings.mode || "snippet";
    this.currentCategory = this.storage.settings.category || "all";
    this.currentTimeLimit = this.storage.settings.timeLimit || 30;
    this.currentLineLimit = this.storage.settings.lineLimit || 10;
    this.currentSnippet = null;
    this.lastResult = null;

    this._init();
  }

  _init() {
    // 1. Apply saved theme & settings
    this.applyTheme(this.storage.settings.theme);
    this.applyFontSettings();
    this.sound.setSoundType(this.storage.settings.soundType);
    this.sound.setVolume(this.storage.settings.soundVolume);

    // 2. Initialize Chart & Engine
    const langConfig = getLanguageConfig(this.currentLanguage);
    this.chart = new MonkeyChart("result-chart");
    this.engine = new TypingEngine({
      autoIndent: this.storage.settings.autoIndent,
      indentSpaces: langConfig.defaultIndent || 2,
      smoothLineScroll: this.storage.settings.smoothLineScroll,
      onStart: () => this.onTestStart(),
      onFinish: (res) => this.onTestFinish(res),
      onTick: (sec, stats) => this.onTestTick(sec, stats)
    });

    // 3. Setup DOM & Event Listeners
    this._bindEvents();
    this._initSettingsUI();
    this.renderCategorySubBar();
    this._updateLanguageUI();
    this._updateModePills();

    // 4. Load initial snippet and focus
    this.startNewTest();
  }

  applyTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
    this.storage.saveSettings({ theme: themeName });
    
    const themeSelect = document.getElementById("setting-theme");
    if (themeSelect) themeSelect.value = themeName;

    if (this.chart && this.lastResult) {
      this.chart.render(this.lastResult, false);
    }
  }

  applyFontSettings() {
    const root = document.documentElement;
    root.style.setProperty("--font-family", `'${this.storage.settings.fontFamily}', monospace`);
    root.style.setProperty("--font-size", `${this.storage.settings.fontSize}px`);

    const caretEl = document.getElementById("caret");
    if (caretEl) {
      caretEl.className = "caret " + (this.storage.settings.caretStyle || "caret-smooth");
    }
  }

  _bindEvents() {
    const hiddenInput = document.getElementById("hidden-input");
    const typingWrapper = document.getElementById("typing-wrapper");

    // Click anywhere on typing box to focus
    typingWrapper?.addEventListener("click", () => {
      hiddenInput?.focus();
      this._hideFocusWarning();
    });

    // Hidden input key events
    hiddenInput?.addEventListener("keydown", (e) => {
      this._handleGlobalKeyDown(e);
    });

    hiddenInput?.addEventListener("blur", () => {
      if (this.engine.state === "running") {
        this._showFocusWarning();
      }
    });

    hiddenInput?.addEventListener("focus", () => {
      this._hideFocusWarning();
    });

    // Document level shortcuts
    document.addEventListener("keydown", (e) => {
      const isModalOpen = document.querySelector(".modal.active");
      if (isModalOpen) {
        if (e.key === "Escape") this.closeModals();
        return;
      }

      const resultView = document.getElementById("result-view");
      const isResultActive = resultView && resultView.classList.contains("active");

      if (isResultActive) {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          this.startNewTest();
          return;
        }
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          this.repeatCurrentTest();
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          this.startNewTest();
          return;
        }
      }

      const qr = this.storage.settings.quickRestart;
      if ((qr === "tab" && e.key === "Tab") || (qr === "esc" && e.key === "Escape")) {
        e.preventDefault();
        this.startNewTest();
        return;
      }
    });

    // Navigation Buttons
    document.getElementById("nav-test")?.addEventListener("click", () => this.showView("test-view"));
    document.getElementById("nav-history")?.addEventListener("click", () => this.showView("history-view"));
    document.getElementById("nav-custom")?.addEventListener("click", () => this.openCustomModal());
    document.getElementById("nav-settings")?.addEventListener("click", () => this.openSettingsModal());
    document.getElementById("nav-restart")?.addEventListener("click", () => this.startNewTest());

    // Result Action Buttons
    document.getElementById("btn-next-test")?.addEventListener("click", () => this.startNewTest());
    document.getElementById("btn-repeat-test")?.addEventListener("click", () => this.repeatCurrentTest());
    document.getElementById("btn-copy-result")?.addEventListener("click", () => this.copyResultSummary());
    document.getElementById("btn-view-history")?.addEventListener("click", () => this.showView("history-view"));

    // Language Pill Selection Handlers
    document.querySelectorAll(".lang-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const lang = pill.dataset.lang;
        this.setLanguage(lang);
      });
    });

    // Mode Selector Click Handlers
    document.querySelectorAll(".mode-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const mode = pill.dataset.mode;
        this.setMode(mode);
      });
    });

    // Sub-mode pill selectors (Time limits, Line limits)
    document.querySelectorAll(".sub-pill[data-type='time'], .sub-pill[data-type='lines']").forEach(pill => {
      pill.addEventListener("click", () => {
        const type = pill.dataset.type;
        const val = pill.dataset.val;
        if (type === "time") this.setTimeLimit(parseInt(val, 10));
        if (type === "lines") this.setLineLimit(parseInt(val, 10));
      });
    });

    // Focus warning click to refocus
    document.getElementById("focus-warning")?.addEventListener("click", () => {
      hiddenInput?.focus();
      this._hideFocusWarning();
    });
  }

  _handleGlobalKeyDown(e) {
    const testView = document.getElementById("test-view");
    if (!testView.classList.contains("active")) return;

    if (e.key === "Tab") {
      e.preventDefault();
      this.engine.handleInput("Tab", e);
      return;
    }

    if (e.key === "Backspace" || e.key === "Enter" || e.key.length === 1) {
      this.engine.handleInput(e.key, e);
    }
  }

  _showFocusWarning() {
    const el = document.getElementById("focus-warning");
    if (el) el.classList.add("active");
  }

  _hideFocusWarning() {
    const el = document.getElementById("focus-warning");
    if (el) el.classList.remove("active");
  }

  showView(viewId) {
    document.querySelectorAll(".app-view").forEach(v => v.classList.remove("active"));
    const target = document.getElementById(viewId);
    if (target) target.classList.add("active");

    if (viewId === "test-view") {
      document.getElementById("hidden-input")?.focus();
    } else if (viewId === "history-view") {
      this.renderHistoryView();
    }
  }

  setLanguage(lang) {
    if (!LANGUAGES_CONFIG[lang]) return;
    this.currentLanguage = lang;
    this.currentCategory = "all";
    this.storage.saveSettings({ language: lang, category: "all" });

    // Update indentation for language
    const cfg = getLanguageConfig(lang);
    if (this.engine) {
      this.engine.options.indentSpaces = cfg.defaultIndent || 2;
    }

    this._updateLanguageUI();
    this.renderCategorySubBar();
    this.startNewTest();
  }

  _updateLanguageUI() {
    const cfg = getLanguageConfig(this.currentLanguage);

    // Update active pill in language bar
    document.querySelectorAll(".lang-pill").forEach(p => {
      p.classList.toggle("active", p.dataset.lang === this.currentLanguage);
    });

    // Update Logo Area & Subtitle
    const logoTextEl = document.querySelector(".logo-text");
    const logoSubEl = document.querySelector(".logo-sub");
    const footerSubEl = document.querySelector(".footer-right .text-sub");

    if (logoTextEl) {
      logoTextEl.innerHTML = `${cfg.logoPrefix}<span class="highlight">type</span>`;
    }
    if (logoSubEl) {
      logoSubEl.textContent = cfg.versionBadge;
    }
    if (footerSubEl) {
      footerSubEl.textContent = `${cfg.name} • Speed Coding Test`;
    }

    // Update document title
    document.title = `${cfg.name}Type - Minimalist ${cfg.name} Typing Speed Test`;
  }

  renderCategorySubBar() {
    const subBar = document.getElementById("sub-bar-snippet");
    if (!subBar) return;
    subBar.innerHTML = "";

    const categories = getCategoriesForLanguage(this.currentLanguage);

    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = `sub-pill ${cat.id === this.currentCategory ? "active" : ""}`;
      btn.dataset.type = "category";
      btn.dataset.val = cat.id;
      btn.textContent = cat.label;

      btn.addEventListener("click", () => {
        this.setCategory(cat.id);
      });

      subBar.appendChild(btn);
    });
  }

  setMode(mode) {
    this.currentMode = mode;
    this.storage.saveSettings({ mode });
    this._updateModePills();
    this.startNewTest();
  }

  setCategory(category) {
    this.currentCategory = category;
    this.storage.saveSettings({ category });
    this._updateModePills();
    this.startNewTest();
  }

  setTimeLimit(sec) {
    this.currentTimeLimit = sec;
    this.storage.saveSettings({ timeLimit: sec });
    this._updateModePills();
    this.startNewTest();
  }

  setLineLimit(lines) {
    this.currentLineLimit = lines;
    this.storage.saveSettings({ lineLimit: lines });
    this._updateModePills();
    this.startNewTest();
  }

  _updateModePills() {
    document.querySelectorAll(".mode-pill").forEach(p => {
      p.classList.toggle("active", p.dataset.mode === this.currentMode);
    });

    document.querySelectorAll(".sub-bar").forEach(bar => {
      bar.classList.remove("active");
    });

    const activeSubBar = document.getElementById(`sub-bar-${this.currentMode}`);
    if (activeSubBar) activeSubBar.classList.add("active");

    // Update category sub-pills
    document.querySelectorAll("#sub-bar-snippet .sub-pill").forEach(p => {
      p.classList.toggle("active", p.dataset.val === this.currentCategory);
    });

    // Update time and lines sub-pills
    document.querySelectorAll(".sub-pill[data-type='time']").forEach(p => {
      p.classList.toggle("active", parseInt(p.dataset.val, 10) === this.currentTimeLimit);
    });
    document.querySelectorAll(".sub-pill[data-type='lines']").forEach(p => {
      p.classList.toggle("active", parseInt(p.dataset.val, 10) === this.currentLineLimit);
    });
  }

  startNewTest() {
    this.showView("test-view");
    this._hideFocusWarning();
    document.body.classList.remove("zen-mode");

    const langCfg = getLanguageConfig(this.currentLanguage);

    if (this.currentMode === "custom") {
      const customList = this.storage.getCustomSnippets(this.currentLanguage);
      if (customList.length > 0) {
        this.currentSnippet = customList[0];
      } else {
        this.currentSnippet = getRandomSnippet(this.currentCategory, this.currentLanguage);
      }
    } else {
      this.currentSnippet = getRandomSnippet(this.currentCategory, this.currentLanguage);
    }

    const titleEl = document.getElementById("snippet-title");
    const metaEl = document.getElementById("snippet-category");
    if (titleEl) titleEl.textContent = this.currentSnippet.title;
    if (metaEl) {
      metaEl.textContent = `${langCfg.name.toUpperCase()} • ${this.currentSnippet.category.toUpperCase()} • ${this.currentSnippet.difficulty.toUpperCase()}`;
    }

    const limit = this.currentMode === "time" ? this.currentTimeLimit : 
                  this.currentMode === "lines" ? this.currentLineLimit : 0;
    
    this.engine.loadSnippet(this.currentSnippet, this.currentMode, limit, this.currentLanguage);

    setTimeout(() => {
      document.getElementById("hidden-input")?.focus();
    }, 50);
  }

  repeatCurrentTest() {
    this.showView("test-view");
    this._hideFocusWarning();
    document.body.classList.remove("zen-mode");

    const limit = this.currentMode === "time" ? this.currentTimeLimit : 
                  this.currentMode === "lines" ? this.currentLineLimit : 0;
    
    this.engine.loadSnippet(this.currentSnippet, this.currentMode, limit, this.currentLanguage);

    setTimeout(() => {
      document.getElementById("hidden-input")?.focus();
    }, 50);
  }

  onTestStart() {
    document.body.classList.add("zen-mode");
  }

  onTestTick(second, stats) {
    // Live stats update automatically
  }

  onTestFinish(result) {
    document.body.classList.remove("zen-mode");
    result.language = this.currentLanguage;
    this.lastResult = result;

    this.storage.saveResult(result);
    this.renderResultDashboard(result);
    this.showView("result-view");
  }

  renderResultDashboard(res) {
    const langCfg = getLanguageConfig(res.language || this.currentLanguage);

    document.getElementById("res-wpm").textContent = res.wpm;
    document.getElementById("res-accuracy").textContent = `${res.accuracy}%`;

    document.getElementById("res-raw-wpm").textContent = res.rawWpm;
    document.getElementById("res-consistency").textContent = `${res.consistency}%`;
    document.getElementById("res-time").textContent = `${res.duration}s`;
    
    const chars = res.characters || {};
    document.getElementById("res-chars").textContent = `${chars.correct || 0} / ${chars.incorrect || 0} / 0 / 0`;

    document.getElementById("res-snippet-name").textContent = res.snippetTitle;
    document.getElementById("res-mode-info").textContent = `${langCfg.name} • ${res.mode} • ${res.category}`;

    // Update Syntax Precision title
    const syntaxTitleEl = document.querySelector(".missed-symbols-section .title");
    if (syntaxTitleEl) {
      syntaxTitleEl.textContent = `${langCfg.syntaxLabel || "Syntax Precision"}:`;
    }

    const missedContainer = document.getElementById("res-missed-symbols");
    if (missedContainer) {
      missedContainer.innerHTML = "";
      const missedMap = chars.missedMap || {};
      const entries = Object.entries(missedMap).sort((a, b) => b[1] - a[1]);

      if (entries.length === 0) {
        missedContainer.innerHTML = `<span class="clean-run-badge">✨ 100% Flawless ${langCfg.name} Syntax Accuracy!</span>`;
      } else {
        entries.slice(0, 6).forEach(([char, count]) => {
          const badge = document.createElement("span");
          badge.className = "missed-badge";
          badge.innerHTML = `<code class="symbol">${char}</code> <span class="count">${count}x</span>`;
          missedContainer.appendChild(badge);
        });
      }
    }

    setTimeout(() => {
      this.chart.render(res, true);
    }, 100);
  }

  copyResultSummary() {
    if (!this.lastResult) return;
    const r = this.lastResult;
    const langCfg = getLanguageConfig(r.language || this.currentLanguage);

    const text = `${langCfg.name} Typing Result:
⚡ WPM: ${r.wpm} (Raw: ${r.rawWpm})
🎯 Accuracy: ${r.accuracy}%
📊 Consistency: ${r.consistency}%
⏱️ Time: ${r.duration}s
💻 Snippet: ${r.snippetTitle} (${langCfg.name} • ${r.category})
Try Speed Coding at codeType!`;

    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById("btn-copy-result");
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = `<span>Copied!</span>`;
        setTimeout(() => btn.innerHTML = orig, 1800);
      }
    });
  }

  renderHistoryView() {
    const stats = this.storage.getLifetimeStats();
    const history = this.storage.getHistory();

    document.getElementById("stat-total-tests").textContent = stats.totalTests;
    document.getElementById("stat-best-wpm").textContent = stats.bestWpm;
    document.getElementById("stat-avg-wpm").textContent = stats.avgWpm;
    document.getElementById("stat-avg-acc").textContent = `${stats.avgAccuracy}%`;
    
    const minutes = Math.floor(stats.totalTimeSeconds / 60);
    const seconds = stats.totalTimeSeconds % 60;
    document.getElementById("stat-total-time").textContent = `${minutes}m ${seconds}s`;
    document.getElementById("stat-total-chars").textContent = (stats.totalCharacters || 0).toLocaleString();

    const tableBody = document.getElementById("history-table-body");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (history.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No tests recorded yet. Complete a test to see your history!</td></tr>`;
      return;
    }

    history.slice(0, 50).forEach((item) => {
      const tr = document.createElement("tr");
      const date = new Date(item.timestamp);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const langCfg = getLanguageConfig(item.language || "cpp");

      tr.innerHTML = `
        <td class="col-date">${formattedDate}</td>
        <td class="col-snippet">
          <span class="tag-lang tag-${item.language || 'cpp'}">${langCfg.name}</span>
          <strong>${item.snippetTitle || "Snippet"}</strong> 
          <span class="tag">${item.category}</span>
        </td>
        <td class="col-wpm font-bold text-main">${item.wpm}</td>
        <td class="col-raw text-sub">${item.rawWpm}</td>
        <td class="col-acc">${item.accuracy}%</td>
        <td class="col-cons text-sub">${item.consistency || 0}%</td>
        <td class="col-actions">
          <button class="btn-icon-sm" data-id="${item.id}" title="Delete Test">✕</button>
        </td>
      `;

      tr.querySelector("button")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.storage.deleteHistoryItem(item.id);
        this.renderHistoryView();
      });

      tableBody.appendChild(tr);
    });

    document.getElementById("btn-clear-history")?.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all typing history? This cannot be undone.")) {
        this.storage.clearAllHistory();
        this.renderHistoryView();
      }
    });

    document.getElementById("btn-export-data")?.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(this.storage.exportData());
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `codetype_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  _initSettingsUI() {
    const s = this.storage.settings;

    // Default Language
    const langSelect = document.getElementById("setting-default-lang");
    if (langSelect) {
      langSelect.value = s.language || "cpp";
      langSelect.addEventListener("change", (e) => {
        this.setLanguage(e.target.value);
      });
    }

    // Theme selector
    const themeSelect = document.getElementById("setting-theme");
    if (themeSelect) {
      themeSelect.value = s.theme;
      themeSelect.addEventListener("change", (e) => this.applyTheme(e.target.value));
    }

    // Font selector
    const fontSelect = document.getElementById("setting-font");
    if (fontSelect) {
      fontSelect.value = s.fontFamily;
      fontSelect.addEventListener("change", (e) => {
        this.storage.saveSettings({ fontFamily: e.target.value });
        this.applyFontSettings();
      });
    }

    // Font size slider
    const fontSizeSlider = document.getElementById("setting-font-size");
    const fontSizeVal = document.getElementById("setting-font-size-val");
    if (fontSizeSlider) {
      fontSizeSlider.value = s.fontSize;
      if (fontSizeVal) fontSizeVal.textContent = `${s.fontSize}px`;
      fontSizeSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        if (fontSizeVal) fontSizeVal.textContent = `${val}px`;
        this.storage.saveSettings({ fontSize: val });
        this.applyFontSettings();
      });
    }

    // Sound Switch type
    const soundSelect = document.getElementById("setting-sound-type");
    if (soundSelect) {
      soundSelect.value = s.soundType;
      soundSelect.addEventListener("change", (e) => {
        this.storage.saveSettings({ soundType: e.target.value });
        this.sound.setSoundType(e.target.value);
        this.sound.playKey();
      });
    }

    // Sound Volume
    const soundVolSlider = document.getElementById("setting-sound-vol");
    if (soundVolSlider) {
      soundVolSlider.value = Math.round(s.soundVolume * 100);
      soundVolSlider.addEventListener("input", (e) => {
        const vol = parseFloat(e.target.value) / 100;
        this.storage.saveSettings({ soundVolume: vol });
        this.sound.setVolume(vol);
      });
    }

    // Caret Style
    const caretSelect = document.getElementById("setting-caret-style");
    if (caretSelect) {
      caretSelect.value = s.caretStyle;
      caretSelect.addEventListener("change", (e) => {
        this.storage.saveSettings({ caretStyle: e.target.value });
        this.applyFontSettings();
      });
    }

    // Auto Indent checkbox
    const autoIndentCheck = document.getElementById("setting-auto-indent");
    if (autoIndentCheck) {
      autoIndentCheck.checked = s.autoIndent;
      autoIndentCheck.addEventListener("change", (e) => {
        this.storage.saveSettings({ autoIndent: e.target.checked });
        this.engine.options.autoIndent = e.target.checked;
      });
    }

    // Modal Close Buttons
    document.querySelectorAll(".modal-close-btn, .modal-backdrop").forEach(btn => {
      btn.addEventListener("click", () => this.closeModals());
    });
  }

  openSettingsModal() {
    this.closeModals();
    document.getElementById("modal-settings")?.classList.add("active");
  }

  openCustomModal() {
    this.closeModals();
    document.getElementById("modal-custom")?.classList.add("active");

    const langSelect = document.getElementById("custom-snippet-lang");
    if (langSelect) langSelect.value = this.currentLanguage;

    this._renderCustomSnippetsList();

    const saveBtn = document.getElementById("btn-save-custom-snippet");
    if (saveBtn) {
      saveBtn.onclick = () => {
        const lang = document.getElementById("custom-snippet-lang")?.value || this.currentLanguage;
        const title = document.getElementById("custom-snippet-title").value.trim() || `My ${getLanguageConfig(lang).name} Snippet`;
        const code = document.getElementById("custom-snippet-code").value.trim();
        if (!code) {
          alert("Please paste valid code.");
          return;
        }
        const newSnippet = this.storage.saveCustomSnippet({ title, code, language: lang });
        this.currentSnippet = newSnippet;
        this.currentMode = "custom";
        this.currentLanguage = lang;
        this._updateLanguageUI();
        this.closeModals();
        this.showView("test-view");
        this.engine.loadSnippet(newSnippet, "custom", 0, lang);
      };
    }
  }

  _renderCustomSnippetsList() {
    const listEl = document.getElementById("custom-snippets-list");
    if (!listEl) return;
    
    const items = this.storage.getCustomSnippets();
    listEl.innerHTML = "";
    if (items.length === 0) {
      listEl.innerHTML = `<div class="empty-state-sm">No custom snippets added yet.</div>`;
    } else {
      items.forEach(item => {
        const langCfg = getLanguageConfig(item.language || "cpp");
        const div = document.createElement("div");
        div.className = "custom-snippet-item";
        div.innerHTML = `
          <div class="info">
            <span class="tag-lang tag-${item.language || 'cpp'}">${langCfg.name}</span>
            <span class="name">${item.title}</span>
            <span class="lines">${item.code.split("\n").length} lines</span>
          </div>
          <div class="actions">
            <button class="btn-play-snippet" data-id="${item.id}">Start</button>
            <button class="btn-del-snippet" data-id="${item.id}">✕</button>
          </div>
        `;

        div.querySelector(".btn-play-snippet")?.addEventListener("click", () => {
          this.currentSnippet = item;
          this.currentMode = "custom";
          this.currentLanguage = item.language || "cpp";
          this._updateLanguageUI();
          this.closeModals();
          this.showView("test-view");
          this.engine.loadSnippet(item, "custom", 0, this.currentLanguage);
        });

        div.querySelector(".btn-del-snippet")?.addEventListener("click", () => {
          this.storage.deleteCustomSnippet(item.id);
          this._renderCustomSnippetsList();
        });

        listEl.appendChild(div);
      });
    }
  }

  closeModals() {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
    document.getElementById("hidden-input")?.focus();
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new CodeTypeApp();
});
