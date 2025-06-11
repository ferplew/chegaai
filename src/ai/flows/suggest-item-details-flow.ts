
'use server';
/**
 * @fileOverview A Genkit flow to suggest item details (titles, descriptions, additionals) based on keywords.
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
  suggestedDescriptions: z.array(z.string()).optional().describe('Up to three compelling description suggestions for the item, highlighting key features and ingredients.'),
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
  prompt: `You are an expert restaurant menu consultant. Based on the following keywords, suggest three compelling and distinct title options, three distinct description options, and potential additional/optional item names for a new menu item.

Keywords: {{{keywords}}}

Focus on creating appetizing and clear suggestions. For additionals, just provide names, not prices.
Return the response in the specified JSON format.
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
    "Experimente a combinação perfeita de calabresa selecionada, queijo derretido no ponto e nosso molho especial. Uma experiência única!",
    "Nossa pizza de calabresa tamanho família é perfeita para matar a fome. Ingredientes frescos e massa crocante, direto do forno para sua mesa."
  ],
  "suggestedAdditionals": ["Borda Recheada com Catupiry", "Queijo Extra", "Cebola Caramelizada"]
}

For "doce de leite caseiro", you might suggest:
{
  "suggestedTitles": [
    "Pudim de Doce de Leite Artesanal",
    "Sobremesa Cremosa de Doce de Leite",
    "Delícia Caseira: Pudim de Doce de Leite"
  ],
  "suggestedDescriptions": [
    "Delicie-se com a cremosidade do nosso pudim de doce de leite, feito com receita tradicional e um toque especial de caramelo.",
    "Uma sobremesa suave e saborosa, nosso pudim de doce de leite é a pedida certa para adoçar o seu dia.",
    "Feito com carinho e os melhores ingredientes, este pudim de doce de leite vai te conquistar na primeira colherada."
  ],
  "suggestedAdditionals": ["Calda Extra", "Raspas de Coco"]
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
        console.warn("AI suggestion returned null/undefined output for keywords:", input.keywords);
        return {
          suggestedTitles: [`Item de ${input.keywords}`], 
          suggestedDescriptions: [`Descrição para ${input.keywords}.`],
          suggestedAdditionals: []
        };
      }
      // Ensure arrays are always present, even if empty, to match schema if model omits them
      return {
        suggestedTitles: output.suggestedTitles || [],
        suggestedDescriptions: output.suggestedDescriptions || [],
        suggestedAdditionals: output.suggestedAdditionals || [],
      };
    } catch (error) {
      console.error("Error in suggestItemDetailsFlow for keywords:", input.keywords, error);
       return {
          suggestedTitles: [`Erro ao sugerir para ${input.keywords}`],
          suggestedDescriptions: ["Não foi possível gerar sugestões no momento."],
          suggestedAdditionals: []
        };
    }
  }
);
