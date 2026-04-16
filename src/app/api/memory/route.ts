import { NextResponse } from 'next/server';
import { loadMemory, saveMemory, HistoryItem } from '@/memory/memoryService';

export async function GET() {
  try {
    const history = await loadMemory();
    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { item } = data as { item: HistoryItem };
    
    if (!item) {
      return NextResponse.json({ error: 'Item is required' }, { status: 400 });
    }

    const history = await loadMemory();
    const updatedHistory = [item, ...history];
    await saveMemory(updatedHistory);

    return NextResponse.json({ success: true, history: updatedHistory });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const history = await loadMemory();
    const updatedHistory = history.filter(item => item.id !== id);
    await saveMemory(updatedHistory);

    return NextResponse.json({ success: true, history: updatedHistory });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 });
  }
}
