
"use client";

import React, { useEffect, useState, Suspense } from 'react'; // Adicionado Suspense
import Link from "next/link";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Corrigido: TableHead adicionado
import { Button } from "@/components/ui/button";
import { ShoppingCart, DollarSign, Clock, Loader2, PlusCircle, Info } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, type QuerySnapshot, type DocumentData, type FirestoreError } from 'firebase/firestore';

const DynamicRecentOrdersTable = dynamic(() => import('@/components/dashboard/RecentOrdersTable'), {
  ssr: false,
  loading: () => (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Últimos Pedidos</CardTitle>
          <CardDescription>Acompanhe os pedidos mais recentes.</CardDescription>
        </div>
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
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Carregando últimos pedidos...</p>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  ),
});


// Helper para importação dinâmica e remoção de defaultProps problemáticos
const dynamicRechartsComponent = <P extends object>(
  componentName: keyof typeof import('recharts'),
  loadingComponent?: React.ReactNode
) => {
  return dynamic(
    () =>
      import('recharts').then((mod) => {
        const Component = mod[componentName] as any;
        if (Component && Component.defaultProps) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { defaultProps, ...ComponentWithoutDefaultProps } = Component;
          return ComponentWithoutDefaultProps as React.ComponentType<P>;
        }
        return Component as React.ComponentType<P>;
      }),
    {
      ssr: false,
      loading: () => loadingComponent || <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Carregando...</p></div>,
    }
  );
};

const defaultChartLoading = <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Carregando gráfico...</p></div>;

const DynamicBarChart = dynamicRechartsComponent<React.ComponentProps<typeof import('recharts').BarChart>>('BarChart', defaultChartLoading);
const DynamicBar = dynamicRechartsComponent<React.ComponentProps<typeof import('recharts').Bar>>('Bar');
const DynamicCartesianGrid = dynamicRechartsComponent<React.ComponentProps<typeof import('recharts').CartesianGrid>>('CartesianGrid');
const DynamicXAxis = dynamicRechartsComponent<React.ComponentProps<typeof import('recharts').XAxis>>('XAxis');
const DynamicYAxis = dynamicRechartsComponent<React.ComponentProps<typeof import('recharts').YAxis>>('YAxis');


// Example data for the chart structure, actual data should be dynamic
const dailyOrdersDataExample = [
  { hour: "08:00", pedidos: 0 }, { hour: "09:00", pedidos: 0 }, { hour: "10:00", pedidos: 0 },
  { hour: "11:00", pedidos: 0 }, { hour: "12:00", pedidos: 0 }, { hour: "13:00", pedidos: 0 },
  { hour: "14:00", pedidos: 0 }, { hour: "15:00", pedidos: 0 }, { hour: "16:00", pedidos: 0 },
];

const chartConfig = {
  pedidos: { label: "Pedidos", color: "hsl(var(--primary))" },
};

function OriginalDashboardPage() {
  const [pedidosEmAndamentoCount, setPedidosEmAndamentoCount] = useState<number | null>(null);
  const [isLoadingPedidosEmAndamento, setIsLoadingPedidosEmAndamento] = useState(true);

  useEffect(() => {
    const pedidosCollectionRef = collection(db, 'pedidos');
    const q = query(pedidosCollectionRef, where('status', 'in', ['Novo', 'Em preparo']));

    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      setPedidosEmAndamentoCount(querySnapshot.size);
      setIsLoadingPedidosEmAndamento(false);
    }, (error: FirestoreError) => {
      console.error("Erro ao buscar pedidos em andamento:", error);
      setPedidosEmAndamentoCount(0);
      setIsLoadingPedidosEmAndamento(false);
    });

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
            <Suspense fallback={defaultChartLoading}>
              <ChartContainer config={chartConfig}>
                <DynamicBarChart data={dailyOrdersDataExample} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <DynamicCartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                  <DynamicXAxis dataKey="hour" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <DynamicYAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <DynamicBar dataKey="pedidos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </DynamicBarChart>
              </ChartContainer>
            </Suspense>
          </CardContent>
        </Card>
        
        <Suspense fallback={ // Suspense para a tabela de pedidos recentes
          <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle>Carregando Pedidos...</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        }>
          <DynamicRecentOrdersTable />
        </Suspense>

      </div>
    </div>
  );
}

const DashboardPage = React.memo(OriginalDashboardPage);
export default DashboardPage;
