
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  differenceInDays,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarDays, Download, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

const ADMIN_PASSWORD = "12345678"; // Senha de administrador temporária

export default function GanhosPage() {
  const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const { toast } = useToast();
  const MAX_DATE_RANGE_DAYS = 90;

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState("");
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput(""); // Limpa o campo após o login
    } else {
      setAuthError("Senha de administrador incorreta. Tente novamente.");
      setIsAuthenticated(false);
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      if (differenceInDays(range.to, range.from) > MAX_DATE_RANGE_DAYS) {
        toast({
          title: "Intervalo de datas muito longo",
          description: `Por favor, selecione um intervalo de no máximo ${MAX_DATE_RANGE_DAYS} dias.`,
          variant: "destructive",
        });
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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              Acesso Restrito
            </CardTitle>
            <CardDescription>
              Esta seção requer senha de administrador para visualização.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Senha de Administrador</Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Digite a senha"
                    className={authError ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
              </div>
              {authError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {authError}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Acessar Ganhos</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Ganhos</h1>
          <p className="text-muted-foreground">
            Visualize seus lucros e total recebido.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar Período</CardTitle>
          <CardDescription>Selecione um período para visualizar os ganhos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleSetToday}>Hoje</Button>
            <Button variant="outline" onClick={handleSetThisWeek}>Esta Semana</Button>
            <Button variant="outline" onClick={handleSetThisMonth}>Este Mês</Button>
            <DatePickerWithRange
              date={selectedDateRange}
              onDateChange={handleDateRangeChange}
              className="max-w-sm"
            />
          </div>
          {selectedDateRange?.from && (
            <div className="p-2 border border-dashed rounded-md text-sm text-muted-foreground">
              <CalendarDays className="inline-block mr-2 h-4 w-4" />
              Período selecionado: <span className="font-medium">{formatRangeForDisplay(selectedDateRange)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Ganhos</CardTitle>
          <CardDescription>
            Dados baseados no período: {formatRangeForDisplay(selectedDateRange)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 border rounded-lg bg-card-foreground/5">
              <h3 className="text-sm font-medium text-muted-foreground">Total Bruto</h3>
              <p className="text-2xl font-bold">R$ 0,00</p>
            </div>
            <div className="p-6 border rounded-lg bg-card-foreground/5">
              <h3 className="text-sm font-medium text-muted-foreground">Total de Pedidos</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="p-6 border rounded-lg bg-card-foreground/5">
              <h3 className="text-sm font-medium text-muted-foreground">Lucro Líquido Estimado</h3>
              <p className="text-2xl font-bold text-primary">R$ 0,00</p>
            </div>
          </div>
           <div className="flex items-center justify-center h-48 border border-dashed rounded-md mt-6">
            <p className="text-muted-foreground">Dados e gráficos de ganhos aparecerão aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
