// ─── Máscaras de input reutilizáveis do projeto MONSAI ───────────────────────
// Centraliza as formatações de campos para evitar duplicação entre componentes.
// Uso: import { mascararCPF, mascararCNPJ } from '../utils/masks';

/**
 * Aplica máscara de CPF: 000.000.000-00
 * Remove não-dígitos, limita a 11 caracteres e formata.
 * @param {string} valor - Valor bruto do input
 * @returns {string} Valor formatado
 */
export const mascararCPF = (valor) => {
  let v = valor.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  return v
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 * Remove não-dígitos, limita a 14 caracteres e formata.
 * @param {string} valor - Valor bruto do input
 * @returns {string} Valor formatado
 */
export const mascararCNPJ = (valor) => {
  let v = valor.replace(/\D/g, "");
  if (v.length > 14) v = v.substring(0, 14);
  return v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

/**
 * Aplica máscara de Cartão de Crédito: 0000 0000 0000 0000
 */
export const mascararCartao = (valor) => {
  let v = valor.replace(/\D/g, "");
  if (v.length > 16) v = v.substring(0, 16);
  return v.replace(/(\d{4})(?=\d)/g, "$1 ");
};

/**
 * Aplica máscara de Validade: MM/AA
 */
export const mascararValidade = (valor) => {
  let v = valor.replace(/\D/g, "");
  if (v.length > 4) v = v.substring(0, 4);
  return v.replace(/(\d{2})(\d)/, "$1/$2");
};

/**
 * Aplica máscara de CVV: 000 ou 0000 (Amex)
 */
export const mascararCVV = (valor) => {
  let v = valor.replace(/\D/g, "");
  if (v.length > 4) v = v.substring(0, 4);
  return v;
};

/**
 * Aplica máscara de CEP: 00000-000
 */
export const mascararCEP = (valor) => {
  let v = valor.replace(/\D/g, "");
  if (v.length > 8) v = v.substring(0, 8);
  return v.replace(/(\d{5})(\d)/, "$1-$2");
};