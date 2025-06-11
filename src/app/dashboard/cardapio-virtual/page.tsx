
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, QrCode, Info, LayoutList, Download, RefreshCw, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';

const QRCodeCanvas = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeCanvas), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-48 w-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>,
});


export default function CardapioVirtualPage() {
  const { toast } = useToast();
  const [restaurantSlug, setRestaurantSlug] = useState("meu-restaurante-exemplo");
  const [publicLink, setPublicLink] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const generateQRCode = () => {
    if (!publicLink) {
      toast({ title: "Erro", description: "Link público não está disponível para gerar QR Code.", variant: "destructive"});
      return;
    }
    setIsGeneratingQr(true);
    setTimeout(() => {
      const canvasElement = qrCanvasRef.current?.querySelector('canvas');
      if (canvasElement) {
        const dataUrl = canvasElement.toDataURL('image/png');
        setQrCodeDataUrl(dataUrl);
        toast({ title: "QR Code Gerado!", description: "O QR Code para seu cardápio está pronto." });
      } else {
        // Se o canvas não for encontrado, é provável que o QRCodeCanvas ainda não tenha renderizado.
        // Isso pode acontecer se o dynamic import ainda estiver carregando.
        // Uma melhoria seria esperar o componente QRCodeCanvas estar pronto.
        toast({ title: "Aguarde", description: "Gerando QR Code, por favor, espere um momento.", variant: "default"});
        // Tentar novamente após um tempo maior se o canvas não for encontrado imediatamente.
        // Ou usar um estado para controlar quando o QRCodeCanvas está pronto para ser lido.
        setTimeout(() => {
             const delayedCanvasElement = qrCanvasRef.current?.querySelector('canvas');
             if (delayedCanvasElement) {
                const dataUrl = delayedCanvasElement.toDataURL('image/png');
                setQrCodeDataUrl(dataUrl);
                toast({ title: "QR Code Gerado!", description: "O QR Code para seu cardápio está pronto." });
             } else {
                toast({ title: "Erro ao gerar QR Code", description: "Não foi possível encontrar o canvas do QR Code após espera.", variant: "destructive"});
             }
             setIsGeneratingQr(false);
        }, 1000); // Aumenta o delay para dar mais tempo ao dynamic import
        return; // Retorna para não setar isGeneratingQr para false prematuramente
      }
      setIsGeneratingQr(false);
    }, 150); // Aumentado ligeiramente o delay inicial
  };

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `qrcode-cardapio-${restaurantSlug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Download Iniciado", description: "O QR Code está sendo baixado."});
    } else {
      toast({ title: "QR Code não gerado", description: "Gere o QR Code antes de tentar baixá-lo.", variant: "destructive"});
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
          <CardContent className="space-y-4">
            <div ref={qrCanvasRef} className={qrCodeDataUrl ? 'hidden' : 'flex justify-center items-center min-h-[208px]'}>
              {publicLink && <QRCodeCanvas value={publicLink} size={256} level="H" includeMargin={true} />}
            </div>

            {qrCodeDataUrl ? (
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-primary rounded-lg bg-muted/30">
                <img src={qrCodeDataUrl} alt="QR Code do Cardápio" className="w-48 h-48 rounded-md shadow-md" />
              </div>
            ) : (
               !publicLink ? (
                <div className="flex items-center justify-center h-52 border-2 border-dashed border-muted rounded-lg bg-muted/30">
                    <div className="text-center text-muted-foreground">
                        <Loader2 className="mx-auto h-12 w-12 mb-2 animate-spin" />
                        <p>Aguardando link público...</p>
                    </div>
                </div>
               ) : (
                <div className="flex items-center justify-center h-52 border-2 border-dashed border-muted rounded-lg bg-muted/30">
                    <div className="text-center text-muted-foreground">
                    <QrCode className="mx-auto h-12 w-12 mb-2" />
                    <p>Clique em "Gerar QR Code" abaixo.</p>
                    </div>
                </div>
               )
            )}
            
            <div className="flex gap-2">
                <Button onClick={generateQRCode} className="w-full" disabled={isGeneratingQr || !publicLink}>
                {isGeneratingQr ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {qrCodeDataUrl ? "Gerar Novamente" : "Gerar QR Code"}
                </Button>
                {qrCodeDataUrl && (
                <Button onClick={downloadQRCode} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar QR Code
                </Button>
                )}
            </div>
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
