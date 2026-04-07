import { useState } from "react";
import logo from "assets/logos/Logo_nome.png";
import { useToast } from "../components/ToastContext";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar, Toolbar, Box, Button, Typography,
  TextField, IconButton, Drawer, List, ListItem,
  ListItemButton, ListItemText, useMediaQuery, Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const theme = createTheme({
  palette: {
    primary:   { main: "#2a5c14", dark: "#1a3d0a", light: "#7ec44f" },
    secondary: { main: "#4fa825" },
  },
  typography: {
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    button: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 28, boxShadow: "none" } } },
  },
});

const navLinks      = ["Voltar ao Home", "Sou Cliente", "Sobre nós", "Contato"];
const SELECTED_BORDER = "3px solid #1a3d0a";

// ─── Ícones ──────────────────────────────────────────────────────────────────
function VisaIcon() {
  return (
    <Box sx={{ bgcolor: "#1a1f71", borderRadius: 1, width: "100%", height: 52,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Typography sx={{ color: "#fff", fontWeight: 900, fontStyle: "italic", fontSize: "1.4rem", letterSpacing: -1 }}>
        VISA
      </Typography>
    </Box>
  );
}
function MastercardIcon() {
  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: 1, width: "100%", height: 52, border: "1px solid #ddd",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#EB001B", mr: -1.2 }} />
      <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#F79E1B", opacity: 0.9 }} />
    </Box>
  );
}
function PixIcon() {
  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: 1, width: "100%", height: 52, border: "1px solid #ddd",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
      <Box sx={{ width: 14, height: 14, bgcolor: "#32BCAD", transform: "rotate(45deg)", borderRadius: "2px" }} />
      <Typography sx={{ color: "#32BCAD", fontWeight: 700, fontSize: "1.1rem" }}>pix</Typography>
    </Box>
  );
}
function BoletoIcon() {
  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: 1, width: "100%", height: 52, border: "1px solid #ddd",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ display: "flex", gap: "2px", mb: 0.3 }}>
        {[3,1,2,1,3,1,2,3,1,2,1,3].map((w, i) => (
          <Box key={i} sx={{ width: w, height: 18, bgcolor: "#222" }} />
        ))}
      </Box>
      <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#222" }}>Boleto</Typography>
    </Box>
  );
}

// ─── QR Code fake ─────────────────────────────────────────────────────────────
function QRCode() {
  const cells = Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => Math.random() > 0.5)
  );
  return (
    <Box sx={{ bgcolor: "#fff", p: 1, borderRadius: 1, display: "inline-flex", flexDirection: "column", gap: "2px" }}>
      {cells.map((row, i) => (
        <Box key={i} sx={{ display: "flex", gap: "2px" }}>
          {row.map((filled, j) => (
            <Box key={j} sx={{ width: 12, height: 12, bgcolor: filled ? "#000" : "#fff" }} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

// ─── Campo de formulário ──────────────────────────────────────────────────────
function FormField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <TextField fullWidth variant="outlined" size="small" type={type}
      placeholder={placeholder || label} value={value} onChange={onChange}
      sx={{
        bgcolor: "#fff", borderRadius: "8px",
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          "& fieldset": { borderColor: "#bbb" },
          "&:hover fieldset": { borderColor: "#2a5c14" },
          "&.Mui-focused fieldset": { borderColor: "#2a5c14" },
        },
        input: { color: "#1e3d1a", fontWeight: 500, fontSize: "0.95rem" },
      }}
    />
  );
}

// ─── Campos dinâmicos por método ──────────────────────────────────────────────
function CamposPagamento({ metodo, form, setField, onCopiar }) {
  if (!metodo) return (
    <Typography sx={{ color: "#1a3d0a", fontStyle: "italic", opacity: 0.7, textAlign: "center", mt: 4 }}>
      Selecione um método de pagamento ao lado.
    </Typography>
  );

  if (metodo === "visa" || metodo === "mastercard") return (
    <>
      <Typography variant="subtitle1" sx={{ color: "#1a3d0a", fontWeight: 700 }}>
        {metodo === "visa" ? "Cartão Visa" : "Cartão Mastercard"}
      </Typography>
      <FormField label="CPF"              value={form.cpf}      onChange={setField("cpf")}      placeholder="000.000.000-00" />
      <FormField label="Nome do portador" value={form.portador} onChange={setField("portador")} />
      <FormField label="Número do Cartão" value={form.cartao}   onChange={setField("cartao")}   placeholder="0000 0000 0000 0000" />
      <FormField label="Data de validade" value={form.validade} onChange={setField("validade")} placeholder="MM/AA" />
      <FormField label="CVV"              value={form.cvv}      onChange={setField("cvv")}      placeholder="123" />
      <Divider />
      <FormField label="CEP"      value={form.cep}      onChange={setField("cep")}      placeholder="00000-000" />
      <FormField label="Endereço" value={form.endereco} onChange={setField("endereco")} />
    </>
  );

  if (metodo === "pix") return (
    <>
      <Typography variant="subtitle1" sx={{ color: "#1a3d0a", fontWeight: 700 }}>
        Pagamento via Pix
      </Typography>
      <Typography variant="body2" sx={{ color: "#1a3d0a" }}>
        Escaneie o QR Code com o app do seu banco:
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
        <QRCode />
      </Box>
      <Typography variant="body2" sx={{ color: "#1a3d0a", textAlign: "center" }}>
        ou copie a chave Pix:
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField fullWidth size="small" value="monsai@pagamentos.pix" variant="outlined"
          InputProps={{ readOnly: true }}
          sx={{ bgcolor: "#fff", borderRadius: "8px",
            "& .MuiOutlinedInput-root": { borderRadius: "8px", "& fieldset": { borderColor: "#bbb" } },
            input: { color: "#1e3d1a", fontSize: "0.88rem" },
          }}
        />
        <Button variant="contained" color="primary" size="small"
          onClick={() => onCopiar("monsai@pagamentos.pix", "Chave Pix")}
          sx={{ px: 2, borderRadius: "8px", whiteSpace: "nowrap" }}>
          Copiar
        </Button>
      </Box>
      <Divider />
      <FormField label="CEP"      value={form.cep}      onChange={setField("cep")}      placeholder="00000-000" />
      <FormField label="Endereço" value={form.endereco} onChange={setField("endereco")} />
    </>
  );

  if (metodo === "boleto") return (
    <>
      <Typography variant="subtitle1" sx={{ color: "#1a3d0a", fontWeight: 700 }}>
        Pagamento via Boleto
      </Typography>
      <Typography variant="body2" sx={{ color: "#1a3d0a" }}>
        Copie o código do boleto abaixo:
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField fullWidth size="small" variant="outlined"
          value="34191.75008 00007.285008 66002.940004 1 98760000049999"
          InputProps={{ readOnly: true }}
          sx={{ bgcolor: "#fff", borderRadius: "8px",
            "& .MuiOutlinedInput-root": { borderRadius: "8px", "& fieldset": { borderColor: "#bbb" } },
            input: { color: "#1e3d1a", fontSize: "0.72rem" },
          }}
        />
        <Button variant="contained" color="primary" size="small"
          onClick={() => onCopiar("34191.75008 00007.285008 66002.940004 1 98760000049999", "Código do boleto")}
          sx={{ px: 2, borderRadius: "8px", whiteSpace: "nowrap" }}>
          Copiar
        </Button>
      </Box>
      <Typography variant="body2" sx={{ color: "#1a3d0a", fontSize: "0.8rem", fontStyle: "italic" }}>
        ⚠️ Boleto vence em 3 dias úteis. Confirmação pode levar até 2 dias.
      </Typography>
      <Divider />
      <FormField label="CPF"      value={form.cpf}      onChange={setField("cpf")}      placeholder="000.000.000-00" />
      <FormField label="CEP"      value={form.cep}      onChange={setField("cep")}      placeholder="00000-000" />
      <FormField label="Endereço" value={form.endereco} onChange={setField("endereco")} />
    </>
  );

  return null;
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function Pagamento({ onVoltar, onHome, qty = 1 }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [metodoPag, setMetodoPag]   = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const showToast = useToast();

  const [form, setForm] = useState({
    cpf: "", portador: "", cartao: "", validade: "", cvv: "", cep: "", endereco: "",
  });

  const preco = 499.99;
  const frete = form.cep.length >= 8 ? 51.00 : null;
  const total = frete ? (preco * qty + frete).toFixed(2) : null;

  const handleNav = (link) => {
    setDrawerOpen(false);
    if (link === "Voltar ao Home") onHome?.();
    if (link === "Sou Cliente")   onVoltar?.();
  };

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCopiar = (texto, label) => {
    navigator.clipboard.writeText(texto);
    showToast({
      type: "success",
      title: "Copiado!",
      message: `${label} copiado para a área de transferência.`,
    });
  };

  const handleConcluir = () => {
    if (!metodoPag) {
      showToast({
        type: "error",
        title: "Método não selecionado",
        message: "Selecione uma forma de pagamento para continuar.",
      });
      return;
    }
    if (!form.cep || !form.endereco) {
      showToast({
        type: "error",
        title: "Endereço incompleto",
        message: "Preencha o CEP e o endereço de entrega.",
      });
      return;
    }
    showToast({
      type: "success",
      title: "Compra realizada!",
      message: "Seu pedido foi confirmado com sucesso. 🎉",
    });
  };

  const metodos = [
    { id: "visa",       icon: <VisaIcon /> },
    { id: "mastercard", icon: <MastercardIcon /> },
    { id: "pix",        icon: <PixIcon /> },
    { id: "boleto",     icon: <BoletoIcon /> },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff", display: "flex", flexDirection: "column" }}>

        {/* ── NAVBAR ── */}
        <AppBar position="sticky" sx={{ bgcolor: "#AED696", boxShadow: "none" }}>
          <Toolbar sx={{ px: { xs: 2, md: 5 }, justifyContent: "space-between" }}>
            <Box component="img" src={logo} alt="MONSAI" sx={{ height: 40, objectFit: "contain" }} />
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {navLinks.map((link) => (
                  <Button key={link} onClick={() => handleNav(link)}
                    sx={{ color: "#1a3d0a", fontWeight: 600, fontSize: "0.85rem",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.08)" } }}>
                    {link}
                  </Button>
                ))}
              </Box>
            )}
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#1a3d0a" }}>
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>

        {/* Mobile drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 220, pt: 2 }}>
            <List>
              {navLinks.map((link) => (
                <ListItem key={link} disablePadding>
                  <ListItemButton onClick={() => handleNav(link)}>
                    <ListItemText primary={link} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* ── CONTEÚDO ── */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center",
          justifyContent: "center", p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" },
            gap: 3, width: "100%", maxWidth: 900, alignItems: "stretch" }}>

            {/* ── COLUNA ESQUERDA — verde claro ── */}
            <Box sx={{
              bgcolor: "#AED696",
              borderRadius: 3, p: 3,
              display: "flex", flexDirection: "column", gap: 2.5,
              flex: "0 0 auto", width: { xs: "100%", md: 260 },
            }}>
              {/* Resumo do produto */}
              <Box sx={{ bgcolor: "rgba(255,255,255,0.45)", borderRadius: 2, p: 2, display: "flex", gap: 2 }}>
                <Box sx={{ width: 60, height: 60, border: "2px dashed #888", borderRadius: 1,
                  bgcolor: "#ccc", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ fontSize: "0.55rem", color: "#555", textAlign: "center" }}>
                    foto do produto
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.82rem", color: "#1a3d0a", fontWeight: 600 }}>
                    Unidade: {qty}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: "#1a3d0a", fontWeight: 600 }}>
                    Preço: {(preco * qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#1a3d0a" }}>
                    Frete: {frete
                      ? frete.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : "?R$"}{" "}
                    <Typography component="span" sx={{ fontSize: "0.62rem", color: "#2d5a20" }}>
                      (insira o CEP)
                    </Typography>
                  </Typography>
                </Box>
              </Box>

              {/* Total */}
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a3d0a" }}>
                TOTAL: {total
                  ? parseFloat(total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : `${(preco * qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} + frete`}
              </Typography>

              <Divider sx={{ borderColor: "rgba(0,0,0,0.15)" }} />

              {/* Métodos de pagamento */}
              <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#1a3d0a" }}>
                Forma de pagamento:
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                {metodos.map((m) => (
                  <Box key={m.id} onClick={() => setMetodoPag(m.id)}
                    sx={{
                      cursor: "pointer", borderRadius: 1.5,
                      border: metodoPag === m.id ? SELECTED_BORDER : "3px solid transparent",
                      transition: "border 0.2s, transform 0.15s",
                      transform: metodoPag === m.id ? "scale(1.04)" : "scale(1)",
                      "&:hover": { opacity: 0.85 },
                    }}>
                    {m.icon}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ── COLUNA DIREITA — verde escuro ── */}
            <Box sx={{
              bgcolor: "#7ec44f",
              borderRadius: 3, p: 3,
              flex: 1,
              display: "flex", flexDirection: "column", gap: 1.8,
            }}>
              <CamposPagamento metodo={metodoPag} form={form} setField={setField} onCopiar={handleCopiar} />

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "auto", pt: 1 }}>
                <Button variant="contained" onClick={handleConcluir}
                  sx={{ px: 5, py: 1.2, fontSize: "1rem", borderRadius: "10px",
                    bgcolor: "#2a5c14", "&:hover": { bgcolor: "#1a3d0a" } }}>
                  Concluir
                </Button>
              </Box>
            </Box>

          </Box>
        </Box>

      </Box>
    </ThemeProvider>
  );
}