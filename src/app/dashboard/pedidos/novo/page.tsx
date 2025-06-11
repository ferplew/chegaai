
"use client";

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Loader2, DollarSign } from "lucide-react";
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export default function NovoPedidoPage() {
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [itensPedido, setItensPedido] = useState('');
  const [valorTotal, setValorTotal] = useState<number | ''>('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!nomeCliente.trim()) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe o nome do cliente.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!itensPedido.trim()) {
      toast({ title: "Campo obrigatório", description: "Por favor, adicione os itens do pedido.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (valorTotal === '' || valorTotal <= 0) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe um valor total válido.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!formaPagamento) {
      toast({ title: "Campo obrigatório", description: "Por favor, selecione a forma de pagamento.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const pedidosCollectionRef = collection(db, 'pedidos');
      await addDoc(pedidosCollectionRef, {
        nomeCliente: nomeCliente.trim(),
        telefoneCliente: telefoneCliente.trim(),
        itensPedido: itensPedido.trim(),
        valorTotal: Number(valorTotal),
        formaPagamento,
        observacoes: observacoes.trim(),
        status: "Novo", 
        dataCriacao: serverTimestamp(),
        // TODO: Adicionar campos como enderecoId, userId, etc. futuramente
      });

      toast({
        title: "Pedido criado!",
        description: "O novo pedido foi salvo com sucesso no Firestore.",
      });
      
      // Limpar formulário
      setNomeCliente('');
      setTelefoneCliente('');
      setItensPedido('');
      setValorTotal('');
      setFormaPagamento('');
      setObservacoes('');
      
      router.push('/dashboard/pedidos'); 

    } catch (error) {
      console.error("Erro ao salvar pedido: ", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível criar o pedido. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/pedidos">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Pedidos</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Novo Pedido Manual</h1>
          <p className="text-muted-foreground">
            Preencha os detalhes abaixo para criar um novo pedido.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes do Pedido</CardTitle>
            <CardDescription>
              Informações do cliente, itens, valor e forma de pagamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nomeCliente">Nome do Cliente <span className="text-destructive">*</span></Label>
                <Input
                  id="nomeCliente"
                  placeholder="Nome completo do cliente"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefoneCliente">Telefone/WhatsApp</Label>
                <Input
                  id="telefoneCliente"
                  type="tel"
                  placeholder="(00) 90000-0000"
                  value={telefoneCliente}
                  onChange={(e) => setTelefoneCliente(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itensPedido">Itens do Pedido <span className="text-destructive">*</span></Label>
              <Textarea
                id="itensPedido"
                placeholder="Ex: 1x Pizza Margherita Grande (R$ 45,00), 2x Coca-Cola Lata (R$ 10,00)"
                value={itensPedido}
                onChange={(e) => setItensPedido(e.target.value)}
                required
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Descreva os produtos, quantidades e valores. Em breve, seleção de itens do cardápio.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="valorTotal">Valor Total (R$) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="valorTotal"
                            type="number"
                            placeholder="Ex: 55.00"
                            value={valorTotal}
                            onChange={(e) => setValorTotal(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            min="0.01"
                            step="0.01"
                            required
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento <span className="text-destructive">*</span></Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento} required>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Ex: Sem cebola, troco para R$100,00, etc."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" asChild type="button" disabled={isLoading}>
                <Link href="/dashboard/pedidos">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Pedido"
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

    