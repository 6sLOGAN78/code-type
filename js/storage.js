/**
 * cppType - Persistent LocalStorage Manager
 * Stores test history, user preferences, custom snippets, and lifetime analytics.
 */

const STORAGE_KEYS = {
  HISTORY: "cpptype_history_v1",
  SETTINGS: "cpptype_settings_v1",
  CUSTOM_SNIPPETS: "cpptype_custom_snippets_v1",
  STATS: "cpptype_lifetime_stats_v1"
};

const DEFAULT_SETTINGS = {
  theme: "serika-dark",
  fontFamily: "JetBrains Mono",
  fontSize: 18,
  caretStyle: "caret-smooth",
  soundType: "thock",
  soundVolume: 0.35,
  errorSound: true,
  blindMode: false,
  quickRestart: "tab", // "tab", "esc", "enter"
  paceCaret: "off", // "off", "pb", "custom"
  paceCaretWpm: 75,
  indentSpaces: 2,
  autoIndent: true,
  smoothLineScroll: true,
  liveWpm: true,
  liveAccuracy: true,
  liveTimer: true,
  mode: "snippet", // "snippet", "time", "lines", "custom"
  category: "all",
  difficulty: "all",
  timeLimit: 30,
  lineLimit: 10
};

class StorageManager {
  constructor() {
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
    return this.settings;
  }

  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
    return [];
  }

  saveResult(result) {
    const history = this.getHistory();
    const resultEntry = {
      id: "res_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      timestamp: Date.now(),
      ...result
    };
    history.unshift(resultEntry); // Newest first

    // Limit to last 500 tests to prevent storage overflow
    if (history.length > 500) {
      history.pop();
    }

    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      this.updateLifetimeStats(resultEntry);
    } catch (e) {
      console.error("Failed to save history", e);
    }
    return resultEntry;
  }

  deleteHistoryItem(id) {
    const history = this.getHistory().filter(item => item.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      this.recalculateLifetimeStats();
    } catch (e) {
      console.error("Failed to delete history item", e);
    }
    return history;
  }

  clearAllHistory() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.STATS);
    } catch (e) {
      console.error("Failed to clear history", e);
    }
  }

  updateLifetimeStats(newResult) {
    const stats = this.getLifetimeStats();
    stats.totalTests += 1;
    stats.totalTimeSeconds += (newResult.duration || 0);
    stats.totalCharacters += (newResult.characters?.correct || 0);
    if (newResult.wpm > stats.bestWpm) {
      stats.bestWpm = newResult.wpm;
    }
    if (newResult.rawWpm > stats.bestRawWpm) {
      stats.bestRawWpm = newResult.rawWpm;
    }
    
    // Recalculate average WPM
    const history = this.getHistory();
    const totalWpm = history.reduce((sum, item) => sum + (item.wpm || 0), 0);
    stats.avgWpm = history.length ? Math.round(totalWpm / history.length) : 0;
    
    const totalAcc = history.reduce((sum, item) => sum + (item.accuracy || 0), 0);
    stats.avgAccuracy = history.length ? Math.round(totalAcc / history.length) : 0;

    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.error("Failed to save lifetime stats", e);
    }
    return stats;
  }

  getLifetimeStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}

    return {
      totalTests: 0,
      totalTimeSeconds: 0,
      totalCharacters: 0,
      bestWpm: 0,
      bestRawWpm: 0,
      avgWpm: 0,
      avgAccuracy: 0
    };
  }

  recalculateLifetimeStats() {
    const history = this.getHistory();
    const stats = {
      totalTests: history.length,
      totalTimeSeconds: 0,
      totalCharacters: 0,
      bestWpm: 0,
      bestRawWpm: 0,
      avgWpm: 0,
      avgAccuracy: 0
    };

    let totalWpm = 0;
    let totalAcc = 0;

    history.forEach(item => {
      stats.totalTimeSeconds += (item.duration || 0);
      stats.totalCharacters += (item.characters?.correct || 0);
      if (item.wpm > stats.bestWpm) stats.bestWpm = item.wpm;
      if (item.rawWpm > stats.bestRawWpm) stats.bestRawWpm = item.rawWpm;
      totalWpm += (item.wpm || 0);
      totalAcc += (item.accuracy || 0);
    });

    if (history.length > 0) {
      stats.avgWpm = Math.round(totalWpm / history.length);
      stats.avgAccuracy = Math.round(totalAcc / history.length);
    }

    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    return stats;
  }

  getCustomSnippets() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_SNIPPETS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return [];
  }

  saveCustomSnippet(snippet) {
    const snippets = this.getCustomSnippets();
    const entry = {
      id: "custom_" + Date.now(),
      title: snippet.title || "Custom C++ Snippet",
      code: snippet.code,
      category: "custom",
      difficulty: "custom",
      createdAt: Date.now()
    };
    snippets.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SNIPPETS, JSON.stringify(snippets));
    return entry;
  }

  deleteCustomSnippet(id) {
    const snippets = this.getCustomSnippets().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SNIPPETS, JSON.stringify(snippets));
    return snippets;
  }

  exportData() {
    return JSON.stringify({
      history: this.getHistory(),
      settings: this.settings,
      customSnippets: this.getCustomSnippets(),
      stats: this.getLifetimeStats(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.history) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
      if (data.settings) this.saveSettings(data.settings);
      if (data.customSnippets) localStorage.setItem(STORAGE_KEYS.CUSTOM_SNIPPETS, JSON.stringify(data.customSnippets));
      this.recalculateLifetimeStats();
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  }
}

const storage = new StorageManager();
