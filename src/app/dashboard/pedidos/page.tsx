import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, PlusCircle, Search } from "lucide-react";
import Link from "next/link";

// Mock data for demonstration
const mockPedidos = [
  { id: "PED1001", cliente: "João Silva", itens: "2x Pizza M, 1x Refri G", total: "R$ 95,00", status: "Novo", hora: "10:15" },
  { id: "PED1002", cliente: "Maria Oliveira", itens: "1x Hambúrguer X, 1x Batata F.", total: "R$ 42,30", status: "Em preparo", hora: "10:12" },
  { id: "PED1003", cliente: "Carlos Pereira", itens: "3x Sushi Combo", total: "R$ 180,00", status: "Pronto", hora: "10:05" },
  { id: "PED1004", cliente: "Ana Costa", itens: "1x Salada Caesar", total: "R$ 30,00", status: "Finalizado", hora: "09:50" },
  { id: "PED1005", cliente: "Pedro Martins", itens: "1x Lasanha B., 2x Suco L.", total: "R$ 65,00", status: "Em preparo", hora: "10:20" },
];

function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case "novo": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "em preparo": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "pronto": return "bg-primary/20 text-primary border-primary/30";
    case "finalizado": return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

export default function PedidosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Gerenciamento de Pedidos</h1>
          <p className="text-muted-foreground">Visualize e gerencie todos os pedidos do seu restaurante.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/pedidos/novo">
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Pedido
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>Filtre e acompanhe os pedidos em tempo real.</CardDescription>
          <div className="mt-4 flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar por ID ou cliente..." className="pl-8 w-full" />
            </div>
            <Select defaultValue="todos">
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status do Pedido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="em_preparo">Em Preparo</SelectItem>
                <SelectItem value="pronto">Pronto</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Hora</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell className="font-medium">{pedido.id}</TableCell>
                  <TableCell>{pedido.cliente}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate">{pedido.itens}</TableCell>
                  <TableCell className="text-right">{pedido.total}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`whitespace-nowrap ${getStatusBadgeClass(pedido.status)}`}>
                      {pedido.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell">{pedido.hora}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/pedidos/${pedido.id}`}>Ver Detalhes</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
