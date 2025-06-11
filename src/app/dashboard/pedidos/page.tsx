
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, PlusCircle, Search, CalendarDays, Download } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

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
  const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange | undefined>({
    from: startOfDay(new Date()), // Default to today
    to: endOfDay(new Date()),
  });
  const { toast } = useToast();
  const MAX_DATE_RANGE_DAYS = 90;

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      if (differenceInDays(range.to, range.from) > MAX_DATE_RANGE_DAYS) {
        toast({
          title: "Intervalo de datas muito longo",
          description: `Por favor, selecione um intervalo de no máximo ${MAX_DATE_RANGE_DAYS} dias.`,
          variant: "destructive",
        });
        // Optionally, revert to the previous valid range or a default
        // For now, we'll allow the selection but show the toast.
      }
    }
    setSelectedDateRange(range);
  };

  const setPredefinedRange = (from: Date, to: Date) => {
    setSelectedDateRange({ from, to });
  };

  const handleSetToday = () => {
    const today = new Date();
    setPredefinedRange(startOfDay(today), endOfDay(today));
  };

  const handleSetThisWeek = () => {
    const today = new Date();
    setPredefinedRange(startOfWeek(today, { locale: ptBR }), endOfWeek(today, { locale: ptBR }));
  };

  const handleSetThisMonth = () => {
    const today = new Date();
    setPredefinedRange(startOfMonth(today), endOfMonth(today));
  };
  
  const formatRangeForDisplay = (range: DateRange | undefined): string => {
    if (!range || !range.from) return "Nenhum período selecionado";
    if (range.to) {
      return `${format(range.from, "dd/MM/yy", { locale: ptBR })} - ${format(range.to, "dd/MM/yy", { locale: ptBR })}`;
    }
    return format(range.from, "dd/MM/yy", { locale: ptBR });
  };


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
          <CardTitle>Filtrar Pedidos</CardTitle>
          <CardDescription>
            Busque por ID, cliente, status ou período. 
            <span className="block text-xs text-muted-foreground mt-1">
                Período selecionado: {formatRangeForDisplay(selectedDateRange)}
            </span>
          </CardDescription>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-2 items-end">
            <div className="relative flex-grow lg:max-w-xs w-full">
              <Label htmlFor="search-pedidos" className="sr-only">Buscar</Label>
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="search-pedidos" type="search" placeholder="Buscar por ID ou cliente..." className="pl-8 w-full" />
            </div>
            <div className="w-full lg:w-auto">
              <Label htmlFor="status-filter" className="sr-only">Status</Label>
              <Select defaultValue="todos">
                <SelectTrigger id="status-filter" className="w-full lg:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status do Pedido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="em_preparo">Em Preparo</SelectItem>
                  <SelectItem value="pronto">Pronto</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="flex flex-wrap items-center gap-2 col-span-full lg:col-auto">
                <Button variant="outline" size="sm" onClick={handleSetToday}>Hoje</Button>
                <Button variant="outline" size="sm" onClick={handleSetThisWeek}>Esta Semana</Button>
                <Button variant="outline" size="sm" onClick={handleSetThisMonth}>Este Mês</Button>
                <DatePickerWithRange
                date={selectedDateRange}
                onDateChange={handleDateRangeChange}
                // className="max-w-sm" // Already handled by Popover content width
                />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* TODO: Implement actual filtering of pedidos based on selectedDateRange */}
          <p className="p-4 text-sm text-muted-foreground">
            A tabela abaixo ainda exibe dados de exemplo. A filtragem por data será implementada em breve.
          </p>
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
               {mockPedidos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhum pedido encontrado para o período selecionado.
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

    