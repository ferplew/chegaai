
"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase/config'; // Import auth from your Firebase config
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User
} from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action') === 'register' ? 'register' : 'login';
  const [action, setAction] = useState<'login' | 'register'>(initialAction);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Optionally redirect if user is already logged in,
        // but for login page, usually we don't auto-redirect immediately
        // router.push('/dashboard'); 
      }
    });
    return () => unsubscribe();
  }, [router]);


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (action === 'register' && password !== confirmPassword) {
      toast({
        title: "Erro de Cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (action === 'register') {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Cadastro realizado!",
          description: "Você já pode fazer login.",
        });
        setAction('login'); // Switch to login form after successful registration
        // Clear password fields after registration
        setPassword('');
        setConfirmPassword('');
      } catch (error: any) {
        let errorMessage = "Ocorreu um erro durante o cadastro.";
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = "Este e-mail já está em uso.";
        } else if (error.code === 'auth/weak-password') {
          errorMessage = "A senha é muito fraca. Use pelo menos 6 caracteres.";
        }
        toast({
          title: "Erro de Cadastro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } else { // Login
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Login bem-sucedido!",
          description: "Redirecionando para o painel...",
        });
        router.push('/dashboard');
      } catch (error: any) {
        let errorMessage = "E-mail ou senha inválidos.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
           errorMessage = "E-mail ou senha incorretos. Verifique suas credenciais.";
        }
        toast({
          title: "Erro de Login",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Login com Google bem-sucedido!",
        description: "Redirecionando para o painel...",
      });
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro ao tentar fazer login com o Google.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "A janela de login do Google foi fechada antes da conclusão.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Múltiplas tentativas de login com o Google. Tente novamente.";
      }
      toast({
        title: "Erro no Login com Google",
        description: errorMessage,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Link href="/" className="mb-8">
        <ChegaAiLogo className="h-12 text-primary" />
      </Link>
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">
            {action === 'login' ? 'Acesse seu painel' : 'Crie sua conta'}
          </CardTitle>
          <CardDescription>
            {action === 'login' ? 'Bem-vindo de volta!' : 'Rápido e fácil, comece já!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input"
                autoComplete={action === 'login' ? "current-password" : "new-password"}
              />
            </div>
            {action === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-input"
                  autoComplete="new-password"
                />
              </div>
            )}
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (action === 'login' ? 'Entrando...' : 'Cadastrando...') : (action === 'login' ? 'Entrar com E-mail' : 'Cadastrar')}
            </Button>
          </form>
          
          <div className="my-6 flex items-center">
            <Separator className="flex-grow" />
            <span className="mx-4 text-xs text-muted-foreground">ou</span>
            <Separator className="flex-grow" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
            <GoogleIcon className="mr-2 h-5 w-5" />
            Entrar com Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          {action === 'login' && (
            <Link href="#" className="text-primary hover:underline" onClick={(e) => {
              e.preventDefault();
              toast({ title: "Funcionalidade não implementada", description: "A recuperação de senha ainda será desenvolvida."});
            }}>
              Esqueci minha senha
            </Link>
          )}
          <button
            onClick={() => {
              setAction(action === 'login' ? 'register' : 'login');
              // Clear form fields when switching action
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {action === 'login' ? 'Ainda não tem conta? Cadastre seu restaurante' : 'Já tem uma conta? Acesse o painel'}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
