import { createContext, useContext, useState, useCallback, useRef } from "react";
import { Box, Typography } from "@mui/material";

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── Icons ────────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="26" fill="#00502D" />
      <path d="M13 27L22 36L39 17" stroke="white" strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="26" fill="#991818" />
      <path d="M16 16L36 36M36 16L16 36" stroke="white" strokeWidth="4"
        strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="26" fill="#1a3d0a" />
      <rect x="23" y="22" width="6" height="16" rx="3" fill="white" />
      <circle cx="26" cy="15" r="3.5" fill="white" />
    </svg>
  );
}

// ─── Toast Item ───────────────────────────────────────────────────────────────
const STYLES = {
  success: { bg: "#84B18E", border: "#00502D" },
  error:   { bg: "#BA1A1A", border: "#991818" },
  info:    { bg: "#2a5c14", border: "#1a3d0a" },
};

function ToastItem({ toast, onRemove }) {
  const style = STYLES[toast.type] || STYLES.info;

  return (
    <Box
      onClick={() => onRemove(toast.id)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: "12px",
        px: 2.5,
        py: 2,
        minWidth: 340,
        maxWidth: 420,
        cursor: "pointer",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        animation: "toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "@keyframes toastIn": {
          from: { opacity: 0, transform: "translateX(120px) scale(0.9)" },
          to:   { opacity: 1, transform: "translateX(0)    scale(1)"   },
        },
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        {toast.type === "success" && <CheckIcon />}
        {toast.type === "error"   && <ErrorIcon />}
        {toast.type === "info"    && <InfoIcon />}
      </Box>

      <Box>
        <Typography sx={{
          color: "#fff",
          fontWeight: 800,
          fontSize: "1.05rem",
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.3,
        }}>
          {toast.title}
        </Typography>
        {toast.message && (
          <Typography sx={{
            color: "rgba(255,255,255,0.9)",
            fontWeight: 500,
            fontSize: "0.88rem",
            fontFamily: "'Inter', sans-serif",
            mt: 0.4,
            lineHeight: 1.4,
          }}>
            {toast.message}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timerRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timerRef.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type = "info", title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    timerRef.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Container fixo no canto inferior direito */}
      <Box sx={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        alignItems: "flex-end",
        pointerEvents: "none",
        "& > *": { pointerEvents: "auto" },
      }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </Box>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return ctx.showToast;
}