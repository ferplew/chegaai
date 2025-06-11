
"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, DollarSign, Image as ImageIcon, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { db } from '@/lib/firebase/config'; // Para o próximo passo
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Para o próximo passo

export default function NovoItemPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState<number | ''>('');
  const [categoria, setCategoria] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  // const [imagemArquivo, setImagemArquivo] = useState<File | null>(null); // Para upload de arquivo
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder para categorias - será carregado do Firestore depois
  const categoriasMock = [
    { id: 'pizzas', nome: 'Pizzas' },
    { id: 'burgers', nome: 'Hambúrgueres' },
    { id: 'bebidas', nome: 'Bebidas' },
    { id: 'sobremesas', nome: 'Sobremesas' },
  ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!nome.trim()) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe o nome do item.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (valor === '' || Number(valor) <= 0) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe um valor válido para o item.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!categoria) {
        toast({ title: "Campo obrigatório", description: "Por favor, selecione uma categoria.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    // Lógica de salvamento no Firestore virá aqui no próximo passo
    console.log({
      nome,
      descricao,
      valor,
      categoria,
      imagemUrl,
      // imagemArquivo
    });

    // Simulação de salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Item salvo (simulação)!",
      description: "O novo item foi configurado. A integração com Firestore virá em breve.",
    });
    
    // Limpar campos e redirecionar (ou apenas redirecionar)
    // setNome(''); setDescricao(''); setValor(''); setCategoria(''); setImagemUrl('');
    router.push('/dashboard/produtos'); 

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/produtos">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Itens</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Adicionar Novo Item</h1>
          <p className="text-muted-foreground">
            Preencha os detalhes do novo item do cardápio.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Detalhes do Item</CardTitle>
            <CardDescription>
              Informações básicas, preço e imagem do item.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Item <span className="text-destructive">*</span></Label>
              <Input
                id="nome"
                placeholder="Ex: Pizza Margherita Grande"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Molho de tomate fresco, mozzarella de búfala, manjericão..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="valor"
                            type="number"
                            placeholder="Ex: 45.00"
                            value={valor}
                            onChange={(e) => setValor(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            min="0.01"
                            step="0.01"
                            required
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria <span className="text-destructive">*</span></Label>
                    <Select value={categoria} onValueChange={setCategoria} name="categoria" required>
                        <SelectTrigger id="categoria">
                            <SelectValue placeholder="Selecione uma categoria..." />
                        </SelectTrigger>
                        <SelectContent>
                            {categoriasMock.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                            ))}
                            <SelectItem value="outra">Outra (Adicionar nova)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="imagemUrl">URL da Imagem</Label>
                <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <Input
                        id="imagemUrl"
                        type="url"
                        placeholder="https://exemplo.com/imagem.png"
                        value={imagemUrl}
                        onChange={(e) => setImagemUrl(e.target.value)}
                    />
                </div>
                <p className="text-xs text-muted-foreground">Ou faça upload abaixo (funcionalidade em breve).</p>
            </div>

            {/* Placeholder para Upload de Imagem */}
            <div className="space-y-2">
                <Label htmlFor="imagemArquivo">Upload de Imagem (em breve)</Label>
                <div className="flex items-center justify-center w-full">
                    <Label
                        htmlFor="imagemArquivoInput"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX. 800x400px)</p>
                        </div>
                        <Input id="imagemArquivoInput" type="file" className="hidden" disabled />
                    </Label>
                </div>
            </div>

          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" asChild type="button" disabled={isLoading}>
                    <Link href="/dashboard/produtos">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                    </>
                    ) : (
                    "Salvar Item"
                    )}
                </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
