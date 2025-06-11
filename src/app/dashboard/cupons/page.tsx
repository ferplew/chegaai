
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle, Ticket } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";

interface Cupom {
  id: string;
  nome: string;
  tipo: 'percentual' | 'fixo';
  valor: number;
  dataInicio: Timestamp;
  dataFim: Timestamp;
  limiteUso: number | null;
  usos: number;
  ativo: boolean;
  dataCriacao: Timestamp;
}

function getStatusBadgeVariant(ativo: boolean): "default" | "secondary" {
  return ativo ? "default" : "secondary";
}

function getStatusText(ativo: boolean): string {
  return ativo ? "Ativo" : "Inativo";
}

export default function CuponsPage() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const cuponsCollectionRef = collection(db, 'cupons');
    const q = query(cuponsCollectionRef, orderBy('dataCriacao', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cuponsData: Cupom[] = [];
      querySnapshot.forEach((doc) => {
        cuponsData.push({ id: doc.id, ...doc.data() } as Cupom);
      });
      setCupons(cuponsData);
      setIsLoading(false);
      setError(null);
    }, (err) => {
      console.error("Erro ao buscar cupons: ", err);
      setError("Não foi possível carregar os cupons. Tente novamente mais tarde.");
      toast({ title: "Erro ao carregar cupons", description: err.message, variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const formatDate = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), "dd/MM/yy", { locale: ptBR });
  };
  
  const handleEdit = (id: string) => {
    // TODO: Implementar navegação para página de edição
    toast({ title: "Em breve", description: `Funcionalidade de editar cupom ${id} será implementada.`});
  }

  const handleDelete = (id: string) => {
    // TODO: Implementar lógica de exclusão com confirmação
    toast({ title: "Em breve", description: `Funcionalidade de excluir cupom ${id} será implementada.`});
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Cupons Promocionais</h1>
          <p className="text-muted-foreground">Crie e gerencie seus cupons de desconto.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cupons/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Cupom
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Cupons</CardTitle>
          <CardDescription>
            Acompanhe e gerencie os cupons ativos e inativos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Carregando cupons...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4 text-destructive">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">{error}</p>
              <p className="text-sm">Verifique sua conexão ou tente recarregar a página.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome (Código)</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="hidden md:table-cell">Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell text-center">Usos / Limite</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cupons.length > 0 ? (
                  cupons.map((cupom) => (
                    <TableRow key={cupom.id}>
                      <TableCell className="font-medium">{cupom.nome}</TableCell>
                      <TableCell className="hidden sm:table-cell capitalize">{cupom.tipo}</TableCell>
                      <TableCell>
                        {cupom.tipo === 'percentual' ? `${cupom.valor}%` : `R$ ${cupom.valor.toFixed(2).replace('.', ',')}`}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(cupom.dataInicio)} - {formatDate(cupom.dataFim)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(cupom.ativo)} className={cupom.ativo ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}>
                          {getStatusText(cupom.ativo)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-center">
                        {cupom.usos} / {cupom.limiteUso ?? '∞'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="mr-1" onClick={() => handleEdit(cupom.id)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(cupom.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64">
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">Nenhum cupom criado ainda.</p>
                        <p className="text-sm text-muted-foreground">
                          Clique em &quot;Criar Novo Cupom&quot; para começar.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
