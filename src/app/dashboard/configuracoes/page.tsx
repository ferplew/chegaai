
import React from 'react'; 
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, ShieldCheck, Palette, Settings2 } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

function OriginalConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Configurações</h1>
        <p className="text-muted-foreground">Gerencie todos os aspectos do seu restaurante e painel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="h-6 w-6 text-primary"/> Perfil do Negócio</CardTitle>
            <CardDescription>Dados do restaurante, horários, endereço, taxas de entrega.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/perfil-negocio">Acessar Perfil</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary"/> Conta e Segurança</CardTitle>
            <CardDescription>Alterar senha, dados financeiros, preferências de segurança.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/conta-seguranca">Acessar Segurança</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-6 w-6 text-primary"/> Tema e Aparência</CardTitle>
            <CardDescription>Logotipo, banner, cor principal do painel, tema claro/escuro.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/tema">Personalizar Tema</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-3 hover:shadow-lg hover:border-primary/50 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-6 w-6 text-primary"/> Outras Configurações (Exemplo)</CardTitle>
            <CardDescription>Espaço para futuras configurações como integrações, etc.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32 border border-dashed rounded-md">
             <p className="text-muted-foreground">Mais configurações avançadas aqui...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const ConfiguracoesPage = React.memo(OriginalConfiguracoesPage);
export default ConfiguracoesPage;
