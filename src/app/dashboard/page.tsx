
"use client";

import React, { useEffect, useState } from 'react'; // Adicionado React aqui
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, DollarSign, Clock, Loader2, ArrowUpRight, ExternalLink, PlusCircle, Info } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, type QuerySnapshot, type DocumentData, type FirebaseError, Timestamp } from 'firebase/firestore';

// Example data for the chart structure, actual data should be dynamic
const dailyOrdersDataExample = [
  { hour: "08:00", pedidos: 0 }, { hour: "09:00", pedidos: 0 }, { hour: "10:00", pedidos: 0 },
  { hour: "11:00", pedidos: 0 }, { hour: "12:00", pedidos: 0 }, { hour: "13:00", pedidos: 0 },
  { hour: "14:00", pedidos: 0 }, { hour: "15:00", pedidos: 0 }, { hour: "16:00", pedidos: 0 },
];

const chartConfig = {
  pedidos: { label: "Pedidos", color: "hsl(var(--primary))" },
};

interface RecentOrder {
  id: string;
  nomeCliente?: string;
  status: string;
  valorTotal?: number;
  dataCriacao?: Timestamp; 
}

function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case "novo": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "em preparo": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "pronto": return "bg-primary/20 text-primary border-primary/30";
    case "finalizado": return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}


function OriginalDashboardPage() {
  const [pedidosEmAndamentoCount, setPedidosEmAndamentoCount] = useState<number | null>(null);
  const [isLoadingPedidosEmAndamento, setIsLoadingPedidosEmAndamento] = useState(true);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]); 
  const [isLoadingRecentOrders, setIsLoadingRecentOrders] = useState(true);


  useEffect(() => {
    const pedidosCollectionRef = collection(db, 'pedidos');
    const q = query(pedidosCollectionRef, where('status', 'in', ['Novo', 'Em preparo']));

    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      setPedidosEmAndamentoCount(querySnapshot.size);
      setIsLoadingPedidosEmAndamento(false);
    }, (error: FirebaseError) => {
      console.error("Erro ao buscar pedidos em andamento:", error);
      setPedidosEmAndamentoCount(0); 
      setIsLoadingPedidosEmAndamento(false);
    });
    
    // TODO: Implement fetching of recent orders (e.g., last 5 orders from Firestore)
    // For now, setting it to empty and loaded after a small delay
    setTimeout(() => {
        setRecentOrders([]); // Simulating no recent orders found
        setIsLoadingRecentOrders(false);
    }, 1000);


    return () => unsubscribe(); 
  }, []);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Bem-vindo!</h1>
          <p className="text-muted-foreground">Aqui está um resumo da sua operação.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/pedidos/novo">
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Pedido
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos Hoje</CardTitle>
            <ShoppingCart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Nenhum pedido ainda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento do Dia</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">Nenhum faturamento ainda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Preparo</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">- min</div>
            <p className="text-xs text-muted-foreground">Aguardando pedidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos em Andamento</CardTitle>
            {isLoadingPedidosEmAndamento ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
                <ShoppingCart className="h-5 w-5 text-primary" /> 
            )}
          </CardHeader>
          <CardContent>
            {isLoadingPedidosEmAndamento ? (
              <div className="text-2xl font-bold animate-pulse">-</div>
            ) : (
              <div className="text-2xl font-bold">{pedidosEmAndamentoCount ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Atualizado em tempo real</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Pedidos por Hora (Exemplo)</CardTitle>
            <CardDescription>Volume de pedidos ao longo do dia (dados de exemplo).</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full p-2">
            <ChartContainer config={chartConfig}>
              <BarChart data={dailyOrdersDataExample} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="pedidos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Últimos Pedidos</CardTitle>
              <CardDescription>
                Acompanhe os pedidos mais recentes.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/pedidos">
                Ver Todos
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Hora</TableHead>
                   <TableHead className="text-right sr-only">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRecentOrders ? (
                   <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                      <p className="mt-2 text-muted-foreground">Carregando últimos pedidos...</p>
                    </TableCell>
                  </TableRow>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell className="hidden sm:table-cell">{order.nomeCliente || 'N/A'}</TableCell>
                      <TableCell>
                         <Badge variant={"outline"} className={`whitespace-nowrap ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">R$ {order.valorTotal?.toFixed(2).replace('.', ',') || '0,00'}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        {order.dataCriacao ? new Date(order.dataCriacao.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'}) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/pedidos/${order.id}`}>
                            <ExternalLink className="h-4 w-4" />
                             <span className="sr-only">Ver pedido</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <Info className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Nenhum pedido recente encontrado.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const DashboardPage = React.memo(OriginalDashboardPage);
export default DashboardPage;
    
