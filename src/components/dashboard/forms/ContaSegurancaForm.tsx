
"use client";

import React, { useState, useEffect, type FormEvent, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Landmark, FileBadge2, History, Bell, AlertTriangle, UserX, Loader2, Save, Eye, EyeOff, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { db, auth } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, type FirestoreError } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, type User, type AuthError } from 'firebase/auth';
import { isValidCPF, isValidCNPJ, cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


const ADMIN_PASSWORD_CHANGE_ENABLED = true;

interface DadosFinanceiros {
  nomeCompletoOuRazaoSocial: string;
  tipoDocumento: 'cpf' | 'cnpj';
  documento: string;
  banco: string;
  agencia: string;
  conta: string;
  chavePix: string;
}

const initialDadosFinanceiros: DadosFinanceiros = {
  nomeCompletoOuRazaoSocial: '',
  tipoDocumento: 'cpf',
  documento: '',
  banco: '',
  agencia: '',
  conta: '',
  chavePix: '',
};

function OriginalContaSegurancaForm() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  
  const [financeiroData, setFinanceiroData] = useState<DadosFinanceiros>(initialDadosFinanceiros);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [isFinanceiroSaving, setIsFinanceiroSaving] = useState(false);
  const [isFinanceiroFetching, setIsFinanceiroFetching] = useState(true);

  const financeiroDocRef = doc(db, 'configuracoes', 'dadosFinanceiros');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFinanceiroData = async () => {
      setIsFinanceiroFetching(true);
      try {
        const docSnap = await getDoc(financeiroDocRef);
        if (docSnap.exists()) {
          setFinanceiroData(prev => ({ ...prev, ...docSnap.data() as DadosFinanceiros}));
        }
      } catch (error) {
        const firestoreError = error as FirestoreError;
        console.error("Erro ao buscar dados financeiros:", firestoreError);
        toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar os dados financeiros.", variant: "destructive" });
      } finally {
        setIsFinanceiroFetching(false);
      }
    };
    fetchFinanceiroData();
  }, [toast]);

  const handlePasswordChange = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ADMIN_PASSWORD_CHANGE_ENABLED) {
        toast({ title: "Indisponível", description: "A alteração de senha está temporariamente desabilitada.", variant: "destructive" });
        return;
    }
    if (!currentUser) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Erro", description: "As novas senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Erro", description: "A nova senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setIsPasswordSaving(true);
    try {
      if (currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        toast({ title: "Senha Alterada!", description: "Sua senha de administrador foi atualizada com sucesso." });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
         toast({ title: "Erro", description: "Não foi possível obter o e-mail do usuário para reautenticação.", variant: "destructive" });
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error("Erro ao alterar senha:", authError);
      let message = "Não foi possível alterar a senha.";
      if (authError.code === 'auth/wrong-password') {
        message = "A senha atual está incorreta.";
      } else if (authError.code === 'auth/too-many-requests') {
        message = "Muitas tentativas. Tente novamente mais tarde.";
      }
      toast({ title: "Erro ao Alterar Senha", description: message, variant: "destructive" });
    } finally {
      setIsPasswordSaving(false);
    }
  }, [currentUser, currentPassword, newPassword, confirmNewPassword, toast]);

  const handleFinanceiroChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFinanceiroData(prev => ({ ...prev, [name]: value }));
    if (name === 'documento') handleDocumentValueChangeInternal(value, financeiroData.tipoDocumento);
  }, [financeiroData.tipoDocumento]);

  const handleDocumentValueChangeInternal = useCallback((value: string, type: 'cpf' | 'cnpj') => {
    setFinanceiroData(prev => ({ ...prev, documento: value }));
    const cleanedValue = value.replace(/[^\d]/g, '');

    if (type === 'cpf') {
      if (cleanedValue.length > 0 && cleanedValue.length < 11) setDocumentError("CPF incompleto.");
      else if (cleanedValue.length === 11) setDocumentError(isValidCPF(cleanedValue) ? null : "CPF inválido.");
      else setDocumentError(null);
    } else if (type === 'cnpj') {
      if (cleanedValue.length > 0 && cleanedValue.length < 14) setDocumentError("CNPJ incompleto.");
      else if (cleanedValue.length === 14) setDocumentError(isValidCNPJ(cleanedValue) ? null : "CNPJ inválido.");
      else setDocumentError(null);
    }
  }, []);

  const handleDocumentTypeChange = useCallback((type: 'cpf' | 'cnpj') => {
    setFinanceiroData(prev => ({ ...prev, tipoDocumento: type, documento: '' }));
    setDocumentError(null);
  }, []);

  const handleSaveFinanceiro = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (documentError) {
      toast({ title: "Dados Inválidos", description: `Verifique o campo ${financeiroData.tipoDocumento.toUpperCase()}: ${documentError}`, variant: "destructive"});
      return;
    }
    const cleanedDocument = financeiroData.documento.replace(/[^\d]/g, '');
    if (financeiroData.tipoDocumento === 'cpf' && (cleanedDocument.length !== 11 || !isValidCPF(cleanedDocument))) {
        toast({ title: "CPF Inválido", description: "O CPF informado não é válido.", variant: "destructive" });
        setDocumentError("CPF inválido.");
        return;
    }
    if (financeiroData.tipoDocumento === 'cnpj' && (cleanedDocument.length !== 14 || !isValidCNPJ(cleanedDocument))) {
        toast({ title: "CNPJ Inválido", description: "O CNPJ informado não é válido.", variant: "destructive" });
        setDocumentError("CNPJ inválido.");
        return;
    }

    setIsFinanceiroSaving(true);
    try {
      await setDoc(financeiroDocRef, {
        ...financeiroData,
        dataModificacao: serverTimestamp()
      }, { merge: true });
      toast({ title: "Dados Salvos!", description: "Suas informações de recebimento foram atualizadas." });
    } catch (error) {
      const firestoreError = error as FirestoreError;
      console.error("Erro ao salvar dados financeiros:", firestoreError);
      toast({ title: "Erro ao Salvar", description: "Não foi possível salvar os dados financeiros.", variant: "destructive" });
    } finally {
      setIsFinanceiroSaving(false);
    }
  }, [financeiroData, documentError, toast, financeiroDocRef]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Conta e Segurança</h1>
        <p className="text-muted-foreground">Gerencie suas credenciais, dados financeiros e preferências.</p>
      </div>

      {ADMIN_PASSWORD_CHANGE_ENABLED && currentUser?.providerData.some(p => p.providerId === EmailAuthProvider.PROVIDER_ID) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary"/> Alterar Senha de Administrador</CardTitle>
            <CardDescription>Mantenha sua conta segura atualizando sua senha regularmente.</CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
              <div className="space-y-1 relative">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" disabled={isPasswordSaving}/>
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7 text-muted-foreground" onClick={() => setShowCurrentPassword(!showCurrentPassword)}> {showCurrentPassword ? <EyeOff /> : <Eye />} </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 relative">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" disabled={isPasswordSaving}/>
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7 text-muted-foreground" onClick={() => setShowNewPassword(!showNewPassword)}> {showNewPassword ? <EyeOff /> : <Eye />} </Button>
                </div>
                <div className="space-y-1 relative">
                  <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
                  <Input id="confirmNewPassword" type={showConfirmNewPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required autoComplete="new-password" disabled={isPasswordSaving}/>
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7 text-muted-foreground" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}> {showConfirmNewPassword ? <EyeOff /> : <Eye />} </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPasswordSaving || !currentPassword || !newPassword || newPassword.length < 6 || newPassword !== confirmNewPassword}>
                {isPasswordSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Alterar Senha
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
       {!currentUser?.providerData.some(p => p.providerId === EmailAuthProvider.PROVIDER_ID) && ADMIN_PASSWORD_CHANGE_ENABLED && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary"/> Alterar Senha de Administrador</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <Info className="h-4 w-4"/>
                    Você está logado com um provedor social (Ex: Google). A alteração de senha não está disponível para este tipo de conta.
                </p>
            </CardContent>
         </Card>
       )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-primary"/> Dados para Recebimento</CardTitle>
          <CardDescription>Informações para o processamento de pagamentos e repasses.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveFinanceiro}>
          <CardContent className="space-y-4">
            {isFinanceiroFetching ? (
                 <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Carregando dados financeiros...</p>
                 </div>
            ) : (
            <>
                <div className="space-y-1">
                    <Label htmlFor="nomeCompletoOuRazaoSocial">Nome Completo / Razão Social</Label>
                    <Input id="nomeCompletoOuRazaoSocial" name="nomeCompletoOuRazaoSocial" value={financeiroData.nomeCompletoOuRazaoSocial} onChange={handleFinanceiroChange} placeholder="Seu nome ou da empresa" disabled={isFinanceiroSaving}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Tipo de Documento</Label>
                        <RadioGroup value={financeiroData.tipoDocumento} onValueChange={(value) => handleDocumentTypeChange(value as 'cpf' | 'cnpj')} className="flex pt-2 space-x-4">
                            <div className="flex items-center space-x-2"> <RadioGroupItem value="cpf" id="cpf-radio" disabled={isFinanceiroSaving}/> <Label htmlFor="cpf-radio" className="font-normal">CPF</Label> </div>
                            <div className="flex items-center space-x-2"> <RadioGroupItem value="cnpj" id="cnpj-radio" disabled={isFinanceiroSaving}/> <Label htmlFor="cnpj-radio" className="font-normal">CNPJ</Label> </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="documento">{financeiroData.tipoDocumento.toUpperCase()}</Label>
                        <Input id="documento" name="documento" value={financeiroData.documento} onChange={(e) => handleDocumentValueChangeInternal(e.target.value, financeiroData.tipoDocumento)} placeholder={financeiroData.tipoDocumento === 'cpf' ? "000.000.000-00" : "00.000.000/0000-00"} className={cn(documentError && "border-destructive")} disabled={isFinanceiroSaving}/>
                        {documentError && <p className="text-sm text-destructive mt-1">{documentError}</p>}
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="banco">Banco</Label>
                        <Input id="banco" name="banco" value={financeiroData.banco} onChange={handleFinanceiroChange} placeholder="Ex: Banco do Brasil, Nubank" disabled={isFinanceiroSaving}/>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="agencia">Agência</Label>
                        <Input id="agencia" name="agencia" value={financeiroData.agencia} onChange={handleFinanceiroChange} placeholder="Ex: 0001" disabled={isFinanceiroSaving}/>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="conta">Conta (com dígito)</Label>
                        <Input id="conta" name="conta" value={financeiroData.conta} onChange={handleFinanceiroChange} placeholder="Ex: 12345-6" disabled={isFinanceiroSaving}/>
                    </div>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="chavePix">Chave PIX (vinculada ao {financeiroData.tipoDocumento.toUpperCase()})</Label>
                    <Input id="chavePix" name="chavePix" value={financeiroData.chavePix} onChange={handleFinanceiroChange} placeholder="E-mail, telefone, CPF/CNPJ ou chave aleatória" disabled={isFinanceiroSaving}/>
                </div>
            </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isFinanceiroSaving || isFinanceiroFetching || !!documentError}>
              {isFinanceiroSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Dados Financeiros
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Separator />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-primary"/> Histórico de Acesso</CardTitle>
            <CardDescription>Visualize os últimos acessos à sua conta (em breve).</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-24 border border-dashed rounded-md">
            <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary"/> Preferências de Notificação</CardTitle>
            <CardDescription>Escolha como deseja receber alertas e comunicados (em breve).</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-24 border border-dashed rounded-md">
            <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><UserX className="h-5 w-5"/> Desativar Conta</CardTitle>
            <CardDescription>Informações sobre como proceder para desativar sua conta (em breve).</CardDescription>
          </CardHeader>
           <CardContent className="flex items-center justify-center h-24 border border-dashed rounded-md border-destructive/50">
            <p className="text-muted-foreground">Funcionalidade em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const ContaSegurancaForm = React.memo(OriginalContaSegurancaForm);
export default ContaSegurancaForm;
