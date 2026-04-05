import { NextResponse } from 'next/server';
import { generateCodeInternal } from '@/ai/flows/ai-code-generation-flow';

/**
 * Standard API Route Handler for long-running architectural synthesis.
 * API routes are preferred over Server Actions for tasks exceeding 30 seconds.
 */
export const maxDuration = 540; 

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const result = await generateCodeInternal(input);
    
    // Always return 200 with result to ensure the frontend can parse the JSON
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("API Generate Route Error:", error);
    // Return status 200 with error object so frontend logic can display the specific error
    return NextResponse.json(
      { 
        error: error.message || "Internal Synthesis Route Error",
        explanation: `Handshake Error: ${error.message}`
      },
      { status: 200 } 
    );
  }
}
