
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy, Timestamp, doc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Para deletar usuário do Auth
import { db, app } from '@/lib/firebase/config'; // app é necessário para getAuth
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle, Users, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

interface Funcionario {
  id: string; // Firestore document ID
  uid: string; // Firebase Auth UID
  nome: string;
  email: string;
  perfil: 'Admin' | 'Operador' | 'Gerente' | string;
  status: 'Ativo' | 'Inativo';
  dataCriacao?: Timestamp;
}

function getPerfilBadgeVariant(perfil: string): "default" | "secondary" | "outline" {
  switch (perfil?.toLowerCase()) {
    case 'admin':
      return 'default';
    case 'gerente':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getStatusBadgeVariant(status: string): "default" | "destructive" | "secondary" {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'default'; // Usar default para ativo para ter fundo verde
      case 'inativo':
        return 'secondary'; // Usar secondary para inativo para ter fundo cinza
      default:
        return 'outline';
    }
}


export default function UsuariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [funcionarioToDelete, setFuncionarioToDelete] = useState<Funcionario | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const funcionariosCollectionRef = collection(db, 'funcionarios');
    const q = query(funcionariosCollectionRef, orderBy('nome', 'asc')); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const funcionariosData: Funcionario[] = [];
      querySnapshot.forEach((doc) => {
        funcionariosData.push({ id: doc.id, ...doc.data() } as Funcionario);
      });
      setFuncionarios(funcionariosData);
      setIsLoading(false);
      setError(null);
    }, (err) => {
      console.error("Erro ao buscar funcionários: ", err);
      setError("Não foi possível carregar os funcionários. Tente novamente mais tarde.");
      toast({ title: "Erro ao carregar funcionários", description: err.message, variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);
  
  const handleEdit = (id: string) => {
    // router.push(`/dashboard/usuarios/${id}/editar`);
    toast({ title: "Em breve", description: `Funcionalidade de editar funcionário ${id} será implementada.`});
  }

  const handleOpenDeleteDialog = (funcionario: Funcionario) => {
    setFuncionarioToDelete(funcionario);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!funcionarioToDelete) return;
    setIsDeleting(true); 
    
    // ATENÇÃO: Deletar do Firebase Auth é uma operação sensível e irreversível.
    // Idealmente, isso seria feito no backend com verificação de permissões.
    // Aqui, estamos fazendo client-side para fins de protótipo.
    // NÂO FAÇA ISSO EM PRODUÇÃO SEM MEDIDAS DE SEGURANÇA ADEQUADAS.
    try {
      // Primeiro, deletar do Firestore
      await deleteDoc(doc(db, 'funcionarios', funcionarioToDelete.id));
      
      // Tentar deletar do Firebase Auth - Isso é o mais complexo e requer reautenticação recente ou um backend.
      // Para este protótipo, vamos assumir que a exclusão do Firestore é suficiente
      // ou que a exclusão do Auth seria tratada de outra forma (ex: admin SDK no backend).
      // Se tentarmos deletar do Auth aqui sem as condições corretas, vai falhar.
      // Exemplo (geralmente falhará no cliente por segurança):
      // const auth = getAuth(app);
      // const user = auth.currentUser; // Isso é o *admin* logado, não o usuário a ser deletado
      // Se você tiver o UID e uma função de backend, você chamaria essa função.
      // Como não temos backend aqui, vamos focar na exclusão do Firestore.

      toast({
        title: "Funcionário removido!",
        description: `O funcionário "${funcionarioToDelete.nome}" foi removido do sistema. A conta de autenticação pode precisar ser removida manualmente ou via backend.`,
      });
    } catch (err) {
      console.error("Erro ao excluir funcionário: ", err);
      toast({
        title: "Erro ao excluir",
        description: `Não foi possível remover o funcionário "${funcionarioToDelete.nome}". Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setFuncionarioToDelete(null);
      setIsDeleting(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie os acessos da sua equipe ao painel.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/usuarios/novo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Funcionário
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipe Cadastrada</CardTitle>
          <CardDescription>
            Lista de funcionários com acesso ao sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && funcionarios.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Carregando funcionários...</p>
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
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcionarios.length > 0 ? (
                  funcionarios.map((func) => (
                    <TableRow key={func.id}>
                      <TableCell className="font-medium">{func.nome}</TableCell>
                      <TableCell>{func.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={getPerfilBadgeVariant(func.perfil)}>{func.perfil}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                            variant={getStatusBadgeVariant(func.status)}
                            className={func.status === 'Ativo' ? 'border-primary text-primary' : ''}
                        >
                            {func.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="mr-1" onClick={() => handleEdit(func.id)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOpenDeleteDialog(func)}
                          disabled={isDeleting}
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
                        <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">Nenhum funcionário cadastrado.</p>
                        <p className="text-sm text-muted-foreground">
                          Clique em &quot;Novo Funcionário&quot; para começar.
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
              Tem certeza que deseja remover o funcionário <span className="font-semibold text-primary">{funcionarioToDelete?.nome}</span>? Esta ação removerá o acesso dele ao sistema.
              A exclusão da conta de autenticação pode requerer ação adicional.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFuncionarioToDelete(null)} disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Excluir Funcionário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

