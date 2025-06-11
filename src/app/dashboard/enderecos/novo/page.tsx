
"use client";

import { useState, type FormEvent } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, type FirebaseError } from 'firebase/firestore';

export default function NovoEnderecoPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [cep, setCep] = useState('');
  const [complemento, setComplemento] = useState('');
  const [referencia, setReferencia] = useState('');
  const [clienteNome, setClienteNome] = useState(''); // Campo para nome do cliente, caso não venha de um pedido
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!rua.trim() || !bairro.trim() || !cidade.trim() || !cep.trim()) {
        toast({ title: "Campos obrigatórios", description: "Rua, Bairro, Cidade e CEP são obrigatórios.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
      const enderecosCollectionRef = collection(db, 'enderecos');
      await addDoc(enderecosCollectionRef, {
        rua: rua.trim(),
        numero: numero.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        cep: cep.trim(),
        complemento: complemento.trim(),
        referencia: referencia.trim(),
        clienteNome: clienteNome.trim() || null, // Salva como null se não preenchido
        dataCriacao: serverTimestamp(),
      });

      toast({ title: "Endereço salvo!", description: "O novo endereço foi salvo com sucesso no Firestore." });
      router.push('/dashboard/enderecos');
    } catch (error) {
      const firestoreError = error as FirebaseError;
      console.error("Erro ao salvar endereço: ", firestoreError);
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar o endereço.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/enderecos">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Endereços</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Adicionar Novo Endereço</h1>
          <p className="text-muted-foreground">
            Preencha os detalhes do endereço.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Endereço</CardTitle>
            <CardDescription>
              Preencha todos os campos para cadastrar o endereço.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="clienteNome">Nome do Cliente (Opcional)</Label>
              <Input id="clienteNome" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Nome do cliente para este endereço" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="rua">Rua / Avenida <span className="text-destructive">*</span></Label>
                <Input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Ex: Rua das Palmeiras" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 123" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="bairro">Bairro <span className="text-destructive">*</span></Label>
                <Input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Ex: Centro" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cep">CEP <span className="text-destructive">*</span></Label>
                <Input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="Ex: 12345-678" required />
              </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="cidade">Cidade <span className="text-destructive">*</span></Label>
                <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: Cidade Exemplo" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="complemento">Complemento</Label>
              <Input id="complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Ex: Apto 101, Bloco B" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="referencia">Ponto de Referência</Label>
              <Textarea id="referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ex: Próximo ao mercado, em frente à praça" rows={2} />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" asChild type="button" disabled={isLoading}>
                <Link href="/dashboard/enderecos">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Endereço"
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
    
