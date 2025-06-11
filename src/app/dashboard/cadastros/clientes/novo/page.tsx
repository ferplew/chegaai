
"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, UserPlus } from "lucide-react";
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export default function NovoClientePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setNome('');
    setEmail('');
    setTelefone('');
  };

  const isValidEmail = (email: string): boolean => {
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const nomeTrimmed = nome.trim();
    const emailTrimmed = email.trim();

    if (!nomeTrimmed) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe o nome do cliente.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (emailTrimmed && !isValidEmail(emailTrimmed)) {
      toast({ title: "E-mail inválido", description: "Por favor, informe um e-mail válido.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    // Opcional: Verificar se o cliente (por e-mail ou nome+telefone) já existe para evitar duplicatas exatas
    // Para simplificar, esta verificação não será adicionada agora, mas pode ser um refinamento.

    try {
      const clientesCollectionRef = collection(db, 'clientes');
      await addDoc(clientesCollectionRef, {
        nome: nomeTrimmed,
        nomeLower: nomeTrimmed.toLowerCase(), // Para busca e ordenação case-insensitive
        email: emailTrimmed || null, // Salva como null se vazio
        telefone: telefone.trim() || null, // Salva como null se vazio
        dataCadastro: serverTimestamp(),
      });

      toast({
        title: "Cliente cadastrado!",
        description: `O cliente "${nomeTrimmed}" foi salvo com sucesso.`,
      });
      
      resetForm();
      router.push('/dashboard/cadastros/clientes'); 

    } catch (error) {
      console.error("Erro ao salvar cliente: ", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível cadastrar o cliente. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/cadastros/clientes">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Clientes</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <UserPlus className="h-7 w-7 text-primary"/>
            Novo Cliente
          </h1>
          <p className="text-muted-foreground">
            Adicione um novo cliente à sua base de dados.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
            <CardDescription>
              Preencha os dados do cliente. O nome é obrigatório.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo <span className="text-destructive">*</span></Label>
              <Input
                id="nome"
                placeholder="Nome do cliente"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail (Opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone/WhatsApp (Opcional)</Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(00) 90000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {/* Adicionar mais campos como CPF/CNPJ, Endereço se necessário no futuro */}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" asChild type="button" disabled={isLoading}>
                    <Link href="/dashboard/cadastros/clientes">Cancelar</Link>
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
                        Salvar Cliente
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
