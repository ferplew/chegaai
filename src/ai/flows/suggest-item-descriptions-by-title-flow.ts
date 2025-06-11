"use client";

import { useState, type FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // For image preview
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, DollarSign, ImageIcon, UploadCloud, Sparkles, Wand2, Trash2, PlusCircle, Info, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestItemDetails, type SuggestItemDetailsOutput } from '@/ai/flows/suggest-item-details-flow';
import { generateItemImage, type GenerateItemImageOutput } from '@/ai/flows/generate-item-image-flow';
// import { db } from '@/lib/firebase/config'; // Para o próximo passo
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Para o próximo passo

interface Adicional {
  id: string; // for unique key in map
  nome: string;
  valor: number | '';
}

export default function NovoItemPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Main form fields
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState<number | ''>('');
  const [categoria, setCategoria] = useState('');
  
  // Adicionais
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [novoAdicionalNome, setNovoAdicionalNome] = useState('');
  const [novoAdicionalValor, setNovoAdicionalValor] = useState<number | ''>('');

  // Image handling
  const [imagemUrl, setImagemUrl] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  // AI Text Suggestions
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiSuggestedTitles, setAiSuggestedTitles] = useState<string[] | null>(null);
  const [aiSuggestedDescriptions, setAiSuggestedDescriptions] = useState<string[] | null>(null);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);
  const [selectedAiTitle, setSelectedAiTitle] = useState<string | null>(null);
  const [selectedAiDescription, setSelectedAiDescription] = useState<string | null>(null);

  // AI Image Generation
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [isLoadingAiImage, setIsLoadingAiImage] = useState(false);

  // Placeholder para categorias - será carregado do Firestore depois
  const categoriasMock = [
    { id: 'pizzas', nome: 'Pizzas' },
    { id: 'burgers', nome: 'Hambúrgueres' },
    { id: 'bebidas', nome: 'Bebidas' },
    { id: 'sobremesas', nome: 'Sobremesas' },
    { id: 'porcoes', nome: 'Porções' },
    { id: 'pratos', nome: 'Pratos Executivos' },
  ];

  useEffect(() => {
    if (imagemArquivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
      };
      reader.readAsDataURL(imagemArquivo);
      setImagemUrl(''); 
      setAiGeneratedImage(null); 
    } else if (imagemUrl) {
      setImagemPreview(imagemUrl);
      setAiGeneratedImage(null); 
    } else if (aiGeneratedImage) {
      setImagemPreview(aiGeneratedImage);
    } else {
      setImagemPreview(null);
    }
  }, [imagemUrl, imagemArquivo, aiGeneratedImage]);


  const handleSuggestDetails = async () => {
    if (!aiKeywords.trim()) {
      toast({ title: "Palavras-chave vazias", description: "Digite algumas palavras-chave para a IA.", variant: "destructive" });
      return;
    }
    setIsLoadingAiSuggestions(true);
    setAiSuggestedTitles(null);
    setAiSuggestedDescriptions(null);
    setSelectedAiTitle(null);
    setSelectedAiDescription(null);
    try {
      const result = await suggestItemDetails({ keywords: aiKeywords });
      setAiSuggestedTitles(result.suggestedTitles || []);
      setAiSuggestedDescriptions(result.suggestedDescriptions || []);
      toast({ title: "Sugestões Prontas!", description: "A IA preparou sugestões de título e descrição." });
    } catch (error) {
      console.error("Erro ao sugerir detalhes:", error);
      toast({ title: "Erro da IA", description: "Não foi possível gerar sugestões. Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  };

  const handleApplyAiTitle = (title: string) => {
    setNome(title);
    setSelectedAiTitle(title);
  };

  const handleApplyAiDescription = (description: string) => {
    setDescricao(description);
    setSelectedAiDescription(description);
  };

  const handleGenerateImage = async () => {
    if (!nome.trim()) {
      toast({ title: "Nome do item vazio", description: "Digite um nome para o item antes de gerar a imagem.", variant: "destructive" });
      return;
    }
    setIsLoadingAiImage(true);
    setAiGeneratedImage(null);
    setImagemArquivo(null);
    setImagemUrl('');
    try {
      const result = await generateItemImage({ title: nome });
      if (result.imageDataUri) {
        setAiGeneratedImage(result.imageDataUri);
        toast({ title: "Imagem Gerada!", description: "A IA criou uma imagem para seu item." });
      } else {
         toast({ title: "Erro da IA", description: "A IA não retornou uma imagem.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast({ title: "Erro da IA", description: "Não foi possível gerar a imagem. Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoadingAiImage(false);
    }
  };
  
  const handleAddAdicional = () => {
    if (!novoAdicionalNome.trim()) {
      toast({ title: "Nome do adicional vazio", variant: "destructive" });
      return;
    }
    if (novoAdicionalValor === '' || Number(novoAdicionalValor) < 0) {
      toast({ title: "Valor do adicional inválido", variant: "destructive" });
      return;
    }
    setAdicionais([...adicionais, { id: Date.now().toString(), nome: novoAdicionalNome.trim(), valor: Number(novoAdicionalValor) }]);
    setNovoAdicionalNome('');
    setNovoAdicionalValor('');
  };

  const handleRemoveAdicional = (idToRemove: string) => {
    setAdicionais(adicionais.filter(adicional => adicional.id !== idToRemove));
  };


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // setIsLoading(true); // Re-enable when Firestore save is active

    if (!nome.trim()) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe o nome do item.", variant: "destructive" });
      // setIsLoading(false);
      return;
    }
    if (valor === '' || Number(valor) <= 0) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe um valor válido para o item.", variant: "destructive" });
      // setIsLoading(false);
      return;
    }
    if (!categoria) {
        toast({ title: "Campo obrigatório", description: "Por favor, selecione uma categoria.", variant: "destructive" });
        // setIsLoading(false);
        return;
    }

    const itemData = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      valor: Number(valor),
      categoria,
      adicionais: adicionais.map(({id, ...rest}) => rest), 
      imagemUrl: aiGeneratedImage || imagemUrl.trim(), 
      imagemArquivoNome: imagemArquivo ? imagemArquivo.name : null,
      foiGeradoPorIA: !!aiGeneratedImage,
    };

    console.log("Dados do Item para Salvar:", itemData);

    toast({
      title: "Item Configurado (Simulação)",
      description: "Os dados do item foram preparados. Verifique o console. Integração com Firestore no próximo passo.",
    });
    
    // router.push('/dashboard/produtos'); 
    // setIsLoading(false); // Re-enable
  };

  return (
    <div className="space-y-6 mb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/produtos">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Itens</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Adicionar Novo Item</h1>
          <p className="text-muted-foreground">
            Preencha os detalhes ou use a IA para ajudar.
          </p>
        </div>
      </div>

      {/* AI Suggestions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> Assistente IA</CardTitle>
          <CardDescription>
            Digite palavras-chave (ex: "pizza calabresa grande queijo") e deixe a IA sugerir títulos e descrições.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="aiKeywords"
              placeholder="Ex: burger artesanal bacon cheddar"
              value={aiKeywords}
              onChange={(e) => setAiKeywords(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleSuggestDetails} disabled={isLoadingAiSuggestions} className="w-full sm:w-auto">
              {isLoadingAiSuggestions ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
              Sugerir com IA
            </Button>
          </div>
          {(aiSuggestedTitles && aiSuggestedTitles.length > 0) && (
            <div className="space-y-2 p-4 border rounded-md bg-muted/30">
              <Label className="font-semibold text-base">Títulos Sugeridos:</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {aiSuggestedTitles.map((title, index) => (
                  <Button
                    key={`title-${index}`}
                    type="button"
                    variant={selectedAiTitle === title ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleApplyAiTitle(title)}
                    className="text-left justify-start h-auto py-2 leading-snug"
                  >
                    {selectedAiTitle === title && <CheckCircle className="h-4 w-4 mr-2 text-primary-foreground group-hover:text-primary-foreground" />}
                    {title}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {(aiSuggestedDescriptions && aiSuggestedDescriptions.length > 0) && (
             <div className="space-y-2 p-4 border rounded-md bg-muted/30 mt-4">
              <Label className="font-semibold text-base">Descrições Sugeridas:</Label>
                {aiSuggestedDescriptions.map((desc, index) => (
                  <Button
                      key={`desc-${index}`}
                      type="button"
                      variant={selectedAiDescription === desc ? "secondary" : "outline"}
                      onClick={() => handleApplyAiDescription(desc)}
                      className="w-full text-left justify-start h-auto py-2 mb-1 whitespace-normal leading-snug text-sm hover:bg-accent/50"
                    >
                    <div className="flex items-start w-full">
                      {selectedAiDescription === desc && <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-secondary-foreground" />}
                      <span className="flex-1">{desc}</span>
                    </div>
                    </Button>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes do Item</CardTitle>
            <CardDescription>
              Preencha as informações básicas, preço e imagem do item.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Item <span className="text-destructive">*</span></Label>
              <Input
                id="nome"
                placeholder="Ex: Pizza Margherita Grande"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if(selectedAiTitle) setSelectedAiTitle(null); 
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Molho de tomate fresco, mozzarella de búfala, manjericão..."
                value={descricao}
                onChange={(e) => {
                  setDescricao(e.target.value);
                  if(selectedAiDescription) setSelectedAiDescription(null);
                }}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="valor">Valor Base (R$) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="valor"
                            type="number"
                            placeholder="Ex: 45.00"
                            value={valor}
                            onChange={(e) => setValor(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            min="0.01"
                            step="0.01"
                            required
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria <span className="text-destructive">*</span></Label>
                    <Select value={categoria} onValueChange={setCategoria} name="categoria" required>
                        <SelectTrigger id="categoria">
                            <SelectValue placeholder="Selecione uma categoria..." />
                        </SelectTrigger>
                        <SelectContent>
                            {categoriasMock.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary"/>
                Adicionais do Item
              </h3>
              <p className="text-xs text-muted-foreground -mt-3">
                Ex: Borda recheada, Queijo extra, Bacon. Deixe em branco se não houver.
              </p>
              <div className="space-y-2">
                {adicionais.map((adicional) => (
                  <div key={adicional.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                    <span className="flex-grow text-sm">{adicional.nome} - R$ {Number(adicional.valor).toFixed(2)}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAdicional(adicional.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-grow space-y-1">
                  <Label htmlFor="novoAdicionalNome" className="text-xs">Nome do Adicional</Label>
                  <Input id="novoAdicionalNome" value={novoAdicionalNome} onChange={(e) => setNovoAdicionalNome(e.target.value)} placeholder="Ex: Cheddar Extra"/>
                </div>
                <div className="w-full sm:w-32 space-y-1">
                  <Label htmlFor="novoAdicionalValor" className="text-xs">Valor (R$)</Label>
                  <Input id="novoAdicionalValor" type="number" value={novoAdicionalValor} onChange={(e) => setNovoAdicionalValor(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="Ex: 3.50" min="0" step="0.01" />
                </div>
                <Button type="button" variant="outline" onClick={handleAddAdicional} className="w-full sm:w-auto">Adicionar</Button>
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-md">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary"/>
                    Imagem do Item
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="imagemUrl">URL da Imagem</Label>
                            <Input
                                id="imagemUrl"
                                type="url"
                                placeholder="https://exemplo.com/imagem.png"
                                value={imagemUrl}
                                onChange={(e) => { setImagemUrl(e.target.value); setImagemArquivo(null); setAiGeneratedImage(null); }}
                            />
                        </div>
                         <div className="text-center text-sm text-muted-foreground my-2">OU</div>
                        <div className="space-y-2">
                            <Label htmlFor="imagemArquivo">Upload de Imagem (Max 2MB)</Label>
                             <Input 
                                id="imagemArquivo" 
                                type="file" 
                                accept="image/png, image/jpeg, image/webp"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 2 * 1024 * 1024) { 
                                        toast({ title: "Arquivo muito grande", description: "Selecione uma imagem menor que 2MB.", variant: "destructive"});
                                        setImagemArquivo(null);
                                      } else {
                                        setImagemArquivo(file);
                                        setImagemUrl('');
                                        setAiGeneratedImage(null);
                                      }
                                    }
                                }}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        </div>
                        <div className="text-center text-sm text-muted-foreground my-2">OU</div>
                         <Button type="button" onClick={handleGenerateImage} disabled={isLoadingAiImage || !nome.trim()} className="w-full">
                            {isLoadingAiImage ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                            Gerar Imagem com IA (usando nome do item)
                        </Button>
                        {isLoadingAiImage && <p className="text-xs text-muted-foreground text-center">A IA está criando, pode levar alguns segundos...</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Pré-visualização</Label>
                        <div className="h-48 w-full rounded-md border border-dashed bg-muted/30 flex items-center justify-center overflow-hidden">
                            {imagemPreview ? (
                                <Image src={imagemPreview} alt="Pré-visualização" width={200} height={192} className="object-contain max-h-full max-w-full" data-ai-hint="food item" />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                                    <p className="text-xs">Nenhuma imagem selecionada, fornecida ou gerada.</p>
                                </div>
                            )}
                        </div>
                        {aiGeneratedImage && imagemPreview === aiGeneratedImage && (
                             <p className="text-xs text-primary text-center flex items-center justify-center gap-1"><Info className="h-3 w-3"/> Imagem gerada pela IA. Você pode substituí-la.</p>
                        )}
                    </div>
                </div>
            </div>


          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" asChild type="button">
                    <Link href="/dashboard/produtos">Cancelar</Link>
                </Button>
                <Button type="submit">
                    Salvar Item (Simulação)
                </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}