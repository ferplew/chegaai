
'use server';
/**
 * @fileOverview A Genkit flow to suggest item titles based on keywords.
 *
 * - suggestItemDetails - A function that handles the item title suggestion. (Name kept for now to minimize changes in calling code, but functionality changed)
 * - SuggestItemDetailsInput - The input type for the suggestItemDetails function.
 * - SuggestItemDetailsOutput - The return type for the suggestItemDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestItemDetailsInputSchema = z.object({
  keywords: z.string().describe('Keywords describing the item, e.g., "pizza calabresa grande queijo".'),
});
export type SuggestItemDetailsInput = z.infer<typeof SuggestItemDetailsInputSchema>;

const SuggestItemDetailsOutputSchema = z.object({
  suggestedTitles: z.array(z.string()).optional().describe('Up to three catchy and descriptive title suggestions for the item.'),
});
export type SuggestItemDetailsOutput = z.infer<typeof SuggestItemDetailsOutputSchema>;

export async function suggestItemDetails(input: SuggestItemDetailsInput): Promise<SuggestItemDetailsOutput> {
  return suggestItemTitlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestItemTitlesPrompt',
  input: { schema: SuggestItemDetailsInputSchema },
  output: { schema: SuggestItemDetailsOutputSchema },
  prompt: `You are an expert restaurant menu consultant. Based on the following keywords, suggest three compelling and distinct title options for a new menu item.

Keywords: {{{keywords}}}

Focus on creating appetizing and clear title suggestions.
Return the response in the specified JSON format with only the 'suggestedTitles' field.
If the keywords are too vague or nonsensical for a food item, you can return empty or minimal suggestions.

For example, for "pizza calabresa grande queijo", you might suggest:
{
  "suggestedTitles": [
    "Calabresa Suprema Gigante",
    "Pizza de Calabresa Artesanal com Queijo Extra",
    "A Clássica Calabresa com Borda Crocante"
  ]
}
`,
});

const suggestItemTitlesFlow = ai.defineFlow(
  {
    name: 'suggestItemTitlesFlow', // Renamed flow for clarity
    inputSchema: SuggestItemDetailsInputSchema,
    outputSchema: SuggestItemDetailsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        console.warn("AI title suggestion returned null/undefined output for keywords:", input.keywords);
        return {
          suggestedTitles: [`Item de ${input.keywords}`]
        };
      }
      return {
        suggestedTitles: output.suggestedTitles || [],
      };
    } catch (error) {
      console.error("Error in suggestItemTitlesFlow for keywords:", input.keywords, error);
       return {
          suggestedTitles: [`Erro ao sugerir títulos para ${input.keywords}`]
        };
    }
  }
);

