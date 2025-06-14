
"use client";

import React, { useState, useEffect, type FormEvent, useCallback } from 'react'; 
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, AlertCircle, Save } from "lucide-react"; // Added Save
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp, type FirestoreError } from 'firebase/firestore';

interface EnderecoFormData {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  complemento: string;
  referencia: string;
  clienteNome?: string; 
}

interface EditarEnderecoFormProps {
  enderecoId: string;
}

function OriginalEditarEnderecoForm({ enderecoId }: EditarEnderecoFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<EnderecoFormData>({
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: '',
    complemento: '',
    referencia: '',
    clienteNome: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (enderecoId) {
      const fetchEndereco = async () => {
        setIsFetching(true);
        setNotFound(false);
        try {
          const enderecoDocRef = doc(db, 'enderecos', enderecoId);
          const enderecoDocSnap = await getDoc(enderecoDocRef);

          if (enderecoDocSnap.exists()) {
            const enderecoData = enderecoDocSnap.data();
            setFormData({
              rua: enderecoData.rua || '',
              numero: enderecoData.numero || '',
              bairro: enderecoData.bairro || '',
              cidade: enderecoData.cidade || '',
              cep: enderecoData.cep || '',
              complemento: enderecoData.complemento || '',
              referencia: enderecoData.referencia || '',
              clienteNome: enderecoData.clienteNome || '',
            });
          } else {
            setNotFound(true);
            toast({ title: "Erro", description: "Endereço não encontrado para edição.", variant: "destructive" });
          }
        } catch (error) {
            const firestoreError = error as FirestoreError;
            console.error("Erro ao buscar endereço para edição:", firestoreError);
            setNotFound(true); 
            toast({ title: "Erro ao carregar", description: "Não foi possível carregar os dados do endereço.", variant: "destructive" });
        } finally {
          setIsFetching(false);
        }
      };
      fetchEndereco();
    }
  }, [enderecoId, toast]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!formData.rua.trim() || !formData.bairro.trim() || !formData.cidade.trim() || !formData.cep.trim()) {
        toast({ title: "Campos obrigatórios", description: "Rua, Bairro, Cidade e CEP são obrigatórios.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    
    try {
      const enderecoDocRef = doc(db, 'enderecos', enderecoId);
      await updateDoc(enderecoDocRef, {
        ...formData, 
        clienteNome: formData.clienteNome?.trim() || null, 
        dataModificacao: serverTimestamp(), 
      });
      toast({ title: "Endereço atualizado!", description: "As alterações foram salvas com sucesso no Firestore." });
      router.push('/dashboard/enderecos');
    } catch (error) {
      const firestoreError = error as FirestoreError;
      console.error("Erro ao atualizar endereço: ", firestoreError);
      toast({ title: "Erro ao salvar", description: "Não foi possível atualizar o endereço.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [formData, enderecoId, router, toast]);
  
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
         <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5"/> Erro</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    O endereço com ID <span className="font-semibold text-primary">{typeof enderecoId === 'string' ? enderecoId.substring(0,7) : 'N/A'}...</span> não foi encontrado ou não pôde ser carregado.
                </p>
                <p className="text-muted-foreground mt-2">
                Verifique se o ID está correto ou <Link href="/dashboard/enderecos" className="text-primary hover:underline">volte para a lista de endereços</Link>.
                </p>
            </CardContent>
        </Card>
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
            Modificando o endereço ID: <span className="font-semibold text-primary">{typeof enderecoId === 'string' ? enderecoId.substring(0,7) : 'N/A'}...</span>
            {formData.clienteNome && ` (Cliente: ${formData.clienteNome})`}
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
            <div className="space-y-1">
                <Label htmlFor="clienteNome">Nome do Cliente (Opcional)</Label>
                <Input id="clienteNome" name="clienteNome" value={formData.clienteNome || ''} onChange={handleChange} placeholder="Nome do cliente para este endereço" disabled={isLoading}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="rua">Rua / Avenida <span className="text-destructive">*</span></Label>
                <Input id="rua" name="rua" value={formData.rua} onChange={handleChange} placeholder="Ex: Rua das Palmeiras" required disabled={isLoading}/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" name="numero" value={formData.numero} onChange={handleChange} placeholder="Ex: 123" disabled={isLoading}/>
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="bairro">Bairro <span className="text-destructive">*</span></Label>
                    <Input id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} placeholder="Ex: Centro" required disabled={isLoading}/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="cep">CEP <span className="text-destructive">*</span></Label>
                    <Input id="cep" name="cep" value={formData.cep} onChange={handleChange} placeholder="Ex: 12345-678" required disabled={isLoading}/>
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="cidade">Cidade <span className="text-destructive">*</span></Label>
                <Input id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Ex: Cidade Exemplo" required disabled={isLoading}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="complemento">Complemento</Label>
              <Input id="complemento" name="complemento" value={formData.complemento} onChange={handleChange} placeholder="Ex: Apto 101, Bloco B" disabled={isLoading}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="referencia">Ponto de Referência</Label>
              <Textarea id="referencia" name="referencia" value={formData.referencia} onChange={handleChange} placeholder="Ex: Próximo ao mercado, em frente à praça" rows={2} disabled={isLoading}/>
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
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
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

const EditarEnderecoForm = React.memo(OriginalEditarEnderecoForm);
export default EditarEnderecoForm;
