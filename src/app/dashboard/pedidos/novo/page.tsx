
"use client";

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export default function NovoPedidoPage() {
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [itensPedido, setItensPedido] = useState('');
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
    if (!formaPagamento) {
      toast({ title: "Campo obrigatório", description: "Por favor, selecione a forma de pagamento.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const pedidosCollectionRef = collection(db, 'pedidos');
      await addDoc(pedidosCollectionRef, {
        nomeCliente,
        telefoneCliente,
        itensPedido,
        formaPagamento,
        observacoes,
        status: "Novo", // Status inicial do pedido
        dataCriacao: serverTimestamp(), // Data e hora do servidor
        // TODO: Adicionar campos como valorTotal, enderecoId, userId, etc.
      });

      toast({
        title: "Pedido criado!",
        description: "O novo pedido foi salvo com sucesso.",
      });
      // Limpar formulário ou redirecionar
      setNomeCliente('');
      setTelefoneCliente('');
      setItensPedido('');
      setFormaPagamento('');
      setObservacoes('');
      router.push('/dashboard/pedidos'); // Redireciona para a lista de pedidos

    } catch (error) {
      console.error("Erro ao salvar pedido: ", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível criar o pedido. Tente novamente.",
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
              Informações do cliente, itens e forma de pagamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Ex: 1x Pizza Margherita Grande, 2x Coca-Cola Lata"
                value={itensPedido}
                onChange={(e) => setItensPedido(e.target.value)}
                required
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Descreva os produtos e quantidades. Em breve, seleção de itens do cardápio.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Ex: Sem cebola, troco para R$50, etc."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
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
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
