export interface AgentSessionMemory {
  summary: string;
  facts: string[];
  lastSpec?: string;
  updatedAt: number;
}

interface MemoryEntry {
  value: AgentSessionMemory;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const memoryStore = new Map<string, MemoryEntry>();

function now() {
  return Date.now();
}

function createEmptyMemory(): AgentSessionMemory {
  return {
    summary: "",
    facts: [],
    updatedAt: now(),
  };
}

function uniqueFacts(items: string[]) {
  return Array.from(
    new Set(
      items
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function touch(sessionId: string, value: AgentSessionMemory, ttlMs = DEFAULT_TTL_MS) {
  memoryStore.set(sessionId, {
    value: {
      ...value,
      facts: uniqueFacts(value.facts),
      updatedAt: now(),
    },
    expiresAt: now() + ttlMs,
  });
}

export function cleanupExpiredSessions(currentTs = now()) {
  for (const [sessionId, entry] of memoryStore.entries()) {
    if (entry.expiresAt <= currentTs) {
      memoryStore.delete(sessionId);
    }
  }
}

export function readSessionMemory(sessionId: string) {
  cleanupExpiredSessions();
  const entry = memoryStore.get(sessionId);
  if (!entry) {
    return createEmptyMemory();
  }

  if (entry.expiresAt <= now()) {
    memoryStore.delete(sessionId);
    return createEmptyMemory();
  }

  return entry.value;
}

export function writeSessionMemory(sessionId: string, next: AgentSessionMemory, ttlMs = DEFAULT_TTL_MS) {
  touch(sessionId, next, ttlMs);
  return readSessionMemory(sessionId);
}

export interface MemoryPatch {
  summary?: string;
  facts?: string[];
  lastSpec?: string;
}

export function mergeSessionMemory(sessionId: string, patch: MemoryPatch, ttlMs = DEFAULT_TTL_MS) {
  const current = readSessionMemory(sessionId);
  const merged: AgentSessionMemory = {
    summary: patch.summary ?? current.summary,
    facts: uniqueFacts([...(current.facts ?? []), ...(patch.facts ?? [])]),
    lastSpec: patch.lastSpec ?? current.lastSpec,
    updatedAt: now(),
  };

  touch(sessionId, merged, ttlMs);
  return readSessionMemory(sessionId);
}
