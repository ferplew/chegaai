
"use client"

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Laptop } from "lucide-react";

export default function TemaPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Tema</h1>
        <p className="text-muted-foreground">Personalize a aparência do painel.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferências de Aparência</CardTitle>
          <CardDescription>Escolha como o painel será exibido.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={setTheme} className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="light" id="light-theme" />
                <Label htmlFor="light-theme" className="flex items-center cursor-pointer">
                  <Sun className="mr-2 h-5 w-5" />
                  Claro
                </Label>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="dark" id="dark-theme" />
                <Label htmlFor="dark-theme" className="flex items-center cursor-pointer">
                  <Moon className="mr-2 h-5 w-5" />
                  Escuro
                </Label>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors">
             <div className="flex items-center space-x-3">
                <RadioGroupItem value="system" id="system-theme" />
                <Label htmlFor="system-theme" className="flex items-center cursor-pointer">
                  <Laptop className="mr-2 h-5 w-5" />
                  Sistema
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
