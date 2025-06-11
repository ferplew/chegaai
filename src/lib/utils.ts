
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidCPF(cpf: string): boolean {
  if (typeof cpf !== 'string') return false;
  cpf = cpf.replace(/[^\d]+/g, ''); // Remove non-numeric characters
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false; // Check length and if all digits are the same

  const digits = cpf.split('').map(Number);

  const calc = (x: number) => {
    const slice = digits.slice(0, x);
    let factor = x + 1;
    const sum = slice.reduce((acc, digit) => acc + digit * factor--, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return calc(9) === digits[9] && calc(10) === digits[10];
}

export function isValidCNPJ(cnpj: string): boolean {
  if (typeof cnpj !== 'string') return false;
  cnpj = cnpj.replace(/[^\d]+/g, ''); // Remove non-numeric characters

  if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false; // Check length and if all digits are the same

  // Calculation for Verifying Digits
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1), 10);
}
