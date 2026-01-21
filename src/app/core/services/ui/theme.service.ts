import { Injectable, signal } from '@angular/core';

import { STORAGE_KEYS } from '../../constants';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = STORAGE_KEYS.THEME;
  readonly theme = signal<Theme>('light');

  constructor() {
    const saved = this.getSavedTheme();
    const initial = saved ?? this.getSystemTheme();
    this.apply(initial);
  }

  toggle() {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme) {
    this.apply(theme);
  }

  private apply(theme: Theme) {
    this.theme.set(theme);

    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');

    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch {}
  }

  private getSavedTheme(): Theme | null {
    try {
      const v = localStorage.getItem(this.STORAGE_KEY);
      return v === 'dark' || v === 'light' ? v : null;
    } catch {
      return null;
    }
  }

  private getSystemTheme(): Theme {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
