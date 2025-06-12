
"use client";

import React, { useState, type FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User,
  type AuthError
} from 'firebase/auth';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { isValidCPF, isValidCNPJ, cn } from "@/lib/utils";

function OriginalLoginPage() {
  const router = useRouter();
  const searchParamsFromHook = useSearchParams();
  
  const [action, setAction] = useState<'login' | 'register'>('login'); // Default to 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');
  const [documentValue, setDocumentValue] = useState('');
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Determine initial action based on searchParamsFromHook once component has mounted/params are ready
    if (searchParamsFromHook) {
      const actionFromParams = searchParamsFromHook.get('action') === 'register' ? 'register' : 'login';
      setAction(actionFromParams);
    }
  }, [searchParamsFromHook]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // router.push('/dashboard'); 
      }
    });
    return () => unsubscribe();
  }, [router]);

  const clearAllFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRestaurantName('');
    setDocumentType('cpf');
    setDocumentValue('');
    setPhone('');
    setDocumentError(null); 
  };

  const handleDocumentValueChange = (value: string) => {
    setDocumentValue(value);
    const cleanedValue = value.replace(/[^\d]/g, '');

    if (documentType === 'cpf') {
      if (cleanedValue.length === 11) {
        setDocumentError(isValidCPF(cleanedValue) ? null : "CPF inválido.");
      } else {
        setDocumentError(null); 
      }
    } else if (documentType === 'cnpj') {
      if (cleanedValue.length === 14) {
        setDocumentError(isValidCNPJ(cleanedValue) ? null : "CNPJ inválido.");
      } else {
        setDocumentError(null);
      }
    }
  };

  const handleDocumentTypeChange = (type: 'cpf' | 'cnpj') => {
    setDocumentType(type);
    setDocumentValue('');
    setDocumentError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (action === 'register') {
      if (password !== confirmPassword) {
        toast({
          title: "Erro de Cadastro",
          description: "As senhas não coincidem.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      if (!restaurantName.trim()) {
        toast({ title: "Erro de Cadastro", description: "Nome do estabelecimento é obrigatório.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (documentError) {
        toast({ title: "Erro de Cadastro", description: documentError, variant: "destructive" });
        setIsLoading(false);
        return;
      }
      const cleanedDocumentValue = documentValue.replace(/[^\d]/g, '');
      if (documentType === 'cpf') {
        if (!isValidCPF(cleanedDocumentValue) || cleanedDocumentValue.length !== 11) {
          toast({ title: "Erro de Cadastro", description: "CPF inválido.", variant: "destructive" });
          setDocumentError("CPF inválido.");
          setIsLoading(false);
          return;
        }
      } else if (documentType === 'cnpj') {
        if (!isValidCNPJ(cleanedDocumentValue) || cleanedDocumentValue.length !== 14) {
          toast({ title: "Erro de Cadastro", description: "CNPJ inválido.", variant: "destructive" });
          setDocumentError("CNPJ inválido.");
          setIsLoading(false);
          return;
        }
      }
      if (!phone.trim()) { 
        toast({ title: "Erro de Cadastro", description: "Telefone/WhatsApp é obrigatório.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Cadastro realizado!",
          description: "Você já pode fazer login.",
        });
        setAction('login'); 
        clearAllFields(); 
      } catch (error) {
        const authError = error as AuthError;
        let errorMessage = "Ocorreu um erro durante o cadastro.";
        if (authError.code === 'auth/email-already-in-use') {
          errorMessage = "Este e-mail já está em uso.";
        } else if (authError.code === 'auth/weak-password') {
          errorMessage = "A senha é muito fraca. Use pelo menos 6 caracteres.";
        }
        toast({
          title: "Erro de Cadastro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } else { 
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Login bem-sucedido!",
          description: "Redirecionando para o painel...",
        });
        router.push('/dashboard');
      } catch (error) {
        const authError = error as AuthError;
        let errorMessage = "E-mail ou senha inválidos.";
        if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
           errorMessage = "E-mail ou senha incorretos. Verifique suas credenciais.";
        } else if (authError.code === 'auth/unauthorized-domain') {
           errorMessage = "Domínio não autorizado. Verifique as configurações no Firebase Console.";
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
    } catch (error) {
      const authError = error as AuthError;
      let descriptionMessage = "Ocorreu um erro desconhecido ao tentar fazer login com o Google.";

      if (authError.code === 'auth/popup-closed-by-user') {
        descriptionMessage = "A janela de login do Google foi fechada antes da conclusão.";
      } else if (authError.code === 'auth/cancelled-popup-request') {
        descriptionMessage = "Múltiplas tentativas de login com o Google. Por favor, tente novamente.";
      } else if (authError.code === 'auth/unauthorized-domain') {
        descriptionMessage = "Domínio não autorizado para login com Google. Verifique o Firebase Console.";
      } else if (authError.code && authError.message) {
        descriptionMessage = `Erro (${authError.code}): ${authError.message}.`;
      } else if (authError.code) {
        descriptionMessage = `Erro: ${authError.code}.`;
      }
      
      toast({
        title: "Erro no Login com Google",
        description: descriptionMessage,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Link href="/" className="mb-8 flex justify-center">
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <>
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
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Nome do Estabelecimento</Label>
                  <Input
                    id="restaurantName"
                    type="text"
                    placeholder="Ex: Pizzaria Delícia"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    required
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                    <Label>Tipo de Documento</Label>
                    <RadioGroup
                        value={documentType}
                        onValueChange={handleDocumentTypeChange}
                        className="flex pt-1 space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cpf" id="cpf-radio" />
                        <Label htmlFor="cpf-radio" className="font-normal">CPF</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cnpj" id="cnpj-radio" />
                        <Label htmlFor="cnpj-radio" className="font-normal">CNPJ</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentValue">{documentType === 'cpf' ? 'CPF' : 'CNPJ'}</Label>
                  <Input
                    id="documentValue"
                    type="text"
                    placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    value={documentValue}
                    onChange={(e) => handleDocumentValueChange(e.target.value)}
                    required
                    className={cn(
                      "bg-input",
                      documentError && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {documentError && (
                    <p className="text-sm text-destructive mt-1">{documentError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 90000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-input"
                    autoComplete="tel"
                  />
                </div>
              </>
            )}
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (action === 'login' ? 'Entrando...' : 'Cadastrando...') : (action === 'login' ? 'Entrar com E-mail' : 'Cadastrar')}
            </Button>
          </form>
          
          <div className="my-6 flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
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
              clearAllFields();
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

const LoginPage = React.memo(OriginalLoginPage);
export default LoginPage;
