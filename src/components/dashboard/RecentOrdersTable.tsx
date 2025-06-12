
"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Info, ArrowUpRight, ExternalLink } from "lucide-react";
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, limit, onSnapshot, type QuerySnapshot, type DocumentData, type FirestoreError, Timestamp } from 'firebase/firestore';

interface RecentOrder {
  id: string;
  nomeCliente?: string;
  status: string;
  valorTotal?: number;
  dataCriacao?: Timestamp;
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

function OriginalRecentOrdersTable() {
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoadingRecentOrders, setIsLoadingRecentOrders] = useState(true);

  useEffect(() => {
    setIsLoadingRecentOrders(true);
    const pedidosCollectionRef = collection(db, 'pedidos');
    // Query para buscar os 5 pedidos mais recentes, ordenados por data de criação descendente
    const q = query(pedidosCollectionRef, orderBy('dataCriacao', 'desc'), limit(5));

    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const orders: RecentOrder[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as RecentOrder);
      });
      setRecentOrders(orders);
      setIsLoadingRecentOrders(false);
    }, (error: FirestoreError) => {
      console.error("Erro ao buscar pedidos recentes:", error);
      setRecentOrders([]); // Define como vazio em caso de erro
      setIsLoadingRecentOrders(false);
    });

    return () => unsubscribe();
  }, []);

  return (
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
                  <TableCell className="font-medium whitespace-nowrap">{order.id.substring(0,7)}...</TableCell>
                  <TableCell className="hidden sm:table-cell">{order.nomeCliente || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={"outline"} className={`whitespace-nowrap ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">R$ {order.valorTotal?.toFixed(2).replace('.', ',') || '0,00'}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    {order.dataCriacao ? new Date(order.dataCriacao.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
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
  );
}

const RecentOrdersTable = React.memo(OriginalRecentOrdersTable);
export default RecentOrdersTable;
