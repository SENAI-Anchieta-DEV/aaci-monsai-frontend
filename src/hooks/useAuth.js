// ─── Hook de autenticação do projeto MONSAI ──────────────────────────────────
// Centraliza a leitura do localStorage para dados da sessão ativa.
// Evita que cada componente acesse e converta os dados manualmente.
// Uso: const { token, perfil, asiloId, usuarioId, nome, email, cpf } = useAuth();

/**
 * Retorna os dados do usuário logado lidos do localStorage.
 * Todos os valores são derivados da sessão atual — sem chamadas à API.
 */
export const useAuth = () => ({
  token:     localStorage.getItem("token") || "",
  perfil:    localStorage.getItem("tipoPerfil")?.toUpperCase() || "",
  asiloId:   Number(localStorage.getItem("asiloId")) || null,
  usuarioId: Number(localStorage.getItem("usuarioId")) || null,
  nome:      localStorage.getItem("nomeUsuario") || "Usuário",
  email:     localStorage.getItem("emailUsuario") || "",
  cpf:       localStorage.getItem("cpfUsuario") || "",
});