
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle, Users, MapPin } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

interface EnderecoCliente {
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  complemento?: string;
  referencia?: string;
}

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  endereco?: EnderecoCliente | null;
  dataCadastro: Timestamp;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const clientesCollectionRef = collection(db, 'clientes');
    const q = query(clientesCollectionRef, orderBy('nomeLower', 'asc')); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clientesData: Cliente[] = [];
      querySnapshot.forEach((doc) => {
        clientesData.push({ id: doc.id, ...doc.data() } as Cliente);
      });
      setClientes(clientesData);
      setIsLoading(false);
      setError(null);
    }, (err) => {
      console.error("Erro ao buscar clientes: ", err);
      setError("Não foi possível carregar os clientes. Tente novamente mais tarde.");
      toast({ title: "Erro ao carregar clientes", description: err.message, variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const formatDate = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  const handleEdit = (id: string) => {
    router.push(`/dashboard/cadastros/clientes/${id}/editar`);
  }

  const handleOpenDeleteDialog = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;
    setIsLoading(true); 
    try {
      await deleteDoc(doc(db, 'clientes', clienteToDelete.id));
      toast({
        title: "Cliente excluído!",
        description: `O cliente "${clienteToDelete.nome}" foi removido com sucesso.`,
      });
    } catch (err) {
      console.error("Erro ao excluir cliente: ", err);
      toast({
        title: "Erro ao excluir",
        description: `Não foi possível remover o cliente "${clienteToDelete.nome}". Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setClienteToDelete(null);
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes cadastrados.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cadastros/clientes/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Clientes</CardTitle>
          <CardDescription>
            Lista de clientes cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && clientes.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Carregando clientes...</p>
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
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">E-mail</TableHead>
                  <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                  <TableHead className="hidden lg:table-cell">Cidade</TableHead>
                  <TableHead className="hidden lg:table-cell">Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.length > 0 ? (
                  clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell className="hidden md:table-cell">{cliente.email || '-'}</TableCell>
                      <TableCell className="hidden sm:table-cell">{cliente.telefone || '-'}</TableCell>
                       <TableCell className="hidden lg:table-cell">
                        {cliente.endereco?.cidade ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/> 
                            {cliente.endereco.cidade}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatDate(cliente.dataCadastro)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="mr-1" onClick={() => handleEdit(cliente.id)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOpenDeleteDialog(cliente)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64">
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <Users className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">Nenhum cliente cadastrado.</p>
                        <p className="text-sm text-muted-foreground">
                          Clique em &quot;Novo Cliente&quot; para começar.
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

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <span className="font-semibold text-primary">{clienteToDelete?.nome}</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClienteToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
