import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────
// App-wide user preferences, persisted to AsyncStorage.
// Tiny pub-sub store — no provider needed; any screen can call
// useSettings() and stays in sync with every other screen.
// ─────────────────────────────────────────────────────────────

const KEY = 'fibcast.settings.v1';

export const DEFAULT_SETTINGS = {
  billingDay: 1,
  reminderTemplate:
    'Hello {name}, your BSNL broadband bill is due this month. Please pay at the earliest to avoid disconnection. Thank you.',
};

let cache     = { ...DEFAULT_SETTINGS };
let loadState = 'idle'; // idle | loading | ready
const listeners = new Set();

function notify() {
  listeners.forEach(fn => fn(cache));
}

async function ensureLoaded() {
  if (loadState !== 'idle') return;
  loadState = 'loading';
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) cache = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // Corrupt or unreadable storage → fall back to defaults silently.
  }
  loadState = 'ready';
  notify();
}

export function useSettings() {
  const [settings, setSettings] = useState(cache);

  useEffect(() => {
    const fn = s => setSettings({ ...s });
    listeners.add(fn);
    ensureLoaded().then(() => setSettings({ ...cache }));
    return () => { listeners.delete(fn); };
  }, []);

  async function saveSettings(patch) {
    cache = { ...cache, ...patch };
    notify(); // optimistic in-memory update
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(cache));
    } catch {
      // Persistence failure is non-fatal; in-memory state stays consistent.
    }
  }

  return { settings, saveSettings };
}

// 1 → "1st", 2 → "2nd", 23 → "23rd" …
export function ordinal(n) {
  const num = Number(n) || 1;
  const s   = ['th', 'st', 'nd', 'rd'];
  const v   = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Fill {name}-style placeholders in the reminder template.
export function renderTemplate(template, vars = {}) {
  return (template || DEFAULT_SETTINGS.reminderTemplate)
    .replace(/\{name\}/gi, vars.name || '');
}
