
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
import { ArrowLeft, Loader2, DollarSign, ImageIcon, Trash2, PlusCircle, Info, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, type FirestoreError } from 'firebase/firestore';
import { ref as storageRef, uploadString, uploadBytesResumable, getDownloadURL, type StorageError } from 'firebase/storage';

interface Adicional {
  id: string;
  nome: string;
  valor: number | '';
}

function OriginalNovoProdutoForm() {
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
    if (imagemArquivo) {
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
  }, [imagemUrl, imagemArquivo]);


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
  }, []);

  const getFinalImageUrl = useCallback(async (): Promise<string | null> => {
    const imageNamePrefix = nome.trim().toLowerCase().replace(/\s+/g, '_') || 'item_manual';

    if (imagemArquivo) {
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
  }, [nome, imagemArquivo, imagemUrl, toast]);


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
  }, [nome, descricao, valor, categoria, adicionais, getFinalImageUrl, resetForm, router, toast]);

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
            Preencha os detalhes do item do cardápio.
          </p>
        </div>
      </div>

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
                onChange={(e) => setNome(e.target.value)}
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
                onChange={(e) => setDescricao(e.target.value)}
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
                                onChange={(e) => { setImagemUrl(e.target.value); setImagemArquivo(null); }}
                                disabled={isSaving}
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
                                      }
                                    }
                                }}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Pré-visualização</Label>
                        <div className="h-48 w-full rounded-md border border-dashed bg-muted/30 flex items-center justify-center overflow-hidden">
                            {imagemPreview ? (
                                <Image src={imagemPreview} alt="Pré-visualização" width={200} height={192} className="object-contain max-h-full max-w-full" data-ai-hint="food item" />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                                    <p className="text-xs">Nenhuma imagem selecionada ou fornecida.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" asChild type="button" disabled={isSaving}>
                    <Link href="/dashboard/produtos">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isSaving}>
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

const NovoProdutoForm = React.memo(OriginalNovoProdutoForm);
export default NovoProdutoForm;
