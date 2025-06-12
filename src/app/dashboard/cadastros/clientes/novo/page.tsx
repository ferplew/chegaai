
"use client";

import React, { useState, type FormEvent } from 'react'; // Adicionado React
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, UserPlus, MapPin } from "lucide-react";
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, type FirebaseError } from 'firebase/firestore';

function OriginalNovoClientePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Campos de endereço
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [cep, setCep] = useState('');
  const [complemento, setComplemento] = useState('');
  const [referencia, setReferencia] = useState('');


  const resetForm = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setRua('');
    setNumero('');
    setBairro('');
    setCidade('');
    setCep('');
    setComplemento('');
    setReferencia('');
  };

  const isValidEmail = (email: string): boolean => {
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
    
    const enderecoData = (rua.trim() || cidade.trim() || cep.trim()) ? {
        rua: rua.trim() || null,
        numero: numero.trim() || null,
        bairro: bairro.trim() || null,
        cidade: cidade.trim() || null,
        cep: cep.trim() || null,
        complemento: complemento.trim() || null,
        referencia: referencia.trim() || null,
    } : null;


    try {
      const clientesCollectionRef = collection(db, 'clientes');
      await addDoc(clientesCollectionRef, {
        nome: nomeTrimmed,
        nomeLower: nomeTrimmed.toLowerCase(),
        email: emailTrimmed || null,
        telefone: telefone.trim() || null,
        endereco: enderecoData,
        dataCadastro: serverTimestamp(),
      });

      toast({
        title: "Cliente cadastrado!",
        description: `O cliente "${nomeTrimmed}" foi salvo com sucesso.`,
      });
      
      resetForm();
      router.push('/dashboard/cadastros/clientes'); 

    } catch (error) {
      const firestoreError = error as FirebaseError;
      console.error("Erro ao salvar cliente: ", firestoreError);
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
    <div className="space-y-6 max-w-3xl mx-auto mb-12">
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

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="email">E-mail (Opcional)</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="cliente@chegaai.delivery"
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
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/> Endereço (Opcional)</CardTitle>
            <CardDescription>
              Preencha os dados de endereço do cliente, se aplicável.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="rua">Rua / Avenida</Label>
                    <Input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Ex: Rua das Palmeiras" disabled={isLoading}/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="numero">Número</Label>
                    <Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 123" disabled={isLoading}/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Ex: Centro" disabled={isLoading}/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="Ex: 12345-678" disabled={isLoading}/>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: Cidade Exemplo" disabled={isLoading}/>
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="complemento">Complemento</Label>
                <Input id="complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Ex: Apto 101, Bloco B" disabled={isLoading}/>
            </div>
            <div className="space-y-1">
                <Label htmlFor="referencia">Ponto de Referência</Label>
                <Textarea id="referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ex: Próximo ao mercado, portão verde" rows={2} disabled={isLoading}/>
            </div>
          </CardContent>
           <CardFooter className="border-t px-6 py-4 mt-6">
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
        </Card>
      </form>
    </div>
  );
}

const NovoClientePage = React.memo(OriginalNovoClientePage);
export default NovoClientePage;
