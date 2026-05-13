// ─── Hook de confirmação reutilizável ─────────────────────────────────────────
// Substitui window.confirm() por um Dialog do MUI.
// Uso:
//   const { ConfirmDialog, confirmar } = useConfirm();
//   const ok = await confirmar("Tem certeza?", "Esta ação não pode ser desfeita.");
//   if (ok) { /* executa */ }
//   return <> ... <ConfirmDialog /> </>

import { useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export function useConfirm() {
  const [state, setState] = useState({ open: false, title: '', message: '', resolve: null });

  const confirmar = useCallback((title, message = '') => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, resolve });
    });
  }, []);

  const handleClose = (resultado) => {
    state.resolve(resultado);
    setState((s) => ({ ...s, open: false }));
  };

  const ConfirmDialog = () => (
    <Dialog open={state.open} onClose={() => handleClose(false)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ color: '#1a3d0a', fontWeight: 'bold' }}>{state.title}</DialogTitle>
      {state.message && (
        <DialogContent>
          <DialogContentText>{state.message}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={() => handleClose(false)} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button onClick={() => handleClose(true)} variant="contained"
          sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { confirmar, ConfirmDialog };
}