
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// ThemeToggle removed, it's now in its own page /dashboard/tema

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Configurações Gerais</h1>
        <p className="text-muted-foreground">Ajustes e preferências do seu restaurante.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Restaurante</CardTitle>
          <CardDescription>Estes dados podem ser movidos para "Perfil do Negócio" em breve.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="restaurantName">Nome do Restaurante</Label>
            <Input id="restaurantName" placeholder="Nome do seu restaurante" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="restaurantAddress">Endereço</Label>
            <Input id="restaurantAddress" placeholder="Endereço principal do restaurante" />
          </div>
          <Button>Salvar Informações</Button>
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
       <Card>
        <CardHeader>
          <CardTitle>Outras Configurações</CardTitle>
          <CardDescription>Este é um espaço para outras configurações que não se encaixam nas novas seções "Perfil do Negócio", "Conta e Segurança" ou "Tema".</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 border border-dashed rounded-md">
           <p className="text-muted-foreground">Mais configurações aqui...</p>
        </CardContent>
      </Card>
    </div>
  );
}
