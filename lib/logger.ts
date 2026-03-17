import AsyncStorage from '@react-native-async-storage/async-storage';

export type Level = 'info' | 'warn' | 'error';

export type LogEntry = {
  id:    string;
  ts:    string;
  level: Level;
  tag:   string;
  msg:   string;
  data?: string; // JSON stringified
};

const MAX_LOGS = 500;
const STORAGE_KEY = 'gasrank_logs';

let mem: LogEntry[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((fn) => fn());
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mem));
  } catch {}
}

function add(level: Level, tag: string, msg: string, raw?: unknown) {
  const entry: LogEntry = {
    id:    `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ts:    new Date().toISOString(),
    level,
    tag,
    msg,
    data:  raw !== undefined ? JSON.stringify(raw, null, 2) : undefined,
  };

  mem = [...mem.slice(-(MAX_LOGS - 1)), entry];
  persist();
  notify();

  if (__DEV__) {
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(`[${tag}] ${msg}`, raw ?? '');
  }
}

export const logger = {
  async load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) mem = JSON.parse(raw);
    } catch {}
  },

  info:  (tag: string, msg: string, data?: unknown) => add('info',  tag, msg, data),
  warn:  (tag: string, msg: string, data?: unknown) => add('warn',  tag, msg, data),
  error: (tag: string, msg: string, data?: unknown) => add('error', tag, msg, data),

  getLogs: (): LogEntry[] => [...mem].reverse(),

  async clear() {
    mem = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
    notify();
  },

  subscribe(fn: () => void) {
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
  },
};
