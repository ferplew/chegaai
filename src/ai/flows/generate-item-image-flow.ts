
'use server';
/**
 * @fileOverview A Genkit flow to generate an image based on an item title.
 *
 * - generateItemImage - A function that handles the item image generation.
 * - GenerateItemImageInput - The input type for the generateItemImage function.
 * - GenerateItemImageOutput - The return type for the generateItemImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateItemImageInputSchema = z.object({
  title: z.string().describe('The title of the item to generate an image for.'),
});
export type GenerateItemImageInput = z.infer<typeof GenerateItemImageInputSchema>;

const GenerateItemImageOutputSchema = z.object({
  imageDataUri: z.string().optional().describe('The generated image as a data URI (e.g., data:image/png;base64,...), or undefined if generation failed.'),
});
export type GenerateItemImageOutput = z.infer<typeof GenerateItemImageOutputSchema>;

export async function generateItemImage(input: GenerateItemImageInput): Promise<GenerateItemImageOutput> {
  return generateItemImageFlow(input);
}

const generateItemImageFlow = ai.defineFlow(
  {
    name: 'generateItemImageFlow',
    inputSchema: GenerateItemImageInputSchema,
    outputSchema: GenerateItemImageOutputSchema,
  },
  async (input) => {
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Specific model for image generation
        prompt: `Generate a high-quality, appetizing food photography image suitable for a restaurant menu for an item titled: "${input.title}". The image should be well-lit, focused on the food, and make it look delicious. Avoid text overlays or complex backgrounds unless it's a natural part of a food scene (e.g., a wooden table). Ensure the image is safe for all audiences.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both
           safetySettings: [ 
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
          ],
        },
      });

      if (media?.url) {
        return { imageDataUri: media.url };
      }
      console.warn('AI image generation did not return a media URL for title:', input.title);
      return { imageDataUri: undefined };
    } catch (error: any) {
      let errorMessage = 'Unknown error during AI image generation.';
      if (error && error.message) {
        errorMessage = error.message;
      }
      if (error && error.cause && error.cause.message) {
        errorMessage += ` Details: ${error.cause.message}`;
      } else if (error && error.details) {
         errorMessage += ` Details: ${JSON.stringify(error.details)}`;
      }

      console.error(`Error generating image with AI for title "${input.title}": ${errorMessage}`, error);
      return { imageDataUri: undefined };
    }
  }
);
