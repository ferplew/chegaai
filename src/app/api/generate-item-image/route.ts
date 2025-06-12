
import { NextRequest, NextResponse } from 'next/server';
import { generateItemImage } from '@/ai/flows/generate-item-image-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const result = await generateItemImage({ title });
    return NextResponse.json(result);
  } catch (error: any) {
    let errorMessage = 'An unknown error occurred while generating item image.';
    let errorDetails: any = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = { name: error.name, stack: error.stack, cause: error.cause };
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = error.message || JSON.stringify(error);
      errorDetails = { ...error }; 
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error(`[API /generate-item-image] Error: ${errorMessage}`, {
      requestBody: await req.text().catch(() => 'Could not read request body'),
      errorDetails,
      originalErrorObject: error,
    });

    return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
  }
}
