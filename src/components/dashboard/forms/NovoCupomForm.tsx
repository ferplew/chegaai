
"use client";

import React, { useState, type FormEvent, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, CalendarDays, Info, Save } from "lucide-react"; // Added Save
import type { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, Timestamp, type FirestoreError } from 'firebase/firestore';

function OriginalNovoCupomForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'percentual' | 'fixo'>('percentual');
  const [valor, setValor] = useState<number | ''>('');
  const [datas, setDatas] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [limiteUso, setLimiteUso] = useState<number | ''>('');
  const [ativo, setAtivo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = useCallback(() => {
    setNome('');
    setTipo('percentual');
    setValor('');
    setDatas({ from: new Date(), to: addDays(new Date(), 7) });
    setLimiteUso('');
    setAtivo(true);
  }, []);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!nome.trim()) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe o nome do cupom.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (valor === '' || Number(valor) <= 0) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe um valor válido para o cupom.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!datas?.from || !datas?.to) {
        toast({ title: "Campo obrigatório", description: "Por favor, selecione o período de validade.", variant: "destructive"});
        setIsLoading(false);
        return;
    }
    if (limiteUso !== '' && Number(limiteUso) < 0) {
        toast({ title: "Valor inválido", description: "O limite de uso não pode ser negativo.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    try {
      const cuponsCollectionRef = collection(db, 'cupons');
      await addDoc(cuponsCollectionRef, {
        nome: nome.trim().toUpperCase(),
        tipo,
        valor: Number(valor),
        dataInicio: Timestamp.fromDate(datas.from),
        dataFim: Timestamp.fromDate(datas.to),
        limiteUso: limiteUso === '' ? null : Number(limiteUso),
        usos: 0, 
        ativo,
        dataCriacao: serverTimestamp(),
      });

      toast({
        title: "Cupom criado!",
        description: "O novo cupom foi salvo com sucesso no Firestore.",
      });
      
      resetForm();
      router.push('/dashboard/cupons'); 

    } catch (error) {
      const firestoreError = error as FirestoreError;
      console.error("Erro ao salvar cupom: ", firestoreError);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível criar o cupom. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [nome, tipo, valor, datas, limiteUso, ativo, toast, router, resetForm]);
  
  const formatRangeForDisplay = (range: DateRange | undefined): string => {
    if (!range || !range.from) return "Nenhum período selecionado";
    if (range.to) {
      return `${format(range.from, "dd/MM/yy", { locale: ptBR })} - ${format(range.to, "dd/MM/yy", { locale: ptBR })}`;
    }
    return format(range.from, "dd/MM/yy", { locale: ptBR });
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/cupons">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Cupons</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Criar Novo Cupom</h1>
          <p className="text-muted-foreground">
            Preencha os detalhes para configurar seu cupom promocional.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes do Cupom</CardTitle>
            <CardDescription>
              Defina as regras e condições para o seu cupom.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cupom (Código) <span className="text-destructive">*</span></Label>
              <Input
                id="nome"
                placeholder="Ex: PROMO10, BEMVINDO20"
                value={nome}
                onChange={(e) => setNome(e.target.value.toUpperCase())}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" /> Este será o código que o cliente usará.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Tipo de Desconto <span className="text-destructive">*</span></Label>
                    <RadioGroup value={tipo} onValueChange={(value) => setTipo(value as 'percentual' | 'fixo')} className="flex space-x-4 pt-1">
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentual" id="percentual" disabled={isLoading}/>
                        <Label htmlFor="percentual" className="font-normal">Percentual (%)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixo" id="fixo" disabled={isLoading}/>
                        <Label htmlFor="fixo" className="font-normal">Valor Fixo (R$)</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="valor">Valor do Desconto <span className="text-destructive">*</span></Label>
                    <Input
                        id="valor"
                        type="number"
                        placeholder={tipo === 'percentual' ? "Ex: 10 (para 10%)" : "Ex: 15.50 (para R$15,50)"}
                        value={valor}
                        onChange={(e) => setValor(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        min="0.01"
                        step="0.01"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="validade">Período de Validade <span className="text-destructive">*</span></Label>
                <DatePickerWithRange date={datas} onDateChange={setDatas} />
                 {datas?.from && (
                    <div className="p-2 border border-dashed rounded-md text-sm text-muted-foreground bg-muted/30">
                        <CalendarDays className="inline-block mr-2 h-4 w-4" />
                        Cupom válido de: <span className="font-medium">{formatRangeForDisplay(datas)}</span>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                    <Label htmlFor="limiteUso">Limite de Usos (opcional)</Label>
                    <Input
                        id="limiteUso"
                        type="number"
                        placeholder="Nº de vezes que o cupom pode ser usado"
                        value={limiteUso}
                        onChange={(e) => setLimiteUso(e.target.value === '' ? '' : parseInt(e.target.value))}
                        min="0" 
                        disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" /> Deixe em branco para usos ilimitados.
                    </p>
                </div>
                <div className="space-y-2 flex items-center gap-3 rounded-md border p-3 h-fit bg-card">
                    <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} disabled={isLoading}/>
                    <Label htmlFor="ativo" className="mb-0 cursor-pointer">
                        Cupom Ativo
                        <span className="block text-xs text-muted-foreground">
                        {ativo ? "Este cupom pode ser utilizado." : "Este cupom está desativado."}
                        </span>
                    </Label>
                </div>
            </div>

          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" asChild type="button" disabled={isLoading}>
                    <Link href="/dashboard/cupons">Cancelar</Link>
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
                      Salvar Cupom
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

const NovoCupomForm = React.memo(OriginalNovoCupomForm);
export default NovoCupomForm;
