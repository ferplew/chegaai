
"use client"; 

import React, { useState, useEffect } from 'react'; // Adicionado React
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Loader2, MapPin, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, type FirestoreError } from 'firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


interface Endereco {
  id: string;
  rua: string;
  numero?: string;
  bairro: string;
  cidade: string;
  cep: string;
  complemento?: string;
  referencia?: string;
  clienteNome?: string; 
  pedidoId?: string;
}

function OriginalEnderecosPage() {
  const { toast } = useToast();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enderecoToDelete, setEnderecoToDelete] = useState<Endereco | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);


  useEffect(() => {
    setIsLoading(true);
    const enderecosCollectionRef = collection(db, 'enderecos');
    // Ordenar por data de criação, se existir um campo de data. Senão, pode ser por outro campo ou sem ordenação específica.
    // Para este exemplo, vamos assumir que não há um campo 'dataCriacao' padrão nos mocks, então não ordenaremos.
    // Se fosse adicionar, seria: const q = query(enderecosCollectionRef, orderBy('dataCriacao', 'desc'));
    const q = query(enderecosCollectionRef, orderBy('clienteNome')); // Exemplo: ordenar por nome do cliente

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const enderecosData: Endereco[] = [];
      querySnapshot.forEach((doc) => {
        enderecosData.push({ id: doc.id, ...doc.data() } as Endereco);
      });
      setEnderecos(enderecosData);
      setIsLoading(false);
      setError(null);
    }, (err: FirestoreError) => {
      console.error("Erro ao buscar endereços: ", err);
      setError("Não foi possível carregar os endereços. Tente novamente mais tarde.");
      toast({ title: "Erro ao carregar endereços", description: err.message, variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleOpenDeleteDialog = (endereco: Endereco) => {
    setEnderecoToDelete(endereco);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!enderecoToDelete) return;
    // Usar um estado de loading específico para a exclusão se desejar feedback mais granular
    // setIsLoading(true); 
    try {
      await deleteDoc(doc(db, 'enderecos', enderecoToDelete.id));
      toast({
        title: "Endereço excluído!",
        description: `O endereço de ${enderecoToDelete.clienteNome || enderecoToDelete.rua} foi removido.`,
      });
    } catch (err) {
      const firestoreError = err as FirestoreError;
      console.error("Erro ao excluir endereço: ", firestoreError);
      toast({
        title: "Erro ao excluir",
        description: `Não foi possível remover o endereço. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setEnderecoToDelete(null);
      // setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Endereços</h1>
          <p className="text-muted-foreground">Gerencie os endereços de entrega e retirada.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/enderecos/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Endereço Manualmente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endereços Cadastrados</CardTitle>
          <CardDescription>
            Visualize e gerencie os endereços associados aos seus clientes e pedidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
           {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Carregando endereços...</p>
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
                    <TableHead>Cliente / Rua</TableHead>
                    <TableHead className="hidden sm:table-cell">Bairro</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead className="hidden md:table-cell">CEP</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {enderecos.length > 0 ? (
                    enderecos.map((endereco) => (
                    <TableRow key={endereco.id}>
                        <TableCell className="font-medium">
                        {endereco.clienteNome ? (
                            <>
                                {endereco.clienteNome}
                                <span className="block text-xs text-muted-foreground">{endereco.rua}, {endereco.numero || 'S/N'}</span>
                            </>
                        ) : (
                            `${endereco.rua}, ${endereco.numero || 'S/N'}`
                        )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{endereco.bairro}</TableCell>
                        <TableCell>{endereco.cidade}</TableCell>
                        <TableCell className="hidden md:table-cell">{endereco.cep}</TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="mr-2" asChild>
                            <Link href={`/dashboard/enderecos/${endereco.id}/editar`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleOpenDeleteDialog(endereco)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="h-64">
                        <div className="flex flex-col items-center justify-center text-center p-4">
                            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">Nenhum endereço cadastrado.</p>
                            <p className="text-sm text-muted-foreground">
                                Endereços de pedidos aparecerão aqui ou adicione manualmente.
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
              Tem certeza que deseja excluir o endereço de <span className="font-semibold text-primary">{enderecoToDelete?.clienteNome || enderecoToDelete?.rua}</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEnderecoToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              // disabled={isLoading} // Use um estado de loading específico para delete se necessário
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {/* {isLoadingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} */}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

const EnderecosPage = React.memo(OriginalEnderecosPage);
export default EnderecosPage;
