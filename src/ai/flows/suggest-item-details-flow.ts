
'use server';
/**
 * @fileOverview A Genkit flow to suggest item titles and descriptions based on keywords.
 *
 * - suggestItemDetails - A function that handles the item detail suggestion.
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
  suggestedDescriptions: z.array(z.string()).optional().describe('Up to three compelling description suggestions for the item, based on the keywords.'),
});
export type SuggestItemDetailsOutput = z.infer<typeof SuggestItemDetailsOutputSchema>;

export async function suggestItemDetails(input: SuggestItemDetailsInput): Promise<SuggestItemDetailsOutput> {
  return suggestItemDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestItemDetailsPrompt',
  input: { schema: SuggestItemDetailsInputSchema },
  output: { schema: SuggestItemDetailsOutputSchema },
  prompt: `You are an expert restaurant menu consultant. Based on the following keywords, suggest three compelling and distinct title options AND three distinct, appetizing description options for a new menu item.

Keywords: {{{keywords}}}

Focus on creating appetizing and clear title suggestions, and relatively concise descriptions that highlight key features or ingredients implied by the keywords.
Return the response in the specified JSON format with 'suggestedTitles' and 'suggestedDescriptions' fields.
If the keywords are too vague or nonsensical for a food item, you can return empty or minimal suggestions.

For example, for "pizza calabresa grande queijo", you might suggest:
{
  "suggestedTitles": [
    "Calabresa Suprema Gigante",
    "Pizza de Calabresa Artesanal com Queijo Extra",
    "A Clássica Calabresa com Borda Crocante"
  ],
  "suggestedDescriptions": [
    "Uma explosão de sabor com nossa generosa pizza de calabresa defumada, fatias suculentas sobre uma camada de queijo mussarela derretido e molho de tomate artesanal. Ideal para compartilhar!",
    "Experimente a combinação perfeita de calabresa selecionada, queijo derretido no ponto e nosso molho especial sobre uma massa crocante. Uma experiência única para os amantes de calabresa!",
    "Nossa pizza de calabresa tamanho família é perfeita para matar a fome. Ingredientes frescos e massa crocante, direto do forno para sua mesa, com o toque especial da casa."
  ]
}
`,
});

const suggestItemDetailsFlow = ai.defineFlow(
  {
    name: 'suggestItemDetailsFlow',
    inputSchema: SuggestItemDetailsInputSchema,
    outputSchema: SuggestItemDetailsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        console.warn("AI title/description suggestion returned null/undefined output for keywords:", input.keywords);
        return {
          suggestedTitles: [`Item de ${input.keywords}`],
          suggestedDescriptions: [`Descrição para ${input.keywords}.`]
        };
      }
      return {
        suggestedTitles: output.suggestedTitles || [],
        suggestedDescriptions: output.suggestedDescriptions || [],
      };
    } catch (error) {
      console.error("Error in suggestItemDetailsFlow for keywords:", input.keywords, error);
       return {
          suggestedTitles: [`Erro ao sugerir títulos para ${input.keywords}`],
          suggestedDescriptions: [`Erro ao sugerir descrições para ${input.keywords}`]
        };
    }
  }
);
