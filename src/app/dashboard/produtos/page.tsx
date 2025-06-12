
"use client";

import React from 'react'; // Adicionado React
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

function OriginalItensPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Itens do Cardápio</h1>
          <p className="text-muted-foreground">Gerencie os itens que compõem seu cardápio.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/produtos/novo">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Itens</CardTitle>
          <CardDescription>Seus itens cadastrados aparecerão aqui.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground opacity-50 mb-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          <p className="text-muted-foreground">Nenhum item cadastrado ainda.</p>
          <Button variant="link" className="mt-2 text-primary" asChild>
            <Link href="/dashboard/produtos/novo">Adicionar seu primeiro item</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const ItensPage = React.memo(OriginalItensPage);
export default ItensPage;
