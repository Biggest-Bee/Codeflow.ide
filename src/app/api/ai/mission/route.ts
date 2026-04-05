import { NextResponse } from 'next/server';
import { processAiMissionInternal } from '@/ai/flows/ai-mission-flow';

export const maxDuration = 540;

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const result = await processAiMissionInternal(input);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Mission Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Mission Route Error" },
      { status: 200 }
    );
  }
}
