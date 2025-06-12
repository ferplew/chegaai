
"use client";

import React, { useState, useEffect } from 'react'; // Adicionado React
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy, Timestamp, doc, deleteDoc, type FirebaseError } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle, LayoutGrid } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";

interface Categoria {
  id: string;
  nome: string;
  dataCriacao: Timestamp;
}

function OriginalCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const categoriasCollectionRef = collection(db, 'categorias');
    const q = query(categoriasCollectionRef, orderBy('nome', 'asc')); // Ordenar por nome

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const categoriasData: Categoria[] = [];
      querySnapshot.forEach((doc) => {
        categoriasData.push({ id: doc.id, ...doc.data() } as Categoria);
      });
      setCategorias(categoriasData);
      setIsLoading(false);
      setError(null);
    }, (err: FirebaseError) => {
      console.error("Erro ao buscar categorias: ", err);
      setError("Não foi possível carregar as categorias. Tente novamente mais tarde.");
      toast({ title: "Erro ao carregar categorias", description: err.message, variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const formatDate = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  const handleEdit = (id: string) => {
    // Navegar para a página de edição
    // router.push(`/dashboard/cadastros/categorias/${id}/editar`);
    toast({ title: "Em breve", description: `Funcionalidade de editar categoria ${id} será implementada.`});
  }

  const handleOpenDeleteDialog = (categoria: Categoria) => {
    setCategoriaToDelete(categoria);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoriaToDelete) return;
    setIsLoading(true); 
    try {
      await deleteDoc(doc(db, 'categorias', categoriaToDelete.id));
      toast({
        title: "Categoria excluída!",
        description: `A categoria "${categoriaToDelete.nome}" foi removida com sucesso.`,
      });
    } catch (err) {
      const firestoreError = err as FirebaseError;
      console.error("Erro ao excluir categoria: ", firestoreError);
      toast({
        title: "Erro ao excluir",
        description: `Não foi possível remover a categoria "${categoriaToDelete.nome}". Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setCategoriaToDelete(null);
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Categorias de Produtos</h1>
          <p className="text-muted-foreground">Gerencie as categorias dos seus itens de cardápio.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cadastros/categorias/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Categoria
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Minhas Categorias</CardTitle>
          <CardDescription>
            Categorias cadastradas para organizar seus produtos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && categorias.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Carregando categorias...</p>
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
                  <TableHead>Nome da Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.length > 0 ? (
                  categorias.map((categoria) => (
                    <TableRow key={categoria.id}>
                      <TableCell className="font-medium">{categoria.nome}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(categoria.dataCriacao)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="mr-1" onClick={() => handleEdit(categoria.id)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOpenDeleteDialog(categoria)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-64">
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <LayoutGrid className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">Nenhuma categoria criada ainda.</p>
                        <p className="text-sm text-muted-foreground">
                          Clique em &quot;Nova Categoria&quot; para começar.
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
              Tem certeza que deseja excluir a categoria <span className="font-semibold text-primary">{categoriaToDelete?.nome}</span>? Esta ação não pode ser desfeita e pode afetar produtos vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoriaToDelete(null)}>Cancelar</AlertDialogCancel>
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

const CategoriasPage = React.memo(OriginalCategoriasPage);
export default CategoriasPage;
