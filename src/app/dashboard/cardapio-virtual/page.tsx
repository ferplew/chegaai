
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Link as LinkIcon, QrCode, ExternalLink, Info, LayoutList } from "lucide-react";

export default function CardapioVirtualPage() {
  const { toast } = useToast();
  // TODO: Substituir por dados reais do perfil do negócio
  const [restaurantSlug, setRestaurantSlug] = useState("meu-restaurante-exemplo"); 
  const [publicLink, setPublicLink] = useState("");

  useEffect(() => {
    // Simula a geração do link público. Em um cenário real, isso pode vir de uma configuração.
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setPublicLink(`${origin}/cardapio/${restaurantSlug}`);
    }
  }, [restaurantSlug]);

  const handleCopyLink = () => {
    if (publicLink) {
      navigator.clipboard.writeText(publicLink)
        .then(() => {
          toast({ title: "Link Copiado!", description: "O link do cardápio virtual foi copiado para a área de transferência." });
        })
        .catch(err => {
          toast({ title: "Erro ao copiar", description: "Não foi possível copiar o link.", variant: "destructive" });
          console.error('Erro ao copiar link: ', err);
        });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Cardápio Virtual</h1>
        <p className="text-muted-foreground">Gere QR Code e link público do seu cardápio para seus clientes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Link Público do seu Cardápio</CardTitle>
          <CardDescription>Compartilhe este link com seus clientes para que eles acessem seu cardápio online.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {publicLink ? (
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="w-full sm:flex-grow">
                <Label htmlFor="publicLinkInput" className="sr-only">Link Público</Label>
                <Input id="publicLinkInput" type="text" value={publicLink} readOnly className="bg-muted/50"/>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={handleCopyLink} variant="outline" className="w-full sm:w-auto">
                  <Copy className="mr-2 h-4 w-4" /> Copiar Link
                </Button>
                <Button asChild className="w-full sm:w-auto">
                  <a href={publicLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Abrir
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Gerando link...</p>
          )}
           <p className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
              <Info className="h-3 w-3 flex-shrink-0" /> 
              O nome "<span className="font-semibold">{restaurantSlug}</span>" no link será personalizável na seção "Perfil do Negócio".
            </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-primary"/> QR Code do Cardápio</CardTitle>
            <CardDescription>Permita que seus clientes acessem o cardápio escaneando o QR Code.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 border-2 border-dashed border-muted rounded-lg bg-muted/30">
              <div className="text-center text-muted-foreground">
                <QrCode className="mx-auto h-12 w-12 mb-2" />
                <p>Geração de QR Code em breve.</p>
              </div>
            </div>
            <Button className="mt-4 w-full" disabled>Gerar/Baixar QR Code</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LayoutList className="h-5 w-5 text-primary"/> Gerenciar Itens do Cardápio</CardTitle>
            <CardDescription>Os itens cadastrados na seção "Produtos" aparecerão aqui e no seu cardápio público.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-center h-48 border-2 border-dashed border-muted rounded-lg bg-muted/30">
                <div className="text-center text-muted-foreground">
                    <LayoutList className="mx-auto h-12 w-12 mb-2" />
                    <p>Pré-visualização e ordenação dos itens em breve.</p>
                </div>
            </div>
            <Button variant="outline" className="mt-4 w-full" asChild>
                <a href="/dashboard/produtos">
                    <ExternalLink className="mr-2 h-4 w-4" /> Ir para Cadastro de Produtos
                </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
