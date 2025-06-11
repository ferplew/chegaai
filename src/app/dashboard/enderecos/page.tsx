
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

// Dados de exemplo para os endereços
const mockEnderecos = [
  {
    id: "END001",
    rua: "Rua das Palmeiras",
    numero: "123",
    bairro: "Centro",
    cidade: "Cidade Exemplo",
    cep: "12345-678",
    complemento: "Apto 101",
    referencia: "Próximo ao mercado",
  },
  {
    id: "END002",
    rua: "Avenida Principal",
    numero: "789",
    bairro: "Jardim das Flores",
    cidade: "Cidade Exemplo",
    cep: "98765-432",
    complemento: "",
    referencia: "Em frente à praça",
  },
  {
    id: "END003",
    rua: "Travessa dos Coqueiros",
    numero: "45B",
    bairro: "Vila Nova",
    cidade: "Cidade Exemplo",
    cep: "54321-876",
    complemento: "Casa com portão verde",
    referencia: "Ao lado da padaria",
  },
];

export default function EnderecosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Endereços</h1>
          <p className="text-muted-foreground">Gerencie os endereços de entrega e retirada.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Endereço Manualmente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endereços Cadastrados</CardTitle>
          <CardDescription>
            Visualize e gerencie os endereços associados aos seus clientes e pedidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rua</TableHead>
                <TableHead className="hidden sm:table-cell">Número</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead className="hidden md:table-cell">Cidade</TableHead>
                <TableHead className="hidden lg:table-cell">CEP</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEnderecos.length > 0 ? (
                mockEnderecos.map((endereco) => (
                  <TableRow key={endereco.id}>
                    <TableCell className="font-medium">{endereco.rua}</TableCell>
                    <TableCell className="hidden sm:table-cell">{endereco.numero}</TableCell>
                    <TableCell>{endereco.bairro}</TableCell>
                    <TableCell className="hidden md:table-cell">{endereco.cidade}</TableCell>
                    <TableCell className="hidden lg:table-cell">{endereco.cep}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum endereço cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
