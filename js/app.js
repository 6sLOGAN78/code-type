/**
 * cppType - Main Application Controller
 * Handles UI views, keyboard routing, theme management,
 * modals, result dashboard rendering, and history views.
 */

class CppTypeApp {
  constructor() {
    this.storage = storage;
    this.sound = soundManager;
    this.engine = null;
    this.chart = null;

    // Active state
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
    this.chart = new MonkeyChart("result-chart");
    this.engine = new TypingEngine({
      autoIndent: this.storage.settings.autoIndent,
      indentSpaces: this.storage.settings.indentSpaces,
      smoothLineScroll: this.storage.settings.smoothLineScroll,
      onStart: () => this.onTestStart(),
      onFinish: (res) => this.onTestFinish(res),
      onTick: (sec, stats) => this.onTestTick(sec, stats)
    });

    // 3. Setup DOM & Event Listeners
    this._bindEvents();
    this._initSettingsUI();
    this._updateModePills();

    // 4. Load initial snippet and focus
    this.startNewTest();
  }

  applyTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
    this.storage.saveSettings({ theme: themeName });
    
    // Update theme pill/selector if visible
    const themeSelect = document.getElementById("setting-theme");
    if (themeSelect) themeSelect.value = themeName;

    // Redraw chart if on result screen
    if (this.chart && this.lastResult) {
      this.chart.render(this.lastResult, false);
    }
  }

  applyFontSettings() {
    const root = document.documentElement;
    root.style.setProperty("--font-family", `'${this.storage.settings.fontFamily}', monospace`);
    root.style.setProperty("--font-size", `${this.storage.settings.fontSize}px`);

    // Apply Caret Style class
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
      // Allow Esc to close modal
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

    // Mode Selector Click Handlers
    document.querySelectorAll(".mode-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        const mode = pill.dataset.mode;
        this.setMode(mode);
      });
    });

    // Sub-mode pill selectors (Category, Time limits, Line limits)
    document.querySelectorAll(".sub-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        const type = pill.dataset.type;
        const val = pill.dataset.val;

        if (type === "category") this.setCategory(val);
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
    // If typing test is visible, route keys to engine
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
    // Update main mode pills
    document.querySelectorAll(".mode-pill").forEach(p => {
      p.classList.toggle("active", p.dataset.mode === this.currentMode);
    });

    // Toggle sub-bars visibility
    document.querySelectorAll(".sub-bar").forEach(bar => {
      bar.classList.remove("active");
    });

    const activeSubBar = document.getElementById(`sub-bar-${this.currentMode}`);
    if (activeSubBar) activeSubBar.classList.add("active");

    // Update active sub-pills
    document.querySelectorAll(".sub-pill").forEach(p => {
      const type = p.dataset.type;
      const val = p.dataset.val;

      if (type === "category") p.classList.toggle("active", val === this.currentCategory);
      if (type === "time") p.classList.toggle("active", parseInt(val, 10) === this.currentTimeLimit);
      if (type === "lines") p.classList.toggle("active", parseInt(val, 10) === this.currentLineLimit);
    });
  }

  startNewTest() {
    this.showView("test-view");
    this._hideFocusWarning();
    document.body.classList.remove("zen-mode");

    // Get snippet
    if (this.currentMode === "custom") {
      const customList = this.storage.getCustomSnippets();
      if (customList.length > 0) {
        this.currentSnippet = customList[0];
      } else {
        this.currentSnippet = getRandomSnippet(this.currentCategory);
      }
    } else {
      this.currentSnippet = getRandomSnippet(this.currentCategory);
    }

    // Set snippet metadata badges
    const titleEl = document.getElementById("snippet-title");
    const metaEl = document.getElementById("snippet-category");
    if (titleEl) titleEl.textContent = this.currentSnippet.title;
    if (metaEl) metaEl.textContent = `${this.currentSnippet.category.toUpperCase()} • ${this.currentSnippet.difficulty.toUpperCase()}`;

    // Load snippet into engine
    const limit = this.currentMode === "time" ? this.currentTimeLimit : 
                  this.currentMode === "lines" ? this.currentLineLimit : 0;
    
    this.engine.loadSnippet(this.currentSnippet, this.currentMode, limit);

    // Focus input
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
    
    this.engine.loadSnippet(this.currentSnippet, this.currentMode, limit);

    setTimeout(() => {
      document.getElementById("hidden-input")?.focus();
    }, 50);
  }

  onTestStart() {
    document.body.classList.add("zen-mode");
  }

  onTestTick(second, stats) {
    // Engine updates live counters automatically
  }

  onTestFinish(result) {
    document.body.classList.remove("zen-mode");
    this.lastResult = result;

    // Save to persistent storage
    this.storage.saveResult(result);

    // Show result dashboard
    this.renderResultDashboard(result);
    this.showView("result-view");
  }

  renderResultDashboard(res) {
    // Large Headline Numbers
    document.getElementById("res-wpm").textContent = res.wpm;
    document.getElementById("res-accuracy").textContent = `${res.accuracy}%`;

    // Secondary Grid
    document.getElementById("res-raw-wpm").textContent = res.rawWpm;
    document.getElementById("res-consistency").textContent = `${res.consistency}%`;
    document.getElementById("res-time").textContent = `${res.duration}s`;
    
    const chars = res.characters || {};
    document.getElementById("res-chars").textContent = `${chars.correct || 0} / ${chars.incorrect || 0} / 0 / 0`;

    // Snippet Details
    document.getElementById("res-snippet-name").textContent = res.snippetTitle;
    document.getElementById("res-mode-info").textContent = `${res.mode} • ${res.category}`;

    // Render Missed Symbols Badges (C++ Specific!)
    const missedContainer = document.getElementById("res-missed-symbols");
    if (missedContainer) {
      missedContainer.innerHTML = "";
      const missedMap = chars.missedMap || {};
      const entries = Object.entries(missedMap).sort((a, b) => b[1] - a[1]);

      if (entries.length === 0) {
        missedContainer.innerHTML = `<span class="clean-run-badge">✨ 100% Flawless C++ Syntax Accuracy!</span>`;
      } else {
        entries.slice(0, 6).forEach(([char, count]) => {
          const badge = document.createElement("span");
          badge.className = "missed-badge";
          badge.innerHTML = `<code class="symbol">${char}</code> <span class="count">${count}x</span>`;
          missedContainer.appendChild(badge);
        });
      }
    }

    // Render Canvas Chart with animated curves
    setTimeout(() => {
      this.chart.render(res, true);
    }, 100);
  }

  copyResultSummary() {
    if (!this.lastResult) return;
    const r = this.lastResult;
    const text = `cppType Test Result:
⚡ WPM: ${r.wpm} (Raw: ${r.rawWpm})
🎯 Accuracy: ${r.accuracy}%
📊 Consistency: ${r.consistency}%
⏱️ Time: ${r.duration}s
💻 Snippet: ${r.snippetTitle} (${r.category})
Try C++ Typing at cppType!`;

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

    // 1. Fill Lifetime Stat Cards
    document.getElementById("stat-total-tests").textContent = stats.totalTests;
    document.getElementById("stat-best-wpm").textContent = stats.bestWpm;
    document.getElementById("stat-avg-wpm").textContent = stats.avgWpm;
    document.getElementById("stat-avg-acc").textContent = `${stats.avgAccuracy}%`;
    
    const minutes = Math.floor(stats.totalTimeSeconds / 60);
    const seconds = stats.totalTimeSeconds % 60;
    document.getElementById("stat-total-time").textContent = `${minutes}m ${seconds}s`;
    document.getElementById("stat-total-chars").textContent = (stats.totalCharacters || 0).toLocaleString();

    // 2. Render History Table
    const tableBody = document.getElementById("history-table-body");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (history.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">No tests recorded yet. Complete a test to see your history!</td></tr>`;
      return;
    }

    history.slice(0, 50).forEach((item, idx) => {
      const tr = document.createElement("tr");
      const date = new Date(item.timestamp);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      tr.innerHTML = `
        <td class="col-date">${formattedDate}</td>
        <td class="col-snippet"><strong>${item.snippetTitle || "C++ Snippet"}</strong> <span class="tag">${item.category}</span></td>
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

    // Clear History Button
    document.getElementById("btn-clear-history")?.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all typing history? This cannot be undone.")) {
        this.storage.clearAllHistory();
        this.renderHistoryView();
      }
    });

    // Export Data Button
    document.getElementById("btn-export-data")?.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(this.storage.exportData());
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `cpptype_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  // ==========================================
  // MODALS & SETTINGS
  // ==========================================
  _initSettingsUI() {
    const s = this.storage.settings;

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

    // Load custom snippets list
    const listEl = document.getElementById("custom-snippets-list");
    if (listEl) {
      const items = this.storage.getCustomSnippets();
      listEl.innerHTML = "";
      if (items.length === 0) {
        listEl.innerHTML = `<div class="empty-state-sm">No custom snippets added yet.</div>`;
      } else {
        items.forEach(item => {
          const div = document.createElement("div");
          div.className = "custom-snippet-item";
          div.innerHTML = `
            <div class="info">
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
            this.closeModals();
            this.showView("test-view");
            this.engine.loadSnippet(item, "custom", 0);
          });

          div.querySelector(".btn-del-snippet")?.addEventListener("click", () => {
            this.storage.deleteCustomSnippet(item.id);
            this.openCustomModal();
          });

          listEl.appendChild(div);
        });
      }
    }

    // Handle Custom Snippet Save
    const saveBtn = document.getElementById("btn-save-custom-snippet");
    if (saveBtn) {
      saveBtn.onclick = () => {
        const title = document.getElementById("custom-snippet-title").value.trim() || "My C++ Function";
        const code = document.getElementById("custom-snippet-code").value.trim();
        if (!code) {
          alert("Please paste valid C++ code.");
          return;
        }
        const newSnippet = this.storage.saveCustomSnippet({ title, code });
        this.currentSnippet = newSnippet;
        this.currentMode = "custom";
        this.closeModals();
        this.showView("test-view");
        this.engine.loadSnippet(newSnippet, "custom", 0);
      };
    }
  }

  closeModals() {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
    document.getElementById("hidden-input")?.focus();
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new CppTypeApp();
});
