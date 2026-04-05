import { NextResponse } from 'next/server';
import { aiCodeExplanationAndDebuggingInternal } from '@/ai/flows/ai-code-explanation-debugging-flow';

export const maxDuration = 540;

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const result = await aiCodeExplanationAndDebuggingInternal(input);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Edit Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Edit Route Error" },
      { status: 200 }
    );
  }
}
