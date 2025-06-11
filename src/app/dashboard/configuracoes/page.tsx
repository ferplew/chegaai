"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle"; // Re-using theme toggle logic

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Configurações</h1>
        <p className="text-muted-foreground">Ajuste as preferências do seu restaurante.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Restaurante</CardTitle>
          <CardDescription>Dados básicos do seu estabelecimento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="restaurantName">Nome do Restaurante</Label>
            <Input id="restaurantName" defaultValue="Restaurante Exemplo" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="restaurantAddress">Endereço</Label>
            <Input id="restaurantAddress" defaultValue="Rua das Palmeiras, 123" />
          </div>
          <Button>Salvar Informações</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências de Aparência</CardTitle>
          <CardDescription>Personalize a visualização do painel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="theme-mode" className="font-medium">Modo de Exibição</Label>
              <p className="text-sm text-muted-foreground">
                Alterne entre os temas claro e escuro.
              </p>
            </div>
            <ThemeToggle /> {/* Using the existing ThemeToggle component */}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Conexões Externas (APIs)</CardTitle>
          <CardDescription>Integre com outros serviços (ex: iFood, apps de delivery).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="ifood-integration" className="font-medium">Integração iFood</Label>
              <p className="text-sm text-muted-foreground">
                Sincronizar pedidos do iFood (requer configuração).
              </p>
            </div>
            <Switch id="ifood-integration" />
          </div>
           <Button variant="outline" disabled>Configurar Integrações</Button>
        </CardContent>
      </Card>
    </div>
  );
}
