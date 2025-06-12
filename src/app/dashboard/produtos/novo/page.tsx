
"use client";

import React, { useState, type FormEvent, useEffect, useCallback } from 'react'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, DollarSign, ImageIcon, Sparkles, Wand2, Trash2, PlusCircle, Info, CheckCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestItemDetails, type SuggestItemDetailsOutput } from '@/ai/flows/suggest-item-details-flow';
import { generateItemImage, type GenerateItemImageOutput } from '@/ai/flows/generate-item-image-flow';

import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, type FirestoreError } from 'firebase/firestore';
import { ref as storageRef, uploadString, uploadBytesResumable, getDownloadURL, type StorageError } from 'firebase/storage';

interface Adicional {
  id: string; 
  nome: string;
  valor: number | '';
}

function OriginalNovoItemPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState<number | ''>('');
  const [categoria, setCategoria] = useState('');
  
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [novoAdicionalNome, setNovoAdicionalNome] = useState('');
  const [novoAdicionalValor, setNovoAdicionalValor] = useState<number | ''>('');

  const [imagemUrl, setImagemUrl] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  const [aiKeywords, setAiKeywords] = useState('');
  const [aiSuggestedTitles, setAiSuggestedTitles] = useState<string[] | null>(null);
  const [aiSuggestedDescriptions, setAiSuggestedDescriptions] = useState<string[] | null>(null);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);
  const [selectedAiTitle, setSelectedAiTitle] = useState<string | null>(null);
  const [selectedAiDescription, setSelectedAiDescription] = useState<string | null>(null);

  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [isLoadingAiImage, setIsLoadingAiImage] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);


  const categoriasMock = [
    { id: 'pizzas', nome: 'Pizzas' },
    { id: 'burgers', nome: 'Hambúrgueres' },
    { id: 'bebidas', nome: 'Bebidas' },
    { id: 'sobremesas', nome: 'Sobremesas' },
    { id: 'porcoes', nome: 'Porções' },
    { id: 'pratos', nome: 'Pratos Executivos' },
  ];

  useEffect(() => {
    if (aiGeneratedImage) {
      setImagemPreview(aiGeneratedImage);
    } else if (imagemArquivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
      };
      reader.readAsDataURL(imagemArquivo);
    } else if (imagemUrl) {
      setImagemPreview(imagemUrl);
    } else {
      setImagemPreview(null);
    }
  }, [imagemUrl, imagemArquivo, aiGeneratedImage]);


  const handleSuggestDetails = useCallback(async () => {
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
  }, [aiKeywords, toast]);

  const handleApplyAiTitle = useCallback((title: string) => {
    setNome(title);
    setSelectedAiTitle(title);
  }, []);

  const handleApplyAiDescription = useCallback((description: string) => {
    setDescricao(description);
    setSelectedAiDescription(description);
  }, []);

  const handleGenerateImage = useCallback(async () => {
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
  }, [nome, toast]);
  
  const handleAddAdicional = useCallback(() => {
    if (!novoAdicionalNome.trim()) {
      toast({ title: "Nome do adicional vazio", variant: "destructive" });
      return;
    }
    if (novoAdicionalValor === '' || Number(novoAdicionalValor) < 0) {
      toast({ title: "Valor do adicional inválido", variant: "destructive" });
      return;
    }
    setAdicionais(prevAdicionais => [...prevAdicionais, { id: Date.now().toString(), nome: novoAdicionalNome.trim(), valor: Number(novoAdicionalValor) }]);
    setNovoAdicionalNome('');
    setNovoAdicionalValor('');
  }, [novoAdicionalNome, novoAdicionalValor, toast]);

  const handleRemoveAdicional = useCallback((idToRemove: string) => {
    setAdicionais(prevAdicionais => prevAdicionais.filter(adicional => adicional.id !== idToRemove));
  }, []);

  const resetForm = useCallback(() => {
    setNome('');
    setDescricao('');
    setValor('');
    setCategoria('');
    setAdicionais([]);
    setNovoAdicionalNome('');
    setNovoAdicionalValor('');
    setImagemUrl('');
    setImagemArquivo(null);
    setImagemPreview(null);
    setAiKeywords('');
    setAiSuggestedTitles(null);
    setAiSuggestedDescriptions(null);
    setSelectedAiTitle(null);
    setSelectedAiDescription(null);
    setAiGeneratedImage(null);
  }, []);

  const getFinalImageUrl = useCallback(async (): Promise<string | null> => {
    const imageNamePrefix = nome.trim().toLowerCase().replace(/\s+/g, '_') || 'item';
    
    if (aiGeneratedImage) { 
      try {
        const imageRef = storageRef(storage, `produtos/${imageNamePrefix}_ai_${Date.now()}.png`);
        const uploadResult = await uploadString(imageRef, aiGeneratedImage, 'data_url');
        return await getDownloadURL(uploadResult.ref);
      } catch (error) {
        const storageError = error as StorageError;
        console.error("Erro ao fazer upload da imagem gerada por IA:", storageError);
        toast({ title: "Erro no Upload", description: "Falha ao salvar imagem da IA.", variant: "destructive" });
        return null;
      }
    } else if (imagemArquivo) { 
      try {
        const imageRef = storageRef(storage, `produtos/${imageNamePrefix}_file_${Date.now()}_${imagemArquivo.name}`);
        const uploadTask = uploadBytesResumable(imageRef, imagemArquivo);
        
        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => { /* Progress can be handled here if needed */ },
            (error) => {
              const storageError = error as StorageError;
              console.error("Erro ao fazer upload do arquivo de imagem:", storageError);
              toast({ title: "Erro no Upload", description: "Falha ao salvar imagem carregada.", variant: "destructive" });
              reject(null);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      } catch (error) { 
        const storageError = error as StorageError;
        console.error("Exceção no upload do arquivo de imagem:", storageError);
        toast({ title: "Erro no Upload", description: "Exceção ao salvar imagem carregada.", variant: "destructive" });
        return null;
      }
    } else if (imagemUrl.trim()) { 
      return imagemUrl.trim();
    }
    return null; 
  }, [nome, aiGeneratedImage, imagemArquivo, imagemUrl, toast]);


  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    if (!nome.trim()) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe o nome do item.", variant: "destructive" });
      setIsSaving(false); return;
    }
    if (valor === '' || Number(valor) <= 0) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe um valor válido para o item.", variant: "destructive" });
      setIsSaving(false); return;
    }
    if (!categoria) {
        toast({ title: "Campo obrigatório", description: "Por favor, selecione uma categoria.", variant: "destructive" });
        setIsSaving(false); return;
    }

    try {
      const imagemFinalUrl = await getFinalImageUrl();

      const itemDataParaSalvar = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        valor: Number(valor),
        categoria,
        adicionais: adicionais.map(({ id, ...rest }) => rest), 
        imagemUrl: imagemFinalUrl, 
        foiGeradoPorIA: !!aiGeneratedImage && imagemFinalUrl?.includes('_ai_'), 
        dataCriacao: serverTimestamp(),
        ativo: true, 
      };

      const produtosCollectionRef = collection(db, 'produtos');
      await addDoc(produtosCollectionRef, itemDataParaSalvar);

      toast({
        title: "Item Salvo!",
        description: `O item "${itemDataParaSalvar.nome}" foi cadastrado com sucesso.`,
      });
      
      resetForm();
      router.push('/dashboard/produtos'); 

    } catch (error) {
      const firestoreError = error as FirestoreError;
      console.error("Erro ao salvar item: ", firestoreError);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o item. Verifique o console para detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [nome, descricao, valor, categoria, adicionais, aiGeneratedImage, getFinalImageUrl, resetForm, router, toast]);

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
              disabled={isLoadingAiSuggestions || isSaving}
            />
            <Button onClick={handleSuggestDetails} disabled={isLoadingAiSuggestions || isSaving || !aiKeywords.trim()} className="w-full sm:w-auto">
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
                    disabled={isSaving}
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
                      disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                            disabled={isSaving}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria <span className="text-destructive">*</span></Label>
                    <Select value={categoria} onValueChange={setCategoria} name="categoria" required disabled={isSaving}>
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
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAdicional(adicional.id)} className="text-destructive hover:text-destructive" disabled={isSaving}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-grow space-y-1">
                  <Label htmlFor="novoAdicionalNome" className="text-xs">Nome do Adicional</Label>
                  <Input id="novoAdicionalNome" value={novoAdicionalNome} onChange={(e) => setNovoAdicionalNome(e.target.value)} placeholder="Ex: Cheddar Extra" disabled={isSaving}/>
                </div>
                <div className="w-full sm:w-32 space-y-1">
                  <Label htmlFor="novoAdicionalValor" className="text-xs">Valor (R$)</Label>
                  <Input id="novoAdicionalValor" type="number" value={novoAdicionalValor} onChange={(e) => setNovoAdicionalValor(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="Ex: 3.50" min="0" step="0.01" disabled={isSaving}/>
                </div>
                <Button type="button" variant="outline" onClick={handleAddAdicional} className="w-full sm:w-auto" disabled={isSaving}>Adicionar</Button>
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
                                disabled={isSaving || isLoadingAiImage}
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
                                disabled={isSaving || isLoadingAiImage}
                            />
                        </div>
                        <div className="text-center text-sm text-muted-foreground my-2">OU</div>
                         <Button type="button" onClick={handleGenerateImage} disabled={isLoadingAiImage || !nome.trim() || isSaving} className="w-full">
                            {isLoadingAiImage ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                            Gerar Imagem com IA
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
                <Button variant="outline" asChild type="button" disabled={isSaving}>
                    <Link href="/dashboard/produtos">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isSaving || isLoadingAiImage || isLoadingAiSuggestions}>
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {isSaving ? "Salvando Item..." : "Salvar Item"}
                </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

const NovoItemPage = React.memo(OriginalNovoItemPage);
export default NovoItemPage;
