
import { NextRequest, NextResponse } from 'next/server';
import { suggestItemDetails } from '@/ai/flows/suggest-item-details-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keywords } = body;

    if (!keywords) {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 });
    }
    const result = await suggestItemDetails({ keywords });
    return NextResponse.json(result);
  } catch (error: any) {
    let errorMessage = 'An unknown error occurred while suggesting item details.';
    let errorDetails: any = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = { name: error.name, stack: error.stack, cause: error.cause };
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = error.message || JSON.stringify(error);
      errorDetails = { ...error }; // Spread error object properties
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error(`[API /suggest-item-details] Error: ${errorMessage}`, {
      requestBody: await req.text().catch(() => 'Could not read request body'), // Log request body safely
      errorDetails,
      originalErrorObject: error,
    });
    
    return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
  }
}
