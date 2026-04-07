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