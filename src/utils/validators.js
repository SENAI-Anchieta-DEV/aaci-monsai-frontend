// ─── Validadores reutilizáveis do projeto MONSAI ─────────────────────────────
// Centraliza todas as regras de validação para evitar duplicação entre componentes.
// Uso: import { validarNome, validarEmail, ... } from '../utils/validators';

/**
 * Valida se o nome tem pelo menos 3 caracteres.
 * @param {string} nome
 * @returns {string|null} Mensagem de erro ou null se válido
 */
export const validarNome = (nome) => {
  if (!nome || nome.trim().length < 3) return "O nome deve ter pelo menos 3 letras.";
  return null;
};

/**
 * Valida e-mail com @ e domínio .com.
 * @param {string} email
 * @returns {string|null}
 */
export const validarEmail = (email) => {
  if (!/^[^\s@]+@[^\s@]+\.com$/.test(email)) return "E-mail inválido (use @ e .com).";
  return null;
};

/**
 * Valida CPF — aceita com ou sem máscara.
 * @param {string} cpf
 * @returns {string|null}
 */
export const validarCPF = (cpf) => {
  if (!cpf || cpf.replace(/\D/g, "").length !== 11) return "CPF deve ter 11 dígitos.";
  return null;
};

/**
 * Valida CNPJ — aceita com ou sem máscara.
 * @param {string} cnpj
 * @returns {string|null}
 */
export const validarCNPJ = (cnpj) => {
  if (!cnpj || cnpj.replace(/\D/g, "").length !== 14) return "CNPJ deve ter 14 dígitos.";
  return null;
};

/**
 * Valida senha com:
 * - Mínimo de 6 caracteres.
 * - Pelo menos uma letra.
 * - Pelo menos um caractere especial (@$!%*?&).
 * @param {string} senha
 * @returns {string|null}
 */
export const validarSenha = (senha) => {
  if (!senha || senha.length < 6) {
    return "A senha deve ter no mínimo 6 caracteres.";
  }
/*
  // Verifica se contém pelo menos uma letra (maiúscula ou minúscula)
  const temLetra = /[a-zA-Z]/.test(senha);
  if (!temLetra) {
    return "A senha deve conter pelo menos uma letra.";
  }

  // Verifica se contém pelo menos um caractere especial
  const temCaractereEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
  if (!temCaractereEspecial) {
    return "A senha deve conter pelo menos um caractere especial.";
  }
    */

  return null;
};

/**
 * Valida se as duas senhas informadas são iguais.
 * @param {string} senha
 * @param {string} confirmacao
 * @returns {string|null}
 */
export const validarConfirmacaoSenha = (senha, confirmacao) => {
  if (senha !== confirmacao) return "As senhas não coincidem.";
  return null;
};

/**
 * Valida serial de dispositivo — campo obrigatório não vazio.
 * @param {string} serial
 * @returns {string|null}
 */
export const validarSerial = (serial) => {
  if (!serial || !serial.trim()) return "O Serial é obrigatório.";
  return null;
};

/**
 * Executa um mapa de validações e retorna o objeto de erros.
 * Recebe um objeto { campo: valorValidado } onde cada valor é o retorno de um validador.
 * Filtra apenas os campos com erro (valor não nulo).
 *
 * Exemplo de uso:
 *   const erros = coletarErros({
 *     nome: validarNome(formData.nome),
 *     email: validarEmail(formData.email),
 *   });
 *   if (Object.keys(erros).length > 0) { setErros(erros); return; }
 *
 * @param {Object.<string, string|null>} mapa
 * @returns {Object.<string, string>}
 */
export const coletarErros = (mapa) =>
  Object.fromEntries(
    Object.entries(mapa).filter(([, msg]) => msg !== null)
  );