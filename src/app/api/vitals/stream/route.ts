import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'live_stream_state.json');

// Memory buffer for instantaneous live ticks
let lastTick: any = null;

export async function POST(req: NextRequest) {
  try {
    const observation = await req.json();
    lastTick = {
      ...observation,
      receivedAt: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, event_id: observation.event_id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  // Support Server-Sent Events (SSE) if requested
  const accept = req.headers.get('accept') || '';
  if (accept.includes('text/event-stream')) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        let active = true;
        const interval = setInterval(() => {
          if (!active) {
            clearInterval(interval);
            return;
          }
          try {
            if (fs.existsSync(STATE_FILE)) {
              const content = fs.readFileSync(STATE_FILE, 'utf-8');
              controller.enqueue(encoder.encode(`data: ${content}\n\n`));
            }
          } catch {
            // Non-fatal read collision
          }
        }, 1000);

        req.signal.addEventListener('abort', () => {
          active = false;
          clearInterval(interval);
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  // Otherwise return standard JSON response
  if (fs.existsSync(STATE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Access-Control-Allow-Origin': '*',
        }
      });
    } catch {
      // Fallback
    }
  }

  return NextResponse.json({ status: 'waiting_for_stream', timestamp: new Date().toISOString() });
}

