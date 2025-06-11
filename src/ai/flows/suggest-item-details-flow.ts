
'use server';
/**
 * @fileOverview A Genkit flow to suggest item details (title, description, additionals) based on keywords.
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
  suggestedTitle: z.string().optional().describe('A catchy and descriptive title for the item.'),
  suggestedDescription: z.string().optional().describe('A compelling description for the item, highlighting key features and ingredients.'),
  suggestedAdditionals: z.array(z.string()).optional().describe('A list of suggested names for additional toppings or options (e.g., "Borda Recheada", "Queijo Extra"). Prices are not suggested here.'),
});
export type SuggestItemDetailsOutput = z.infer<typeof SuggestItemDetailsOutputSchema>;

export async function suggestItemDetails(input: SuggestItemDetailsInput): Promise<SuggestItemDetailsOutput> {
  return suggestItemDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestItemDetailsPrompt',
  input: { schema: SuggestItemDetailsInputSchema },
  output: { schema: SuggestItemDetailsOutputSchema },
  prompt: `You are an expert restaurant menu consultant. Based on the following keywords, suggest a compelling title, description, and potential additional/optional item names for a new menu item.

Keywords: {{{keywords}}}

Focus on creating appetizing and clear suggestions. For additionals, just provide names, not prices.
Return the response in the specified JSON format.
If the keywords are too vague or nonsensical for a food item, you can return empty or minimal suggestions.
For example, for "pizza calabresa grande queijo", you might suggest:
Title: "Calabresa Suprema Gigante"
Description: "Uma explosão de sabor com nossa generosa pizza de calabresa defumada, fatias suculentas sobre uma camada de queijo mussarela derretido e molho de tomate artesanal. Ideal para compartilhar!"
Additionals: ["Borda Recheada com Catupiry", "Queijo Extra", "Cebola Caramelizada"]

For "doce de leite caseiro", you might suggest:
Title: "Pudim de Doce de Leite Artesanal"
Description: "Delicie-se com a cremosidade do nosso pudim de doce de leite, feito com receita tradicional e um toque especial de caramelo."
Additionals: ["Calda Extra", "Raspas de Coco"]
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
        // Fallback or specific handling if output is null/undefined
        // This might happen if the model doesn't adhere to the schema strictly, or if there's an issue
        console.warn("AI suggestion returned null/undefined output for keywords:", input.keywords);
        return {
          suggestedTitle: `Item de ${input.keywords}`, // Basic fallback
          suggestedDescription: `Descrição para ${input.keywords}.`,
          suggestedAdditionals: []
        };
      }
      return output;
    } catch (error) {
      console.error("Error in suggestItemDetailsFlow for keywords:", input.keywords, error);
      // Provide a fallback or re-throw, depending on desired error handling
       return {
          suggestedTitle: `Erro ao sugerir para ${input.keywords}`,
          suggestedDescription: "Não foi possível gerar sugestões no momento.",
          suggestedAdditionals: []
        };
    }
  }
);
