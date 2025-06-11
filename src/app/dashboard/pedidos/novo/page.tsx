
"use client";

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Loader2, DollarSign, MapPin } from "lucide-react";
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, type Timestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export default function NovoPedidoPage() {
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [itensPedido, setItensPedido] = useState('');
  const [valorTotal, setValorTotal] = useState<number | ''>('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Campos de endereço
  const [enderecoRua, setEnderecoRua] = useState('');
  const [enderecoNumero, setEnderecoNumero] = useState('');
  const [enderecoBairro, setEnderecoBairro] = useState('');
  const [enderecoCidade, setEnderecoCidade] = useState('');
  const [enderecoCep, setEnderecoCep] = useState('');
  const [enderecoComplemento, setEnderecoComplemento] = useState('');
  const [enderecoReferencia, setEnderecoReferencia] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const resetForm = () => {
    setNomeCliente('');
    setTelefoneCliente('');
    setItensPedido('');
    setValorTotal('');
    setFormaPagamento('');
    setObservacoes('');
    setEnderecoRua('');
    setEnderecoNumero('');
    setEnderecoBairro('');
    setEnderecoCidade('');
    setEnderecoCep('');
    setEnderecoComplemento('');
    setEnderecoReferencia('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const nomeClienteTrimmed = nomeCliente.trim();
    const telefoneClienteTrimmed = telefoneCliente.trim();

    if (!nomeClienteTrimmed) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe o nome do cliente.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!itensPedido.trim()) {
      toast({ title: "Campo obrigatório", description: "Por favor, adicione os itens do pedido.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (valorTotal === '' || Number(valorTotal) <= 0) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe um valor total válido.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!formaPagamento) {
      toast({ title: "Campo obrigatório", description: "Por favor, selecione a forma de pagamento.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const enderecoData = (enderecoRua.trim() || enderecoCidade.trim() || enderecoCep.trim()) ? {
        rua: enderecoRua.trim() || null,
        numero: enderecoNumero.trim() || null,
        bairro: enderecoBairro.trim() || null,
        cidade: enderecoCidade.trim() || null,
        cep: enderecoCep.trim() || null,
        complemento: enderecoComplemento.trim() || null,
        referencia: enderecoReferencia.trim() || null,
    } : null;

    try {
      const pedidosCollectionRef = collection(db, 'pedidos');
      const pedidoDocRef = await addDoc(pedidosCollectionRef, {
        nomeCliente: nomeClienteTrimmed,
        telefoneCliente: telefoneClienteTrimmed,
        itensPedido: itensPedido.trim(),
        valorTotal: Number(valorTotal),
        formaPagamento,
        observacoes: observacoes.trim(),
        status: "Novo", 
        dataCriacao: serverTimestamp(),
        endereco: enderecoData,
      });

      toast({
        title: "Pedido criado!",
        description: "O novo pedido foi salvo com sucesso no Firestore.",
      });
      
      // Cadastro automático de cliente, se não existir
      const clientesCollectionRef = collection(db, 'clientes');
      let clienteQuery = query(clientesCollectionRef, where('nomeLower', '==', nomeClienteTrimmed.toLowerCase()));
      if (telefoneClienteTrimmed) {
        // Se o telefone for fornecido, a busca fica mais específica
        clienteQuery = query(clientesCollectionRef, 
          where('nomeLower', '==', nomeClienteTrimmed.toLowerCase()),
          where('telefone', '==', telefoneClienteTrimmed)
        );
      }
      
      const clienteSnapshot = await getDocs(clienteQuery);

      if (clienteSnapshot.empty) {
        await addDoc(clientesCollectionRef, {
          nome: nomeClienteTrimmed,
          nomeLower: nomeClienteTrimmed.toLowerCase(),
          telefone: telefoneClienteTrimmed || null,
          email: null, // Email não é coletado no formulário de pedido
          endereco: enderecoData, // Salva o mesmo endereço do pedido
          dataCadastro: serverTimestamp(),
          origem: 'pedido', // Indica que o cliente foi criado a partir de um pedido
        });
        toast({
          title: "Novo cliente cadastrado!",
          description: `Cliente ${nomeClienteTrimmed} foi adicionado à base de dados.`,
          variant: "default" 
        });
      } else {
        // Cliente já existe, não faz nada ou poderia atualizar, mas vamos manter simples por agora.
        console.log(`Cliente ${nomeClienteTrimmed} já cadastrado.`);
      }

      // Salvar endereço separadamente se preenchido (mantendo a lógica original, mas agora o cliente também pode ter o endereço)
      if (enderecoData) {
        try {
          const enderecosCollectionRef = collection(db, 'enderecos');
          await addDoc(enderecosCollectionRef, {
            ...enderecoData,
            pedidoId: pedidoDocRef.id,
            clienteNome: nomeClienteTrimmed,
            dataCriacao: serverTimestamp(),
          });
          toast({
            title: "Endereço do pedido salvo!",
            description: "O endereço de entrega foi registrado na coleção de endereços.",
            variant: "default", 
          });
        } catch (addressError) {
          console.error("Erro ao salvar endereço separadamente: ", addressError);
          toast({
            title: "Erro ao salvar endereço do pedido",
            description: "Não foi possível registrar o endereço na coleção de endereços. Verifique o console.",
            variant: "destructive",
          });
        }
      }
      
      resetForm();
      router.push('/dashboard/pedidos'); 

    } catch (error) {
      console.error("Erro ao salvar pedido: ", error);
      toast({
        title: "Erro ao salvar pedido",
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
                <Select value={formaPagamento} onValueChange={setFormaPagamento} name="formaPagamento" required>
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

            <Card className="pt-4 mt-6 border-dashed">
                <CardHeader className="py-0 pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Endereço de Entrega (Opcional)
                    </CardTitle>
                    <CardDescription>Preencha se o pedido for para entrega.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1 md:col-span-2">
                            <Label htmlFor="enderecoRua">Rua / Avenida</Label>
                            <Input id="enderecoRua" value={enderecoRua} onChange={(e) => setEnderecoRua(e.target.value)} placeholder="Ex: Rua das Palmeiras" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="enderecoNumero">Número</Label>
                            <Input id="enderecoNumero" value={enderecoNumero} onChange={(e) => setEnderecoNumero(e.target.value)} placeholder="Ex: 123" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="enderecoBairro">Bairro</Label>
                            <Input id="enderecoBairro" value={enderecoBairro} onChange={(e) => setEnderecoBairro(e.target.value)} placeholder="Ex: Centro" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="enderecoCep">CEP</Label>
                            <Input id="enderecoCep" value={enderecoCep} onChange={(e) => setEnderecoCep(e.target.value)} placeholder="Ex: 12345-678" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="enderecoCidade">Cidade</Label>
                            <Input id="enderecoCidade" value={enderecoCidade} onChange={(e) => setEnderecoCidade(e.target.value)} placeholder="Ex: Cidade Exemplo" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="enderecoComplemento">Complemento</Label>
                        <Input id="enderecoComplemento" value={enderecoComplemento} onChange={(e) => setEnderecoComplemento(e.target.value)} placeholder="Ex: Apto 101, Bloco B" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="enderecoReferencia">Ponto de Referência</Label>
                        <Textarea id="enderecoReferencia" value={enderecoReferencia} onChange={(e) => setEnderecoReferencia(e.target.value)} placeholder="Ex: Próximo ao mercado, portão verde" rows={2} />
                    </div>
                </CardContent>
            </Card>

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
    
