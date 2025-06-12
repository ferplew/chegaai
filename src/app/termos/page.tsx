
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { ChegaAiLogo } from '@/components/icons/ChegaAiLogo';

export default function TermosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
          <Link href="/" aria-label="Página Inicial Chega Aí">
            <ChegaAiLogo className="h-8 text-primary" />
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <Button variant="outline" asChild>
                <Link href="/login">Acessar Painel</Link>
              </Button>
              <Button asChild>
                <Link href="/login?action=register">Cadastrar Restaurante</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-8">
            <Button variant="outline" size="icon" asChild className="mb-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar para Home</span>
              </Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">Termos e Condições de Uso</h1>
            <p className="text-muted-foreground text-lg">Leia atentamente nossos termos antes de usar a plataforma.</p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="space-y-6 pt-6 text-muted-foreground">
              <p className="text-sm">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
              
              <p>Bem-vindo ao Chega Aí! Estes termos e condições descrevem as regras e regulamentos para o uso da plataforma Chega Aí, localizada em [seu_dominio.com].</p>
              <p>Ao acessar esta plataforma, presumimos que você aceita estes termos e condições. Não continue a usar o Chega Aí se você não concordar com todos os termos e condições estabelecidos nesta página.</p>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>1. Definições</h2>
                <p>As seguintes terminologias se aplicam a estes Termos e Condições, Declaração de Privacidade e Aviso de Isenção de Responsabilidade e todos os Acordos: "Cliente", "Você" e "Seu" referem-se a você, a pessoa que acessa esta plataforma e está em conformidade com os termos e condições da Empresa. "A Empresa", "Nós", "Nosso" e "Conosco", referem-se à nossa Empresa. "Parte", "Partes", ou "Nós", refere-se tanto ao Cliente quanto a nós mesmos.</p>

                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>2. Uso da Plataforma</h2>
                <p>O Chega Aí concede a você uma licença limitada, não exclusiva, intransferível e revogável para usar nossa plataforma para fins de gerenciamento de seu restaurante, conforme permitido por estes Termos.</p>
                <p>Você concorda em não usar a plataforma para qualquer finalidade ilegal ou proibida por estes Termos.</p>

                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>3. Contas de Usuário</h2>
                <p>Para acessar certas funcionalidades da plataforma, você pode ser obrigado a criar uma conta. Você é responsável por manter a confidencialidade de sua senha e conta e por todas
                as atividades que ocorram sob sua conta.</p>
                <p>Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta ou qualquer outra violação de segurança.</p>

                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>4. Conteúdo e Dados</h2>
                <p>Você é o único responsável por todos os dados, informações e conteúdo que você envia, publica ou exibe na plataforma ("Seu Conteúdo"). Você retém todos os direitos sobre Seu Conteúdo, mas nos concede uma licença mundial, isenta de royalties, para usar, reproduzir, modificar e distribuir Seu Conteúdo exclusivamente com o propósito de operar e fornecer os serviços da plataforma.</p>
                <p>Não nos responsabilizamos por qualquer perda ou corrupção de Seu Conteúdo.</p>
                
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>5. Limitação de Responsabilidade</h2>
                <p>Até o limite máximo permitido pela lei aplicável, em nenhum caso o Chega Aí será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, ou qualquer perda de lucros ou receitas, seja incorrida direta ou indiretamente, ou qualquer perda de dados, uso, ágio ou outras perdas intangíveis, resultantes de (i) seu acesso ou uso ou incapacidade de acessar ou usar a plataforma; (ii) qualquer conduta ou conteúdo de terceiros na plataforma.</p>

                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>6. Alterações nos Termos</h2>
                <p>Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso de pelo menos 30 dias antes de quaisquer novos termos entrarem em vigor. O que constitui uma alteração material será determinado a nosso exclusivo critério.</p>

                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>7. Contato</h2>
                <p>Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em <strong className="text-primary">contato@chegaai.com.br</strong> (exemplo).</p>
              </div>
              <p className="italic text-sm mt-6 border-t pt-4">
                <strong>Aviso Legal:</strong> O conteúdo desta página de Termos e Condições é puramente ilustrativo e gerado para fins de prototipagem. Ele não constitui aconselhamento jurídico e não deve ser usado como tal. Recomendamos que você consulte um profissional jurídico para elaborar os Termos e Condições adequados para o seu serviço.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
