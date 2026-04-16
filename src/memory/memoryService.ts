import fs from 'fs/promises';
import path from 'path';

const historyFilePath = path.join(process.cwd(), 'src', 'memory', 'history.json');

export interface HistoryItem {
  id: string;
  code: string;
  prd: string;
  structuredJson?: any;
  timestamp: number;
  title: string;
}

export async function loadMemory(): Promise<HistoryItem[]> {
  try {
    const data = await fs.readFile(historyFilePath, 'utf8');
    return JSON.parse(data) as HistoryItem[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
       // file does not exist, return empty array
       return [];
    }
    console.error('Error loading memory:', error);
    return [];
  }
}

export async function saveMemory(items: HistoryItem[]): Promise<void> {
  try {
    // ensure directory exists
    await fs.mkdir(path.dirname(historyFilePath), { recursive: true });
    await fs.writeFile(historyFilePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving memory:', error);
  }
}
