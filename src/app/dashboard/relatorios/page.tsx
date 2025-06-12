
"use client"; // Adicionado para uso de DatePickerWithRange que é client-side

import React from "react"; // Adicionado React
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

function OriginalRelatoriosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Relatórios</h1>
          <p className="text-muted-foreground">Analise o desempenho do seu restaurante.</p>
        </div>
        <div className="flex gap-2">
           <DatePickerWithRange className="w-full sm:w-auto" />
          <Button className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Exportar Dados
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Volume de Vendas</CardTitle>
            <CardDescription>Total de vendas no período selecionado.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Gráfico de volume de vendas aparecerá aqui.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Itens Mais Vendidos</CardTitle>
            <CardDescription>Produtos com maior saída no período.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Lista ou gráfico de itens mais vendidos.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Médias de Tempo</CardTitle>
            <CardDescription>Tempo médio de preparo e entrega.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Informações sobre médias de tempo.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Performance Geral</CardTitle>
            <CardDescription>Visão geral do desempenho.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Outros indicadores de performance.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const RelatoriosPage = React.memo(OriginalRelatoriosPage);
export default RelatoriosPage;
