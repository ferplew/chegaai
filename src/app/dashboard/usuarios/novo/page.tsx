
"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, UserPlus, ShieldAlert } from "lucide-react";
import { auth, db } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

const perfisDisponiveis = [
  { id: 'Admin', nome: 'Administrador' },
  { id: 'Gerente', nome: 'Gerente' },
  { id: 'Operador', nome: 'Operador de Caixa' },
  { id: 'Cozinha', nome: 'Cozinha' },
];

export default function NovoFuncionarioPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState('');
  const [status, setStatus] = useState(true); // true = Ativo, false = Inativo
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setNome('');
    setEmail('');
    setSenha('');
    setConfirmarSenha('');
    setPerfil('');
    setStatus(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!nome.trim() || !email.trim() || !senha.trim() || !perfil) {
      toast({ title: "Campos obrigatórios", description: "Nome, E-mail, Senha e Perfil são obrigatórios.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (senha !== confirmarSenha) {
      toast({ title: "Senhas não coincidem", description: "Por favor, verifique a confirmação da senha.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (senha.length < 6) {
        toast({ title: "Senha muito curta", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
      // Verificar se e-mail já existe no Firebase Auth ou na coleção 'funcionarios'
      const funcionariosCollectionRef = collection(db, 'funcionarios');
      const q = query(funcionariosCollectionRef, where('email', '==', email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
          toast({ title: "E-mail já cadastrado", description: "Este e-mail já está em uso por outro funcionário.", variant: "destructive" });
          setIsLoading(false);
          return;
      }

      // Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      const user = userCredential.user;

      // Salvar detalhes do funcionário no Firestore
      await addDoc(funcionariosCollectionRef, {
        uid: user.uid,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        perfil: perfil,
        status: status ? 'Ativo' : 'Inativo',
        dataCriacao: serverTimestamp(),
      });

      toast({
        title: "Funcionário Cadastrado!",
        description: `O funcionário ${nome.trim()} foi criado com sucesso.`,
      });
      
      resetForm();
      router.push('/dashboard/usuarios'); 

    } catch (error: any) {
      console.error("Erro ao cadastrar funcionário: ", error);
      let errorMessage = "Não foi possível cadastrar o funcionário. Verifique o console.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este e-mail já está cadastrado no sistema de autenticação.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "A senha fornecida é muito fraca.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "O formato do e-mail é inválido.";
      }
      toast({
        title: "Erro ao Cadastrar",
        description: errorMessage,
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
            Crie um novo acesso para sua equipe.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados do Funcionário</CardTitle>
            <CardDescription>
              Preencha as informações para criar o login e perfil do funcionário.
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
            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Acesso <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="email@seudominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="senha">Senha Inicial <span className="text-destructive">*</span></Label>
                    <Input
                        id="senha"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar Senha <span className="text-destructive">*</span></Label>
                    <Input
                        id="confirmarSenha"
                        type="password"
                        placeholder="Repita a senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="p-3 border border-amber-500/50 bg-amber-500/10 rounded-md">
                <div className="flex items-start gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-500">Atenção com a Senha!</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                            Você está definindo a senha inicial. Comunique-a ao funcionário de forma segura e instrua-o a alterá-la no primeiro acesso (funcionalidade futura).
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                 <div className="space-y-2">
                    <Label htmlFor="perfil">Perfil de Acesso <span className="text-destructive">*</span></Label>
                    <Select value={perfil} onValueChange={setPerfil} name="perfil" required disabled={isLoading}>
                        <SelectTrigger id="perfil">
                            <SelectValue placeholder="Selecione um perfil..." />
                        </SelectTrigger>
                        <SelectContent>
                            {perfisDisponiveis.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 flex items-center gap-3 rounded-md border p-3 h-fit bg-card">
                    <Switch id="status" checked={status} onCheckedChange={setStatus} disabled={isLoading} />
                    <Label htmlFor="status" className="mb-0 cursor-pointer">
                        Status do Funcionário
                        <span className="block text-xs text-muted-foreground">
                        {status ? "Acesso ativo ao sistema." : "Acesso desativado."}
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

