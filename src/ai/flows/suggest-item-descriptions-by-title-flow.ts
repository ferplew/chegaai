
'use server';
/**
 * @fileOverview A Genkit flow to suggest item descriptions based on an item title.
 *
 * - suggestItemDescriptionsByTitle - A function that handles the item description suggestion.
 * - SuggestItemDescriptionsByTitleInput - The input type for the function.
 * - SuggestItemDescriptionsByTitleOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestItemDescriptionsByTitleInputSchema = z.object({
  itemTitle: z.string().describe('The title of the item for which to suggest descriptions.'),
});
export type SuggestItemDescriptionsByTitleInput = z.infer<typeof SuggestItemDescriptionsByTitleInputSchema>;

const SuggestItemDescriptionsByTitleOutputSchema = z.object({
  suggestedDescriptions: z.array(z.string()).optional().describe('Up to three compelling description suggestions for the item, highlighting key features and ingredients.'),
});
export type SuggestItemDescriptionsByTitleOutput = z.infer<typeof SuggestItemDescriptionsByTitleOutputSchema>;

export async function suggestItemDescriptionsByTitle(input: SuggestItemDescriptionsByTitleInput): Promise<SuggestItemDescriptionsByTitleOutput> {
  return suggestItemDescriptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestItemDescriptionsByTitlePrompt',
  input: { schema: SuggestItemDescriptionsByTitleInputSchema },
  output: { schema: SuggestItemDescriptionsByTitleOutputSchema },
  prompt: `You are an expert restaurant menu writer. Based on the following item title, suggest three distinct and compelling description options for a menu.
The descriptions should be appetizing, highlight key features or ingredients if implied by the title, and be relatively concise.

Item Title: {{{itemTitle}}}

Return the response in the specified JSON format with only the 'suggestedDescriptions' field.
If the item title is too vague, you can return empty or minimal suggestions.

For example, for "Calabresa Suprema Gigante", you might suggest:
{
  "suggestedDescriptions": [
    "Uma explosão de sabor com nossa generosa pizza de calabresa defumada, fatias suculentas sobre uma camada de queijo mussarela derretido e molho de tomate artesanal. Ideal para compartilhar!",
    "Experimente a combinação perfeita de calabresa selecionada, queijo derretido no ponto e nosso molho especial. Uma experiência única para os amantes de calabresa!",
    "Nossa pizza de calabresa tamanho família é perfeita para matar a fome. Ingredientes frescos e massa crocante, direto do forno para sua mesa, com o toque especial da casa."
  ]
}
`,
});

const suggestItemDescriptionsFlow = ai.defineFlow(
  {
    name: 'suggestItemDescriptionsByTitleFlow',
    inputSchema: SuggestItemDescriptionsByTitleInputSchema,
    outputSchema: SuggestItemDescriptionsByTitleOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        console.warn("AI description suggestion returned null/undefined output for item title:", input.itemTitle);
        return {
          suggestedDescriptions: [`Descrição para ${input.itemTitle}.`]
        };
      }
      return {
        suggestedDescriptions: output.suggestedDescriptions || [],
      };
    } catch (error) {
      console.error("Error in suggestItemDescriptionsByTitleFlow for item title:", input.itemTitle, error);
       return {
          suggestedDescriptions: [`Erro ao sugerir descrições para ${input.itemTitle}`]
        };
    }
  }
);
