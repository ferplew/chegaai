
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, PlusCircle, Search, Info, Loader2 } from "lucide-react";
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
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, where, onSnapshot, Timestamp, type Query, type DocumentData } from 'firebase/firestore';

interface Pedido {
  id: string;
  nomeCliente: string;
  itensPedido: string;
  valorTotal: number;
  status: 'Novo' | 'Em preparo' | 'Pronto' | 'Finalizado' | 'Cancelado';
  dataCriacao: Timestamp;
}

function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "novo": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "em preparo": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "pronto": return "bg-primary/20 text-primary border-primary/30";
    case "finalizado": return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    case "cancelado": return "bg-destructive/20 text-destructive border-destructive/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

function OriginalPedidosPage() {
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("todos"); // 'todos' ou um status específico

  const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const { toast } = useToast();
  const MAX_DATE_RANGE_DAYS = 90;

  React.useEffect(() => {
    setIsLoading(true);
    let firestoreQuery: Query<DocumentData> = collection(db, 'pedidos');

    // Aplicar filtro de data
    if (selectedDateRange?.from) {
      firestoreQuery = query(firestoreQuery, where('dataCriacao', '>=', Timestamp.fromDate(startOfDay(selectedDateRange.from))));
    }
    if (selectedDateRange?.to) {
      // Para 'menor ou igual a', precisamos do final do dia.
      firestoreQuery = query(firestoreQuery, where('dataCriacao', '<=', Timestamp.fromDate(endOfDay(selectedDateRange.to))));
    }

    // Aplicar filtro de status
    if (statusFilter !== "todos") {
      firestoreQuery = query(firestoreQuery, where('status', '==', statusFilter));
    }
    
    // Ordenar por data de criação (mais recentes primeiro)
    firestoreQuery = query(firestoreQuery, orderBy('dataCriacao', 'desc'));

    const unsubscribe = onSnapshot(firestoreQuery, (querySnapshot) => {
      const pedidosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Pedido));
      
      // Aplicar filtro de busca por nome do cliente ou ID do pedido (client-side após a query)
      const filteredByNameOrId = searchTerm
        ? pedidosData.filter(pedido =>
            pedido.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pedido.id.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : pedidosData;

      setPedidos(filteredByNameOrId);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar pedidos: ", error);
      toast({ title: "Erro ao carregar pedidos", description: error.message, variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDateRange, statusFilter, searchTerm, toast]);


  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      if (differenceInDays(range.to, range.from) > MAX_DATE_RANGE_DAYS) {
        toast({
          title: "Intervalo de datas muito longo",
          description: `Por favor, selecione um intervalo de no máximo ${MAX_DATE_RANGE_DAYS} dias.`,
          variant: "destructive",
        });
        // Optionally, revert to a valid range or clear it
        return; 
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

  const formatDateFromTimestamp = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return 'N/A';
    // Formatando para Hora:Minuto
    return format(timestamp.toDate(), "HH:mm", { locale: ptBR });
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
              <Input 
                id="search-pedidos" 
                type="search" 
                placeholder="Buscar por ID ou cliente..." 
                className="pl-8 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full lg:w-auto">
              <Label htmlFor="status-filter" className="sr-only">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="w-full lg:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status do Pedido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Em preparo">Em Preparo</SelectItem>
                  <SelectItem value="Pronto">Pronto</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
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
                />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Itens (resumo)</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Hora</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Carregando pedidos...</p>
                  </TableCell>
                </TableRow>
              ) : pedidos.length > 0 ? (
                pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">{pedido.id.substring(0, 7)}...</TableCell>
                    <TableCell>{pedido.nomeCliente}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                      {pedido.itensPedido.length > 50 ? `${pedido.itensPedido.substring(0, 50)}...` : pedido.itensPedido}
                    </TableCell>
                    <TableCell className="text-right">R$ {pedido.valorTotal.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`whitespace-nowrap ${getStatusBadgeClass(pedido.status)}`}>
                        {pedido.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{formatDateFromTimestamp(pedido.dataCriacao)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/pedidos/${pedido.id}`}>Ver Detalhes</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <Info className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum pedido encontrado para os filtros selecionados.</p>
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

const PedidosPage = React.memo(OriginalPedidosPage);
export default PedidosPage;
