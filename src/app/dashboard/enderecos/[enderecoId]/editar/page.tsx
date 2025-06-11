
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dados de exemplo para simulação de busca
const mockEnderecos = [
  { id: "END001", rua: "Rua das Palmeiras", numero: "123", bairro: "Centro", cidade: "Cidade Exemplo", cep: "12345-678", complemento: "Apto 101", referencia: "Próximo ao mercado" },
  { id: "END002", rua: "Avenida Principal", numero: "789", bairro: "Jardim das Flores", cidade: "Cidade Exemplo", cep: "98765-432", complemento: "", referencia: "Em frente à praça" },
  { id: "END003", rua: "Travessa dos Coqueiros", numero: "45B", bairro: "Vila Nova", cidade: "Cidade Exemplo", cep: "54321-876", complemento: "Casa com portão verde", referencia: "Ao lado da padaria" },
];

export default function EditarEnderecoPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const enderecoId = params.enderecoId as string;

  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [cep, setCep] = useState('');
  const [complemento, setComplemento] = useState('');
  const [referencia, setReferencia] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (enderecoId) {
      setIsFetching(true);
      // Simula a busca do endereço
      const enderecoExistente = mockEnderecos.find(end => end.id === enderecoId);
      
      setTimeout(() => { // Simula delay da API
        if (enderecoExistente) {
          setRua(enderecoExistente.rua);
          setNumero(enderecoExistente.numero);
          setBairro(enderecoExistente.bairro);
          setCidade(enderecoExistente.cidade);
          setCep(enderecoExistente.cep);
          setComplemento(enderecoExistente.complemento || '');
          setReferencia(enderecoExistente.referencia || '');
          setNotFound(false);
        } else {
          setNotFound(true);
          toast({ title: "Erro", description: "Endereço não encontrado para edição.", variant: "destructive" });
        }
        setIsFetching(false);
      }, 500);
    }
  }, [enderecoId, toast]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!rua.trim() || !bairro.trim() || !cidade.trim() || !cep.trim()) {
        toast({ title: "Campos obrigatórios", description: "Rua, Bairro, Cidade e CEP são obrigatórios.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    // Simulação de salvamento
    console.log("Salvando alterações para o endereço ID:", enderecoId, { rua, numero, bairro, cidade, cep, complemento, referencia });
    
    // TODO: Integrar com Firestore para ATUALIZAR o endereço
    // try {
    //   // Lógica para atualizar no Firestore usando enderecoId
    //   toast({ title: "Endereço atualizado!", description: "As alterações foram salvas com sucesso." });
    //   router.push('/dashboard/enderecos');
    // } catch (error) {
    //   toast({ title: "Erro ao salvar", description: "Não foi possível atualizar o endereço.", variant: "destructive" });
    // } finally {
    //   setIsLoading(false);
    // }

    // Simulação de sucesso e redirecionamento
    setTimeout(() => {
      toast({
        title: "Alterações 'salvas' (simulado)!",
        description: `Os dados do endereço ID: ${enderecoId} foram registrados no console.`,
      });
      router.push('/dashboard/enderecos');
      setIsLoading(false);
    }, 1000);
  };
  
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando dados do endereço...</p>
      </div>
    );
  }

  if (notFound) {
    return (
       <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/enderecos">
                <ArrowLeft className="h-4 w-4" />
            </Link>
            </Button>
            <h1 className="text-2xl font-bold font-headline text-destructive">Endereço não encontrado</h1>
        </div>
        <p className="text-muted-foreground">
            O endereço com ID <span className="font-semibold text-primary">{enderecoId}</span> não foi encontrado.
            Verifique se o ID está correto ou <Link href="/dashboard/enderecos" className="text-primary hover:underline">volte para a lista de endereços</Link>.
        </p>
      </div>
    )
  }


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
          <h1 className="text-3xl font-bold font-headline">Editar Endereço</h1>
          <p className="text-muted-foreground">
            Modificando o endereço ID: <span className="font-semibold text-primary">{enderecoId}</span>
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes do Endereço</CardTitle>
            <CardDescription>
              Altere os campos necessários abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Button type="submit" disabled={isLoading || isFetching}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
