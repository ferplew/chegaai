
"use client";

import React, { useState, type FormEvent } from 'react'; // Adicionado React
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, UserPlus } from "lucide-react";
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, type FirebaseError } from 'firebase/firestore';

function OriginalNovoFuncionarioPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState(''); // Alterado de perfil para funcao
  const [status, setStatus] = useState(true); // true = Ativo, false = Inativo
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setNome('');
    setFuncao(''); // Alterado de perfil para funcao
    setStatus(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!nome.trim() || !funcao.trim()) { // Validar funcao
      toast({ title: "Campos obrigatórios", description: "Nome e Função são obrigatórios.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const funcionariosCollectionRef = collection(db, 'funcionarios');
      await addDoc(funcionariosCollectionRef, {
        nome: nome.trim(),
        funcao: funcao.trim(), // Salvar funcao
        status: status ? 'Ativo' : 'Inativo',
        dataCriacao: serverTimestamp(),
      });

      toast({
        title: "Funcionário Cadastrado!",
        description: `O funcionário ${nome.trim()} foi adicionado à lista.`,
      });
      
      resetForm();
      router.push('/dashboard/usuarios'); 

    } catch (error) {
      const firestoreError = error as FirebaseError;
      console.error("Erro ao cadastrar funcionário: ", firestoreError);
      toast({
        title: "Erro ao Cadastrar",
        description: "Não foi possível cadastrar o funcionário. Verifique o console.",
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
          <Link href="/dashboard/usuarios">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Funcionários</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <UserPlus className="h-7 w-7 text-primary"/>
            Novo Funcionário
          </h1>
          <p className="text-muted-foreground">
            Adicione um membro à sua equipe.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados do Funcionário</CardTitle>
            <CardDescription>
              Preencha as informações para identificar o funcionário e sua função.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo <span className="text-destructive">*</span></Label>
              <Input
                id="nome"
                placeholder="Nome do funcionário"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                 <div className="space-y-2">
                    <Label htmlFor="funcao">Função do Funcionário <span className="text-destructive">*</span></Label>
                    <Input
                        id="funcao"
                        placeholder="Ex: Cozinheiro, Garçom, Caixa"
                        value={funcao}
                        onChange={(e) => setFuncao(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2 flex items-center gap-3 rounded-md border p-3 h-fit bg-card">
                    <Switch id="status" checked={status} onCheckedChange={setStatus} disabled={isLoading} />
                    <Label htmlFor="status" className="mb-0 cursor-pointer">
                        Status do Funcionário
                        <span className="block text-xs text-muted-foreground">
                        {status ? "Funcionário ativo." : "Funcionário inativo."}
                        </span>
                    </Label>
                </div>
            </div>

          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" asChild type="button" disabled={isLoading}>
                    <Link href="/dashboard/usuarios">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                    </>
                    ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Cadastrar Funcionário
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

const NovoFuncionarioPage = React.memo(OriginalNovoFuncionarioPage);
export default NovoFuncionarioPage;
