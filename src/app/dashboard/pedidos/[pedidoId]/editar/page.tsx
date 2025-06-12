
"use client";

import React, { useState, useEffect, type FormEvent } from 'react'; 
import { useParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp, type FirebaseError } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, DollarSign, AlertCircle, Save } from "lucide-react";

interface PedidoFormData {
  nomeCliente: string;
  telefoneCliente: string;
  itensPedido: string;
  valorTotal: number | '';
  formaPagamento: string;
  observacoes: string;
  status: 'Novo' | 'Em preparo' | 'Pronto' | 'Finalizado' | 'Cancelado';
}

function OriginalEditarPedidoPage() {
  const routeParams = useParams();
  const pedidoId = routeParams.pedidoId as string;
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<PedidoFormData>({
    nomeCliente: '',
    telefoneCliente: '',
    itensPedido: '',
    valorTotal: '',
    formaPagamento: '',
    observacoes: '',
    status: 'Novo',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (pedidoId) {
      const fetchPedido = async () => {
        setIsFetching(true);
        setNotFound(false);
        try {
          const pedidoDocRef = doc(db, 'pedidos', pedidoId);
          const pedidoDocSnap = await getDoc(pedidoDocRef);

          if (pedidoDocSnap.exists()) {
            const pedidoData = pedidoDocSnap.data();
            setFormData({
              nomeCliente: pedidoData.nomeCliente || '',
              telefoneCliente: pedidoData.telefoneCliente || '',
              itensPedido: pedidoData.itensPedido || '',
              valorTotal: pedidoData.valorTotal || '',
              formaPagamento: pedidoData.formaPagamento || '',
              observacoes: pedidoData.observacoes || '',
              status: pedidoData.status || 'Novo',
            });
          } else {
            setNotFound(true);
            toast({ title: "Erro", description: "Pedido não encontrado para edição.", variant: "destructive" });
          }
        } catch (error) {
          const firestoreError = error as FirebaseError;
          console.error("Erro ao buscar pedido para edição:", firestoreError);
          setNotFound(true); 
          toast({ title: "Erro ao carregar", description: "Não foi possível carregar os dados do pedido.", variant: "destructive" });
        } finally {
          setIsFetching(false);
        }
      };
      fetchPedido();
    }
  }, [pedidoId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'valorTotal' && value !== '' ? parseFloat(value) : value }));
  };

  const handleSelectChange = (name: keyof PedidoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!formData.nomeCliente.trim()) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe o nome do cliente.", variant: "destructive" });
      setIsLoading(false); return;
    }
    if (!formData.itensPedido.trim()) {
      toast({ title: "Campo obrigatório", description: "Por favor, adicione os itens do pedido.", variant: "destructive" });
      setIsLoading(false); return;
    }
    if (formData.valorTotal === '' || Number(formData.valorTotal) <= 0) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe um valor total válido.", variant: "destructive" });
      setIsLoading(false); return;
    }
    if (!formData.formaPagamento) {
      toast({ title: "Campo obrigatório", description: "Por favor, selecione a forma de pagamento.", variant: "destructive" });
      setIsLoading(false); return;
    }
    if (!formData.status) {
        toast({ title: "Campo obrigatório", description: "Por favor, selecione o status do pedido.", variant: "destructive" });
        setIsLoading(false); return;
    }

    try {
      const pedidoDocRef = doc(db, 'pedidos', pedidoId);
      await updateDoc(pedidoDocRef, {
        ...formData,
        valorTotal: Number(formData.valorTotal),
        dataModificacao: serverTimestamp(),
      });

      toast({
        title: "Pedido atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      router.push(`/dashboard/pedidos/${pedidoId}`);
    } catch (error) {
      const firestoreError = error as FirebaseError;
      console.error("Erro ao atualizar pedido: ", firestoreError);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o pedido. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando dados para edição...</p>
      </div>
    );
  }

  if (notFound) {
    return (
       <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/pedidos">
                <ArrowLeft className="h-4 w-4" />
            </Link>
            </Button>
            <h1 className="text-2xl font-bold font-headline text-destructive">Pedido não encontrado</h1>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5"/> Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
                O pedido com ID <span className="font-semibold text-primary">{pedidoId}</span> não foi encontrado ou não pôde ser carregado.
            </p>
             <p className="text-muted-foreground mt-2">
               Verifique se o ID está correto ou <Link href="/dashboard/pedidos" className="text-primary hover:underline">volte para a lista de pedidos</Link>.
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
          <Link href={`/dashboard/pedidos/${pedidoId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Detalhes do Pedido</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Editar Pedido</h1>
          <p className="text-muted-foreground">
            Modificando o pedido ID: <span className="font-semibold text-primary">{pedidoId}</span>
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes do Pedido</CardTitle>
            <CardDescription>
              Altere as informações necessárias abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nomeCliente">Nome do Cliente <span className="text-destructive">*</span></Label>
                <Input
                  id="nomeCliente"
                  name="nomeCliente"
                  placeholder="Nome completo do cliente"
                  value={formData.nomeCliente}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefoneCliente">Telefone/WhatsApp</Label>
                <Input
                  id="telefoneCliente"
                  name="telefoneCliente"
                  type="tel"
                  placeholder="(00) 90000-0000"
                  value={formData.telefoneCliente}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itensPedido">Itens do Pedido <span className="text-destructive">*</span></Label>
              <Textarea
                id="itensPedido"
                name="itensPedido"
                placeholder="Ex: 1x Pizza Margherita Grande (R$ 45,00), 2x Coca-Cola Lata (R$ 10,00)"
                value={formData.itensPedido}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="valorTotal">Valor Total (R$) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="valorTotal"
                            name="valorTotal"
                            type="number"
                            placeholder="Ex: 55.00"
                            value={formData.valorTotal}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            required
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formaPagamento">Forma de Pagamento <span className="text-destructive">*</span></Label>
                  <Select value={formData.formaPagamento} onValueChange={(value) => handleSelectChange('formaPagamento', value)} name="formaPagamento" required>
                      <SelectTrigger id="formaPagamento">
                      <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="CartaoCredito">Cartão de Crédito</SelectItem>
                      <SelectItem value="CartaoDebito">Cartão de Débito</SelectItem>
                      <SelectItem value="Pix">Pix</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="status">Status do Pedido <span className="text-destructive">*</span></Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value as PedidoFormData['status'])} name="status" required>
                      <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Novo">Novo</SelectItem>
                        <SelectItem value="Em preparo">Em Preparo</SelectItem>
                        <SelectItem value="Pronto">Pronto</SelectItem>
                        <SelectItem value="Finalizado">Finalizado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                placeholder="Ex: Sem cebola, troco para R$100,00, etc."
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" asChild type="button" disabled={isLoading}>
                <Link href={`/dashboard/pedidos/${pedidoId}`}>Cancelar</Link>
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

const EditarPedidoPage = React.memo(OriginalEditarPedidoPage);
export default EditarPedidoPage;
