/**
 * Theme Management System
 * Handles light/dark theme switching with system preference detection and persistence
 */

class ThemeManager {
  constructor() {
    this.themes = {
      light: 'light',
      dark: 'dark',
      system: 'system'
    };
    
    this.currentTheme = 'dark';
    this.systemPreference = 'light';
    this.storageKey = 'claude-terminal-theme';
    this.terminalThemes = null;
    
    this.init();
  }
  
  init() {
    // Check for system preference
    this.updateSystemPreference();
    
    // Load saved theme preference
    this.loadThemePreference();
    
    // Apply initial theme without transition to prevent flash
    this.applyTheme(true);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize terminal themes if xterm is available
    this.initializeTerminalThemes();
  }
  
  updateSystemPreference() {
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPreference = darkModeQuery.matches ? 'dark' : 'light';
      
      // Listen for system preference changes
      darkModeQuery.addEventListener('change', (e) => {
        this.systemPreference = e.matches ? 'dark' : 'light';
        if (this.currentTheme === 'system') {
          this.applyTheme();
        }
      });
    }
  }
  
  loadThemePreference() {
    try {
      const savedTheme = localStorage.getItem(this.storageKey);
      if (savedTheme && Object.values(this.themes).includes(savedTheme)) {
        this.currentTheme = savedTheme;
      }
    } catch (error) {
      console.warn('Failed to load theme preference from localStorage:', error);
    }
  }
  
  saveThemePreference() {
    try {
      localStorage.setItem(this.storageKey, this.currentTheme);
    } catch (error) {
      console.warn('Failed to save theme preference to localStorage:', error);
    }
  }
  
  getEffectiveTheme() {
    if (this.currentTheme === 'system') {
      return this.systemPreference;
    }
    return this.currentTheme;
  }
  
  applyTheme(skipTransition = false) {
    const effectiveTheme = this.getEffectiveTheme();
    const html = document.documentElement;
    
    // Add no-transition class to prevent flashing during initial load
    if (skipTransition) {
      html.classList.add('no-transition');
    }
    
    // Remove existing theme classes
    html.classList.remove('light-theme', 'dark-theme');
    
    // Apply new theme class
    if (effectiveTheme === 'dark') {
      html.classList.add('dark-theme');
    }
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(effectiveTheme);
    
    // Update terminal theme if available
    this.updateTerminalTheme(effectiveTheme);
    
    // Update toggle state
    this.updateToggleState();
    
    // Remove no-transition class after a brief delay
    if (skipTransition) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          html.classList.remove('no-transition');
        });
      });
    }
    
    // Dispatch theme change event
    this.dispatchThemeChangeEvent(effectiveTheme);
  }
  
  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    const color = theme === 'dark' ? '#1C1C1E' : '#FFFFFF';
    metaThemeColor.content = color;
  }
  
  updateToggleState() {
    const toggles = document.querySelectorAll('.theme-toggle-input');
    const effectiveTheme = this.getEffectiveTheme();
    
    toggles.forEach(toggle => {
      toggle.checked = effectiveTheme === 'dark';
      
      // Update ARIA label
      const label = effectiveTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
      toggle.setAttribute('aria-label', label);
    });
  }
  
  initializeTerminalThemes() {
    if (typeof Terminal === 'undefined') return;
    
    this.terminalThemes = {
      light: {
        background: '#FAFAFA',
        foreground: '#1C1C1E',
        cursor: '#007AFF',
        cursorAccent: '#FFFFFF',
        selection: 'rgba(0, 122, 255, 0.2)',
        black: '#1C1C1E',
        red: '#D70015',
        green: '#00A040',
        yellow: '#FF8C00',
        blue: '#007AFF',
        magenta: '#A550A7',
        cyan: '#00A0A0',
        white: '#FFFFFF',
        brightBlack: '#6E6E73',
        brightRed: '#FF453A',
        brightGreen: '#32D74B',
        brightYellow: '#FFD60A',
        brightBlue: '#007AFF',
        brightMagenta: '#BF5AF2',
        brightCyan: '#5AC8FA',
        brightWhite: '#FFFFFF'
      },
      dark: {
        background: '#0D1117',
        foreground: '#E6EDF3',
        cursor: '#0A84FF',
        cursorAccent: '#000000',
        selection: 'rgba(10, 132, 255, 0.2)',
        black: '#1C1C1E',
        red: '#FF453A',
        green: '#32D74B',
        yellow: '#FFD60A',
        blue: '#0A84FF',
        magenta: '#BF5AF2',
        cyan: '#64D2FF',
        white: '#FFFFFF',
        brightBlack: '#8E8E93',
        brightRed: '#FF6961',
        brightGreen: '#52C878',
        brightYellow: '#FFED4A',
        brightBlue: '#409CFF',
        brightMagenta: '#CF87FF',
        brightCyan: '#87D3F3',
        brightWhite: '#FFFFFF'
      }
    };
  }
  
  updateTerminalTheme(theme) {
    if (!this.terminalThemes || typeof window.terminals === 'undefined') return;
    
    const terminalTheme = this.terminalThemes[theme];
    if (!terminalTheme) return;
    
    // Update all active terminals
    if (window.terminals && window.terminals instanceof Map) {
      window.terminals.forEach(({ terminal }) => {
        if (terminal && typeof terminal.options === 'object') {
          terminal.options.theme = terminalTheme;
        }
      });
    }
  }
  
  setupEventListeners() {
    // Handle toggle clicks
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('theme-toggle-input')) {
        this.toggleTheme();
      }
    });
    
    // Keyboard shortcuts removed per user request
  }
  
  toggleTheme() {
    const effectiveTheme = this.getEffectiveTheme();
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
  
  setTheme(theme) {
    if (!Object.values(this.themes).includes(theme)) {
      console.warn('Invalid theme:', theme);
      return;
    }
    
    this.currentTheme = theme;
    this.saveThemePreference();
    this.applyTheme();
  }
  
  dispatchThemeChangeEvent(theme) {
    const event = new CustomEvent('themechange', {
      detail: {
        theme: theme,
        isDark: theme === 'dark'
      }
    });
    document.dispatchEvent(event);
  }
  
  // Public API methods
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  getEffectiveThemePublic() {
    return this.getEffectiveTheme();
  }
  
  isDarkMode() {
    return this.getEffectiveTheme() === 'dark';
  }
  
  isLightMode() {
    return this.getEffectiveTheme() === 'light';
  }
}

// Initialize theme manager when DOM is ready
function initializeThemeManager() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.themeManager = new ThemeManager();
    });
  } else {
    window.themeManager = new ThemeManager();
  }
}

// Auto-initialize
initializeThemeManager();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
