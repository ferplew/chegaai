
"use client";

import React, { useState, type FormEvent, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, type FirestoreError } from 'firebase/firestore';

function OriginalNovaCategoriaForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = useCallback(() => {
    setNome('');
  }, []);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const nomeTrimmed = nome.trim();
    if (!nomeTrimmed) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe o nome da categoria.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const categoriasCollectionRef = collection(db, 'categorias');
      const q = query(categoriasCollectionRef, where('nomeLower', '==', nomeTrimmed.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({
          title: "Categoria já existe",
          description: `A categoria "${nomeTrimmed}" já está cadastrada.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      await addDoc(categoriasCollectionRef, {
        nome: nomeTrimmed,
        nomeLower: nomeTrimmed.toLowerCase(),
        dataCriacao: serverTimestamp(),
      });

      toast({
        title: "Categoria criada!",
        description: `A categoria "${nomeTrimmed}" foi salva com sucesso.`,
      });
      
      resetForm();
      router.push('/dashboard/cadastros/categorias'); 

    } catch (error) {
      const firestoreError = error as FirestoreError;
      console.error("Erro ao salvar categoria: ", firestoreError);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível criar a categoria. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [nome, toast, router, resetForm]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/cadastros/categorias">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Categorias</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Nova Categoria</h1>
          <p className="text-muted-foreground">
            Crie uma nova categoria para seus produtos.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes da Categoria</CardTitle>
            <CardDescription>
              O nome da categoria ajudará a organizar seus itens no cardápio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Categoria <span className="text-destructive">*</span></Label>
              <Input
                id="nome"
                placeholder="Ex: Pizzas, Bebidas, Sobremesas"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" asChild type="button" disabled={isLoading}>
                    <Link href="/dashboard/cadastros/categorias">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                    </>
                    ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Categoria
                    </>
                    )}
                </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

const NovaCategoriaForm = React.memo(OriginalNovaCategoriaForm);
export default NovaCategoriaForm;
