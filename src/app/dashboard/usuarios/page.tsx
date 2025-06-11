
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react"; // Added Users icon
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Removed mockUsers
// const mockUsers = [
//   { id: "USR001", nome: "Chef Principal", email: "chef@restaurante.com", perfil: "Admin", status: "Ativo" },
//   { id: "USR002", nome: "Caixa 1", email: "caixa1@restaurante.com", perfil: "Operador", status: "Ativo" },
//   { id: "USR003", nome: "Gerente Turno B", email: "gerenteB@restaurante.com", perfil: "Gerente", status: "Inativo" },
// ];

// TODO: Fetch actual users from Firebase Auth or Firestore
const users: any[] = []; // Start with an empty array

export default function UsuariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os acessos da sua equipe.</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Convidar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Usuários com acesso ao painel do restaurante.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
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
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={user.perfil === 'Admin' ? 'default' : 'secondary'}>{user.perfil}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Ativo' ? 'outline' : 'destructive'} 
                             className={user.status === 'Ativo' ? 'border-primary text-primary' : ''}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Editar</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">Nenhum usuário cadastrado ainda.</p>
                      <Button variant="link" className="mt-1 text-primary">Convidar seu primeiro usuário</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
