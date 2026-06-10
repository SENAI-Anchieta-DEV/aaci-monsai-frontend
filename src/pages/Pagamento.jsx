import { useState } from "react";
import { useToast } from "../components/ToastContext";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box, Button, Typography,
  TextField, Divider, Paper, Fade
} from "@mui/material";
import { mascararCPF, mascararCartao, mascararValidade, mascararCVV, mascararCEP } from '../utils/masks';

// Tema Premium - Mais contraste e tipografia elegante
const theme = createTheme({
  palette: {
    primary:   { main: "#2a5c14", dark: "#1a3d0a", light: "#7ec44f" },
    secondary: { main: "#4fa825" },
    background: { default: "#f4f9f1" } // Um verde beeem clarinho quase off-white
  },
  typography: {
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    h5: { fontWeight: 800, color: "#1a3d0a", letterSpacing: "-0.5px" },
    subtitle1: { fontWeight: 700, color: "#2a5c14" },
    button: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiButton: { 
      styleOverrides: { 
        root: { 
          borderRadius: 12, // Botões menos arredondados = design mais moderno e sério
          boxShadow: "0 4px 14px 0 rgba(42, 92, 20, 0.2)", 
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(42, 92, 20, 0.3)",
          }
        } 
      } 
    },
  },
});

const SELECTED_BORDER = "2px solid #2a5c14";
const UNSELECTED_BORDER = "2px solid transparent";

// ─── Animações CSS (Keyframes inline do MUI) ─────────────────────────────────
const fadeUp = {
  animation: "fadeUpAnim 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
  "@keyframes fadeUpAnim": {
    "0%": { opacity: 0, transform: "translateY(20px)" },
    "100%": { opacity: 1, transform: "translateY(0)" }
  }
};

// ─── Ícones (Mantidos e polidos) ──────────────────────────────────────────────
function VisaIcon() {
  return (
    <Box sx={{ bgcolor: "#1a1f71", borderRadius: 2, width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.2)" }}>
      <Typography sx={{ color: "#fff", fontWeight: 900, fontStyle: "italic",
        fontSize: { xs: "1.1rem", md: "1.5rem" }, letterSpacing: -1 }}>VISA</Typography>
    </Box>
  );
}

function MastercardIcon() {
  return (
    <Box sx={{ bgcolor: "#f8f9fa", borderRadius: 2, width: "100%", height: "100%", 
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.05)" }}>
      <Box sx={{ width: { xs: 22, md: 30 }, height: { xs: 22, md: 30 }, borderRadius: "50%", bgcolor: "#EB001B", mr: -1.2 }} />
      <Box sx={{ width: { xs: 22, md: 30 }, height: { xs: 22, md: 30 }, borderRadius: "50%", bgcolor: "#F79E1B", opacity: 0.9 }} />
    </Box>
  );
}

function PixIcon() {
  return (
    <Box sx={{ bgcolor: "#f8f9fa", borderRadius: 2, width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5,
      boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.05)" }}>
      <Box sx={{ width: { xs: 12, md: 16 }, height: { xs: 12, md: 16 }, bgcolor: "#32BCAD",
        transform: "rotate(45deg)", borderRadius: "3px", flexShrink: 0 }} />
      <Typography sx={{ color: "#32BCAD", fontWeight: 800, fontSize: { xs: "0.9rem", md: "1.2rem" }, letterSpacing: "-0.5px" }}>pix</Typography>
    </Box>
  );
}

function BoletoIcon() {
  return (
    <Box sx={{ bgcolor: "#f8f9fa", borderRadius: 2, width: "100%", height: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.05)" }}>
      <Box sx={{ display: "flex", gap: "3px", mb: 0.5 }}>
        {[3,1,2,1,3,1,2,3].map((w, i) => (
          <Box key={i} sx={{ width: { xs: w * 0.8, md: w * 1.2 }, height: { xs: 14, md: 20 }, bgcolor: "#333", borderRadius: "1px" }} />
        ))}
      </Box>
      <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: "1px" }}>Boleto</Typography>
    </Box>
  );
}

// ─── QR Code fake ─────────────────────────────────────────────────────────────
function QRCode() {
  const cells = Array.from({ length: 12 }, () => Array.from({ length: 12 }, () => Math.random() > 0.4));
  return (
    <Box sx={{ bgcolor: "#fff", p: 1.5, borderRadius: 2, display: "inline-flex", flexDirection: "column", gap: "3px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
      {cells.map((row, i) => (
        <Box key={i} sx={{ display: "flex", gap: "3px" }}>
          {row.map((filled, j) => (
            <Box key={j} sx={{ width: 10, height: 10, bgcolor: filled ? "#1a3d0a" : "transparent", borderRadius: "2px" }} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

// ─── Campo de formulário Premium ──────────────────────────────────────────────
function FormField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#4a6b3b", mb: 0.5, ml: 0.5 }}>
        {label}
      </Typography>
      <TextField fullWidth variant="outlined" size="small" type={type} placeholder={placeholder} value={value} onChange={onChange}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#fff", borderRadius: "10px", transition: "all 0.2s",
            "& fieldset": { borderColor: "#dbe8d1", borderWidth: "2px" },
            "&:hover fieldset": { borderColor: "#a8c98f" },
            "&.Mui-focused": { boxShadow: "0 4px 12px rgba(42, 92, 20, 0.1)" },
            "&.Mui-focused fieldset": { borderColor: "#2a5c14" },
          },
          input: { color: "#1a3d0a", fontWeight: 500, fontSize: "0.95rem", py: 1.2 },
        }}
      />
    </Box>
  );
}

// ─── Campos dinâmicos por método ──────────────────────────────────────────────
function CamposPagamento({ metodo, form, setField, onCopiar }) {
  if (!metodo) return (
    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: 0.5 }}>
      <Typography sx={{ color: "#1a3d0a", fontWeight: 600, textAlign: "center" }}>Selecione um método de pagamento</Typography>
      <Typography sx={{ color: "#1a3d0a", fontSize: "0.85rem", textAlign: "center" }}>As opções aparecerão aqui</Typography>
    </Box>
  );

  return (
    <Fade in={true} timeout={500}>
      <Box>
        <Typography variant="h6" sx={{ color: "#1a3d0a", fontWeight: 800, mb: 3 }}>
          {metodo === "visa" || metodo === "mastercard" ? "Dados do Cartão" : metodo === "pix" ? "Pagamento via Pix" : "Pagamento via Boleto"}
        </Typography>

        {/* CARTÃO */}
        {(metodo === "visa" || metodo === "mastercard") && (
          <Box sx={{ ...fadeUp }}>
            <FormField label="Nome impresso no cartão" value={form.portador} onChange={setField("portador")} placeholder="Ex: JOÃO DA SILVA" />
            <FormField label="Número do Cartão" value={form.cartao} onChange={setField("cartao")} placeholder="0000 0000 0000 0000" />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormField label="Validade" value={form.validade} onChange={setField("validade")} placeholder="MM/AA" />
              <FormField label="CVV" value={form.cvv} onChange={setField("cvv")} placeholder="123" />
            </Box>
            <FormField label="CPF do Titular" value={form.cpf} onChange={setField("cpf")} placeholder="000.000.000-00" />
          </Box>
        )}

        {/* PIX */}
        {metodo === "pix" && (
          <Box sx={{ ...fadeUp, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <QRCode />
            <Typography sx={{ color: "#4a6b3b", fontSize: "0.9rem", mt: 3, mb: 1, fontWeight: 600 }}>Ou use o Pix Copia e Cola:</Typography>
            <Box sx={{ display: "flex", gap: 1, width: "100%", bgcolor: "#f4f9f1", p: 1, borderRadius: "12px", border: "1px dashed #a8c98f" }}>
              <Typography sx={{ flex: 1, color: "#1a3d0a", fontSize: "0.85rem", wordBreak: "break-all", display: "flex", alignItems: "center", px: 1 }}>
                00020126580014br.gov.bcb.pix0136monsai@pagamentos.pix...
              </Typography>
              <Button variant="contained" size="small" onClick={() => onCopiar("monsai@pagamentos.pix", "Chave Pix")} sx={{ borderRadius: "8px", px: 3 }}>
                Copiar
              </Button>
            </Box>
          </Box>
        )}

        {/* BOLETO */}
        {metodo === "boleto" && (
          <Box sx={{ ...fadeUp }}>
             <Box sx={{ bgcolor: "#fff3cd", p: 2, borderRadius: "12px", mb: 3, border: "1px solid #ffe69c" }}>
                <Typography sx={{ color: "#664d03", fontSize: "0.85rem", fontWeight: 600 }}>⚠️ Atenção</Typography>
                <Typography sx={{ color: "#664d03", fontSize: "0.8rem" }}>A liberação do sistema ocorre em até 2 dias úteis após o pagamento.</Typography>
             </Box>
             <FormField label="CPF para emissão" value={form.cpf} onChange={setField("cpf")} placeholder="000.000.000-00" />
             <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#4a6b3b", mt: 2, mb: 0.5, ml: 0.5 }}>Código de Barras</Typography>
             <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                <TextField fullWidth size="small" value="34191.75008 00007.285008 66002.940004 1 9876" InputProps={{ readOnly: true }}
                  sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f4f9f1", borderRadius: "10px", "& fieldset": { borderColor: "#dbe8d1" } }, input: { fontSize: "0.85rem", color: "#4a6b3b" } }} />
                <Button variant="contained" onClick={() => onCopiar("34191.75008 00007.285008", "Boleto")} sx={{ borderRadius: "10px" }}>Copiar</Button>
             </Box>
          </Box>
        )}

        {/* ENDEREÇO (Aparece para Cartão e Boleto) */}
        {metodo !== "pix" && (
          <Box sx={{ ...fadeUp, mt: 3 }}>
            <Divider sx={{ mb: 3, borderColor: "#dbe8d1" }} />
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Endereço de Cobrança</Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 0.4 }}><FormField label="CEP" value={form.cep} onChange={setField("cep")} placeholder="00000-000" /></Box>
              <Box sx={{ flex: 1 }}><FormField label="Endereço Completo" value={form.endereco} onChange={setField("endereco")} placeholder="Rua, Número, Bairro" /></Box>
            </Box>
          </Box>
        )}
      </Box>
    </Fade>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function Pagamento({ onVoltar, onHome, qty = 1 }) {
  const [metodoPag, setMetodoPag] = useState(null);
  const showToast = useToast();

  const [form, setForm] = useState({ cpf: "", portador: "", cartao: "", validade: "", cvv: "", cep: "", endereco: "" });

  const preco = 499.99;
  const frete = form.cep.length >= 9 ? 51.00 : null;
  const total = frete ? (preco * qty + frete).toFixed(2) : null;

  const setField = (field) => (e) => {
    let value = e.target.value;
    if (field === "cpf")      value = mascararCPF(value);
    if (field === "cartao")   value = mascararCartao(value);
    if (field === "validade") value = mascararValidade(value);
    if (field === "cvv")      value = mascararCVV(value);
    if (field === "cep")      value = mascararCEP(value);
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleCopiar = (texto, label) => {
    navigator.clipboard.writeText(texto);
    showToast({ type: "success", title: "Copiado!", message: `${label} copiado para a área de transferência.` });
  };

  const handleConcluir = () => {
    if (!metodoPag) return showToast({ type: "error", title: "Quase lá!", message: "Selecione uma forma de pagamento." });
    if (metodoPag !== "pix" && (!form.cep || !form.endereco)) return showToast({ type: "error", title: "Endereço ausente", message: "Precisamos do seu CEP e endereço." });
    
    showToast({ type: "success", title: "Compra Aprovada! 🎉", message: "Bem-vindo ao ecossistema MONSAI." });
  };

  const metodos = [
    { id: "pix",        icon: <PixIcon /> },
    { id: "visa",       icon: <VisaIcon /> },
    { id: "mastercard", icon: <MastercardIcon /> },
    { id: "boleto",     icon: <BoletoIcon /> },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column", 
        backgroundImage: "radial-gradient(circle at 50% 0%, #dbe8d1 0%, transparent 70%)" }}>

        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 2, md: 4 } }}>
          
          {/* Card Principal de Checkout */}
          <Paper elevation={24} sx={{
            display: "flex", flexDirection: { xs: "column", md: "row" },
            width: "100%", maxWidth: 1000, borderRadius: 4, overflow: "hidden",
            boxShadow: "0 24px 48px -12px rgba(26, 61, 10, 0.15)",
            ...fadeUp
          }}>

            {/* ── COLUNA ESQUERDA (Resumo) ── */}
            <Box sx={{
              bgcolor: "#2a5c14", color: "#fff",
              p: { xs: 3, md: 5 }, display: "flex", flexDirection: "column", gap: 3,
              width: { xs: "100%", md: 340 }, position: "relative", overflow: "hidden"
            }}>
              {/* Elementos decorativos de fundo */}
              <Box sx={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
              <Box sx={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />

              <Typography variant="h5" sx={{ color: "#fff", zIndex: 1 }}>Finalizar Pedido</Typography>

              {/* Box do Produto */}
              <Box sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: 3, p: 2.5, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", zIndex: 1 }}>
                <Typography sx={{ fontSize: "0.9rem", color: "#dbe8d1", mb: 0.5 }}>Plano de Assinatura</Typography>
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, mb: 2 }}>Kit MONSAI Idoso</Typography>
                
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.85rem", opacity: 0.8 }}>Equipamento x{qty}</Typography>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{(preco * qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.85rem", opacity: 0.8 }}>Frete</Typography>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{frete ? frete.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Calcular"}</Typography>
                </Box>
              </Box>

              {/* Totalizador */}
              <Box sx={{ mt: "auto", zIndex: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#dbe8d1", mb: 0.5 }}>Total a pagar</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: "2rem", lineHeight: 1 }}>
                  {total ? parseFloat(total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "---"}
                </Typography>
              </Box>
            </Box>

            {/* ── COLUNA DIREITA (Formulário) ── */}
            <Box sx={{ bgcolor: "#fff", p: { xs: 3, md: 5 }, flex: 1, display: "flex", flexDirection: "column" }}>
              
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a3d0a", mb: 2 }}>
                Como você prefere pagar?
              </Typography>

              {/* Grid de Métodos de Pagamento */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 1.5, mb: 4 }}>
                {metodos.map((m) => (
                  <Box
                    key={m.id}
                    onClick={() => setMetodoPag(m.id)}
                    sx={{
                      cursor: "pointer", borderRadius: 3, height: { xs: 50, md: 64 },
                      border: metodoPag === m.id ? SELECTED_BORDER : UNSELECTED_BORDER,
                      bgcolor: metodoPag === m.id ? "#f4f9f1" : "transparent",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: metodoPag === m.id ? "scale(1.02)" : "scale(1)",
                      opacity: metodoPag && metodoPag !== m.id ? 0.6 : 1,
                      p: "2px", // Espaço para a borda não espremer o conteúdo
                      "&:hover": { opacity: 1, transform: "scale(1.02)" },
                    }}
                  >
                    {m.icon}
                  </Box>
                ))}
              </Box>

              <Divider sx={{ mb: 4, borderColor: "#f0f0f0" }} />

              {/* Formulário Renderizado */}
              <Box sx={{ flex: 1, minHeight: 300 }}>
                <CamposPagamento metodo={metodoPag} form={form} setField={setField} onCopiar={handleCopiar} />
              </Box>

              {/* Botão de Concluir */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, pt: 2, borderTop: "1px solid #f0f0f0" }}>
                <Button variant="contained" onClick={handleConcluir} disabled={!metodoPag}
                  sx={{ 
                    px: 6, py: 1.5, fontSize: "1.1rem", 
                    opacity: !metodoPag ? 0.5 : 1,
                    background: "linear-gradient(135deg, #2a5c14 0%, #1a3d0a 100%)",
                  }}>
                  Pagar Agora
                </Button>
              </Box>
            </Box>

          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}