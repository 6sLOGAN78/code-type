/**
 * cppType - Core Multi-Language Typing Engine
 * Handles character-by-character tracking, language-specific syntax tokens,
 * caret positioning, telemetry recording, indentation, and live metrics.
 */

class TypingEngine {
  constructor(options = {}) {
    this.options = {
      autoIndent: true,
      indentSpaces: 2,
      smoothLineScroll: true,
      ...options
    };

    // DOM Elements
    this.container = document.getElementById("words-container");
    this.caret = document.getElementById("caret");
    this.liveWpmEl = document.getElementById("live-wpm-val");
    this.liveAccEl = document.getElementById("live-acc-val");
    this.liveTimerEl = document.getElementById("live-timer-val");

    // State
    this.snippet = null;
    this.language = "cpp";
    this.characters = []; // Array of character objects
    this.currentIndex = 0;
    this.lineOffsets = [];
    this.currentLine = 0;
    
    this.state = "idle"; // "idle" | "running" | "paused" | "finished"
    this.startTime = null;
    this.endTime = null;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.incorrectKeystrokes = 0;
    this.extraCharactersCount = 0;
    
    // Per-second telemetry for result chart
    this.telemetryTimeline = [];
    this.secondInterval = null;
    this.currentSecondErrors = 0;
    this.currentSecondKeystrokes = 0;

    // Time Limit mode support
    this.timeLimit = 0; // 0 = unlimited/full snippet
    this.timeRemaining = 0;

    // Analytics breakdown
    this.missedCharactersMap = {};

    // Callbacks
    this.onStart = options.onStart || (() => {});
    this.onFinish = options.onFinish || (() => {});
    this.onTick = options.onTick || (() => {});
    this.onKey = options.onKey || (() => {});
  }

  loadSnippet(snippet, mode = "snippet", limit = 0, language = "cpp") {
    this.reset();
    this.snippet = snippet;
    this.mode = mode; // "snippet", "time", "lines", "custom"
    this.language = language || snippet.language || "cpp";

    let code = snippet.code;

    // If lines mode, truncate code to specified number of lines
    if (mode === "lines" && limit > 0) {
      const lines = code.split("\n").slice(0, limit);
      code = lines.join("\n");
    }

    if (mode === "time" && limit > 0) {
      this.timeLimit = limit;
      this.timeRemaining = limit;
      if (this.liveTimerEl) this.liveTimerEl.textContent = `${this.timeRemaining}s`;
    } else {
      this.timeLimit = 0;
      this.timeRemaining = 0;
    }

    this._prepareCharacters(code);
    this._renderCode();
    this.updateCaretPosition();
  }

  _prepareCharacters(codeText) {
    // Normalize newlines
    const raw = codeText.replace(/\r\n/g, "\n");
    this.characters = [];
    this.lineOffsets = [0];

    const lines = raw.split("\n");
    let globalIndex = 0;

    for (let l = 0; l < lines.length; l++) {
      const line = lines[l];
      for (let c = 0; c < line.length; c++) {
        this.characters.push({
          index: globalIndex++,
          char: line[c],
          line: l,
          col: c,
          state: "pending", // "pending" | "correct" | "incorrect"
          typed: null,
          isNewline: false
        });
      }

      // If not the last line, insert virtual newline character
      if (l < lines.length - 1) {
        this.characters.push({
          index: globalIndex++,
          char: "\n",
          line: l,
          col: line.length,
          state: "pending",
          typed: null,
          isNewline: true
        });
        this.lineOffsets.push(globalIndex);
      }
    }
  }

  _renderCode() {
    if (!this.container) return;
    this.container.innerHTML = "";

    let currentLineDiv = document.createElement("div");
    currentLineDiv.className = "code-line";
    currentLineDiv.dataset.line = "0";

    let lastLine = 0;

    for (let i = 0; i < this.characters.length; i++) {
      const charObj = this.characters[i];

      if (charObj.line !== lastLine) {
        this.container.appendChild(currentLineDiv);
        currentLineDiv = document.createElement("div");
        currentLineDiv.className = "code-line";
        currentLineDiv.dataset.line = charObj.line;
        lastLine = charObj.line;
      }

      const span = document.createElement("span");
      span.className = "char pending";
      span.dataset.index = i;

      if (charObj.isNewline) {
        span.className += " newline-char";
        span.innerHTML = `<span class="return-icon">↵</span>`;
      } else if (charObj.char === " ") {
        span.className += " space-char";
        span.innerHTML = "&nbsp;";
      } else if (charObj.char === "\t") {
        span.className += " tab-char";
        span.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;";
      } else {
        span.textContent = charObj.char;
      }

      currentLineDiv.appendChild(span);
    }

    this.container.appendChild(currentLineDiv);
  }

  handleInput(key, e) {
    if (this.state === "finished") return;

    // Start timer on first active keystroke
    if (this.state === "idle") {
      this.start();
    }

    if (this.state !== "running") return;

    if (key === "Backspace") {
      e?.preventDefault();
      this._handleBackspace(e?.ctrlKey || e?.altKey);
      soundManager.playKey();
      this.updateCaretPosition();
      this._updateLiveStats();
      return;
    }

    // Ignore non-printable keys
    if (key.length > 1 && key !== "Enter" && key !== "Tab") {
      return;
    }

    e?.preventDefault();
    this.totalKeystrokes++;
    this.currentSecondKeystrokes++;

    if (key === "Tab") {
      this._handleTabInput();
    } else if (key === "Enter") {
      this._handleEnterInput();
    } else {
      this._handleRegularCharInput(key);
    }

    this.updateCaretPosition();
    this._updateLiveStats();
    this.onKey(key);

    // Check test completion
    if (this.currentIndex >= this.characters.length) {
      this.finish();
    }
  }

  _handleRegularCharInput(char) {
    if (this.currentIndex >= this.characters.length) return;

    const targetObj = this.characters[this.currentIndex];
    const span = this.container.querySelector(`.char[data-index="${this.currentIndex}"]`);

    if (char === targetObj.char) {
      // Correct
      targetObj.state = "correct";
      targetObj.typed = char;
      this.correctKeystrokes++;
      if (span) {
        span.className = "char correct";
      }
      soundManager.playKey();
    } else {
      // Incorrect
      targetObj.state = "incorrect";
      targetObj.typed = char;
      this.incorrectKeystrokes++;
      this.currentSecondErrors++;
      
      // Track which character was missed
      const targetCharKey = targetObj.char === " " ? "space" : targetObj.char;
      this.missedCharactersMap[targetCharKey] = (this.missedCharactersMap[targetCharKey] || 0) + 1;

      if (span) {
        span.className = "char incorrect";
      }
      soundManager.playError();
    }

    this.currentIndex++;
  }

  _handleEnterInput() {
    if (this.currentIndex >= this.characters.length) return;

    const targetObj = this.characters[this.currentIndex];
    const span = this.container.querySelector(`.char[data-index="${this.currentIndex}"]`);

    if (targetObj.isNewline) {
      targetObj.state = "correct";
      targetObj.typed = "\n";
      this.correctKeystrokes++;
      if (span) span.className = "char correct newline-char";
      this.currentIndex++;
      soundManager.playKey();

      // Auto-indent: advance past leading indentation spaces on new line
      if (this.options.autoIndent) {
        this._autoSkipLeadingSpaces();
      }
    } else {
      // Pressed Enter prematurely before finishing line
      targetObj.state = "incorrect";
      targetObj.typed = "\n";
      this.incorrectKeystrokes++;
      this.currentSecondErrors++;
      this.missedCharactersMap["\\n"] = (this.missedCharactersMap["\\n"] || 0) + 1;
      if (span) span.className = "char incorrect";
      this.currentIndex++;
      soundManager.playError();
    }
  }

  _autoSkipLeadingSpaces() {
    if (this.currentIndex >= this.characters.length) return;
    const currentLine = this.characters[this.currentIndex].line;
    let firstNonSpaceCol = -1;

    for (let i = 0; i < this.characters.length; i++) {
      if (this.characters[i].line === currentLine && this.characters[i].char !== " " && this.characters[i].char !== "\t") {
        firstNonSpaceCol = this.characters[i].col;
        break;
      }
    }

    if (firstNonSpaceCol > 0) {
      while (this.currentIndex < this.characters.length) {
        const nextObj = this.characters[this.currentIndex];
        if (nextObj.line === currentLine && (nextObj.char === " " || nextObj.char === "\t") && nextObj.col < firstNonSpaceCol) {
          nextObj.state = "correct";
          nextObj.typed = nextObj.char;
          const span = this.container.querySelector(`.char[data-index="${this.currentIndex}"]`);
          if (span) span.className = "char correct space-char auto-indented";
          this.currentIndex++;
        } else {
          break;
        }
      }
    }
  }

  _handleTabInput() {
    if (this.currentIndex >= this.characters.length) return;
    
    const targetObj = this.characters[this.currentIndex];
    if (targetObj.char === " ") {
      const spacesToType = this.options.indentSpaces || 2;
      for (let s = 0; s < spacesToType; s++) {
        if (this.currentIndex < this.characters.length && this.characters[this.currentIndex].char === " ") {
          this._handleRegularCharInput(" ");
        }
      }
    } else if (targetObj.char === "\t") {
      this._handleRegularCharInput("\t");
    } else {
      this._handleRegularCharInput(" ");
    }
  }

  _handleBackspace(isWordModifier = false) {
    if (this.currentIndex <= 0) return;

    if (isWordModifier) {
      while (this.currentIndex > 0) {
        this.currentIndex--;
        const obj = this.characters[this.currentIndex];
        obj.state = "pending";
        obj.typed = null;
        const span = this.container.querySelector(`.char[data-index="${this.currentIndex}"]`);
        if (span) {
          span.className = obj.isNewline ? "char pending newline-char" : "char pending";
        }
        if (this.currentIndex > 0 && this.characters[this.currentIndex - 1].char === " ") {
          break;
        }
      }
    } else {
      this.currentIndex--;
      const targetObj = this.characters[this.currentIndex];
      targetObj.state = "pending";
      targetObj.typed = null;

      const span = this.container.querySelector(`.char[data-index="${this.currentIndex}"]`);
      if (span) {
        span.className = targetObj.isNewline ? "char pending newline-char" : "char pending";
      }

      while (this.currentIndex > 0) {
        const prev = this.characters[this.currentIndex - 1];
        const prevSpan = this.container.querySelector(`.char[data-index="${this.currentIndex - 1}"]`);
        if (prev && prevSpan && prevSpan.classList.contains("auto-indented")) {
          this.currentIndex--;
          prev.state = "pending";
          prev.typed = null;
          prevSpan.className = "char pending space-char";
        } else {
          break;
        }
      }
    }
  }

  updateCaretPosition() {
    if (!this.caret || !this.container) return;

    let targetSpan = this.container.querySelector(`.char[data-index="${this.currentIndex}"]`);
    
    if (!targetSpan) {
      const lastSpan = this.container.querySelector(`.char[data-index="${this.characters.length - 1}"]`);
      if (lastSpan) {
        const rect = lastSpan.getBoundingClientRect();
        const containerRect = (this.caret.offsetParent || this.container).getBoundingClientRect();
        this.caret.style.transform = `translate3d(${rect.right - containerRect.left}px, ${rect.top - containerRect.top}px, 0)`;
        this.caret.style.height = `${rect.height}px`;
      }
      return;
    }

    const rect = targetSpan.getBoundingClientRect();
    // Measure relative to the caret's positioning parent (.typing-wrapper), not
    // #words-container: the wrapper's padding would otherwise offset the caret.
    const containerRect = (this.caret.offsetParent || this.container).getBoundingClientRect();

    const left = rect.left - containerRect.left;
    const top = rect.top - containerRect.top;

    this.caret.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    this.caret.style.height = `${rect.height || 24}px`;

    if (this.options.smoothLineScroll) {
      const activeLineDiv = targetSpan.closest(".code-line");
      if (activeLineDiv) {
        const lineTop = activeLineDiv.offsetTop;
        const scrollTarget = Math.max(0, lineTop - 70);
        this.container.scrollTop = scrollTarget;
      }
    }
  }

  start() {
    this.state = "running";
    this.startTime = performance.now();
    this.telemetryTimeline = [];
    this.currentSecondErrors = 0;
    this.currentSecondKeystrokes = 0;

    let elapsedSeconds = 0;
    this.secondInterval = setInterval(() => {
      if (this.state !== "running") return;
      elapsedSeconds++;

      const currentStats = this.calculateMetrics();

      this.telemetryTimeline.push({
        second: elapsedSeconds,
        wpm: currentStats.wpm,
        rawWpm: currentStats.rawWpm,
        errors: this.currentSecondErrors,
        keystrokes: this.currentSecondKeystrokes
      });

      this.currentSecondErrors = 0;
      this.currentSecondKeystrokes = 0;

      if (this.timeLimit > 0) {
        this.timeRemaining = Math.max(0, this.timeLimit - elapsedSeconds);
        if (this.liveTimerEl) this.liveTimerEl.textContent = `${this.timeRemaining}s`;
        if (this.timeRemaining <= 0) {
          this.finish();
        }
      } else {
        if (this.liveTimerEl) this.liveTimerEl.textContent = `${elapsedSeconds}s`;
      }

      this.onTick(elapsedSeconds, currentStats);
    }, 1000);

    this.onStart();
  }

  _updateLiveStats() {
    if (this.state !== "running") return;
    const metrics = this.calculateMetrics();
    if (this.liveWpmEl) this.liveWpmEl.textContent = metrics.wpm;
    if (this.liveAccEl) this.liveAccEl.textContent = `${metrics.accuracy}%`;
  }

  calculateMetrics() {
    const elapsedMinutes = Math.max(0.01, (performance.now() - (this.startTime || performance.now())) / 60000);
    
    const correctChars = this.correctKeystrokes;
    const totalChars = this.totalKeystrokes;
    
    const rawWpm = Math.round((totalChars / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round((correctChars / 5) / elapsedMinutes));
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    return {
      wpm: netWpm,
      rawWpm: rawWpm,
      accuracy: Math.min(100, Math.max(0, accuracy)),
      correctChars,
      totalChars,
      incorrectChars: this.incorrectKeystrokes
    };
  }

  calculateConsistency() {
    if (this.telemetryTimeline.length <= 1) return 100;

    const wpmValues = this.telemetryTimeline.map(pt => pt.rawWpm);
    const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
    if (mean === 0) return 100;

    const variance = wpmValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / wpmValues.length;
    const standardDeviation = Math.sqrt(variance);

    const cv = (standardDeviation / mean) * 100;
    return Math.max(0, Math.min(100, Math.round(100 - cv)));
  }

  finish() {
    if (this.state === "finished") return;
    this.state = "finished";
    this.endTime = performance.now();

    if (this.secondInterval) {
      clearInterval(this.secondInterval);
      this.secondInterval = null;
    }

    const durationSeconds = Math.max(1, Math.round((this.endTime - this.startTime) / 1000));
    const finalMetrics = this.calculateMetrics();
    const consistency = this.calculateConsistency();

    if (this.telemetryTimeline.length === 0) {
      this.telemetryTimeline.push({
        second: durationSeconds,
        wpm: finalMetrics.wpm,
        rawWpm: finalMetrics.rawWpm,
        errors: this.incorrectKeystrokes,
        keystrokes: this.totalKeystrokes
      });
    }

    const result = {
      snippetId: this.snippet?.id || "custom",
      snippetTitle: this.snippet?.title || "Custom Snippet",
      category: this.snippet?.category || "custom",
      difficulty: this.snippet?.difficulty || "normal",
      language: this.language || "cpp",
      mode: this.mode,
      wpm: finalMetrics.wpm,
      rawWpm: finalMetrics.rawWpm,
      accuracy: finalMetrics.accuracy,
      consistency: consistency,
      duration: durationSeconds,
      characters: {
        correct: this.correctKeystrokes,
        incorrect: this.incorrectKeystrokes,
        total: this.totalKeystrokes,
        missedMap: this.missedCharactersMap
      },
      timeline: this.telemetryTimeline
    };

    this.onFinish(result);
  }

  reset() {
    if (this.secondInterval) {
      clearInterval(this.secondInterval);
      this.secondInterval = null;
    }

    this.state = "idle";
    this.startTime = null;
    this.endTime = null;
    this.currentIndex = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.incorrectKeystrokes = 0;
    this.extraCharactersCount = 0;
    this.telemetryTimeline = [];
    this.missedCharactersMap = {};

    if (this.liveWpmEl) this.liveWpmEl.textContent = "0";
    if (this.liveAccEl) this.liveAccEl.textContent = "100%";
    if (this.liveTimerEl) this.liveTimerEl.textContent = this.timeLimit > 0 ? `${this.timeLimit}s` : "0s";

    if (this.container) {
      this.container.scrollTop = 0;
    }
  }
}
