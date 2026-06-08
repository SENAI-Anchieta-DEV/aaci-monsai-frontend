import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Grid,
  CircularProgress, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip,
  useMediaQuery, useTheme, Card, CardContent, Stack,
} from '@mui/material';
import EditIcon        from '@mui/icons-material/Edit';
import BlockIcon       from '@mui/icons-material/Block';
import SaveIcon        from '@mui/icons-material/Save';
import CancelIcon      from '@mui/icons-material/Cancel';
import BusinessIcon    from '@mui/icons-material/Business';
import api             from '../utils/api';
import { useToast }    from '../components/ToastContext';
import { mascararCNPJ } from '../utils/masks';

// ─── Card mobile ──────────────────────────────────────────────────────────────
const AsiloCard = ({ asilo, onEditar, onInativar }) => (
  <Card variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
    <CardContent sx={{ pb: '12px !important' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography fontWeight="bold" color="#1a3d0a">{asilo.nome}</Typography>
          <Typography variant="body2" color="text.secondary">{asilo.cnpj}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {asilo.endereco}
          </Typography>
          <Chip
            label={asilo.ativo ? "Ativo" : "Inativo"}
            size="small"
            color={asilo.ativo ? "success" : "default"}
            sx={{ mt: 1, fontWeight: 'bold', fontSize: '0.72rem' }}
          />
        </Box>
        <Stack direction="row">
          <Tooltip title="Editar">
            <IconButton onClick={() => onEditar(asilo)} sx={{ color: '#2d5a27' }}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          {asilo.ativo && (
            <Tooltip title="Inativar">
              <IconButton onClick={() => onInativar(asilo)} sx={{ color: '#d32f2f' }}>
                <BlockIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export default function GerenciarAsilos() {
  const [asilos, setAsilos]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [erro, setErro]                 = useState(null);
  const [editando, setEditando]         = useState(null);   // asilo sendo editado
  const [errosCampos, setErrosCampos]   = useState({});
  const [salvando, setSalvando]         = useState(false);
  const [confirmarInativar, setConfirmarInativar] = useState(null); // asilo alvo

  const showToast = useToast();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('sm'));

  // ─── Busca ─────────────────────────────────────────────────────────────────
  // GET /asilos — SUPER_ADMIN only (AsiloController)
  const carregarAsilos = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const { data } = await api.get('/asilos');
      setAsilos(data);
    } catch (err) {
      setErro('Erro ao carregar a lista de unidades.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarAsilos(); }, [carregarAsilos]);

  // ─── Edição ────────────────────────────────────────────────────────────────
  const abrirEdicao = (asilo) => {
    setEditando({ ...asilo });
    setErrosCampos({});
  };

  const validar = () => {
    const erros = {};
    if (!editando.nome?.trim()     || editando.nome.trim().length < 3)
      erros.nome = "Nome deve ter pelo menos 3 caracteres.";
    if (!editando.cnpj?.replace(/\D/g, '') || editando.cnpj.replace(/\D/g, '').length !== 14)
      erros.cnpj = "CNPJ deve ter 14 dígitos.";
    setErrosCampos(erros);
    return Object.keys(erros).length === 0;
  };

  // PUT /asilos/{id} — AsiloController
  const handleSalvar = async () => {
    if (!validar()) return;
    setSalvando(true);
    try {
      await api.put(`/asilos/${editando.id}`, {
        nome:     editando.nome,
        cnpj:     editando.cnpj,
        endereco: editando.endereco,
      });
      showToast({ type: "success", title: "Unidade atualizada!", message: `${editando.nome} foi salva com sucesso.` });
      setEditando(null);
      carregarAsilos();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Erro ao salvar.";
      showToast({ type: "error", title: "Erro ao salvar", message: msg });
    } finally {
      setSalvando(false);
    }
  };

  // ─── Inativação ────────────────────────────────────────────────────────────
  // DELETE /asilos/{id} — AsiloController (inativação lógica)
  const handleInativar = async () => {
    if (!confirmarInativar) return;
    try {
      await api.delete(`/asilos/${confirmarInativar.id}`);
      showToast({ type: "success", title: "Unidade inativada", message: `${confirmarInativar.nome} foi bloqueada.` });
      setConfirmarInativar(null);
      carregarAsilos();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Erro ao inativar.";
      showToast({ type: "error", title: "Erro ao inativar", message: msg });
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Box component="section" aria-labelledby="titulo-gerenciar-asilos"
      sx={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <BusinessIcon sx={{ color: '#2d5a27', fontSize: 36 }} />
        <Box>
          <Typography id="titulo-gerenciar-asilos" variant="h4"
            sx={{ color: '#1a3d0a', fontWeight: 'bold', lineHeight: 1.2 }}>
            Gerenciar Unidades
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize, edite e gerencie todas as instituições cadastradas.
          </Typography>
        </Box>
      </Box>

      {/* ── FORMULÁRIO DE EDIÇÃO ── */}
      {editando && (
        <Paper elevation={0}
          sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '2px solid #AED696' }}>
          <Typography variant="h6" sx={{ color: '#2d5a27', fontWeight: 600, mb: 3 }}>
            Editando: {editando.nome}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Nome da Unidade" variant="outlined"
                value={editando.nome || ''}
                error={!!errosCampos.nome} helperText={errosCampos.nome}
                onChange={(e) => setEditando({ ...editando, nome: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="CNPJ" variant="outlined"
                value={editando.cnpj || ''}
                error={!!errosCampos.cnpj} helperText={errosCampos.cnpj || "00.000.000/0000-00"}
                inputProps={{ maxLength: 18 }}
                onChange={(e) => setEditando({ ...editando, cnpj: mascararCNPJ(e.target.value) })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Endereço Completo" variant="outlined"
                value={editando.endereco || ''}
                onChange={(e) => setEditando({ ...editando, endereco: e.target.value })} />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="outlined" color="inherit" startIcon={<CancelIcon />}
              onClick={() => setEditando(null)} disabled={salvando}>
              Cancelar
            </Button>
            <Button variant="contained" startIcon={salvando ? <CircularProgress size={18} /> : <SaveIcon />}
              onClick={handleSalvar} disabled={salvando}
              sx={{ bgcolor: '#2d5a27', '&:hover': { bgcolor: '#1a3d0a' } }}>
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* ── LISTA DE ASILOS ── */}
      <Paper elevation={0}
        sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" sx={{ color: '#2d5a27', fontWeight: 600, mb: 3 }}>
          Unidades Cadastradas
        </Typography>

        {erro   && <Alert severity="error"   sx={{ mb: 2 }}>{erro}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress sx={{ color: '#2d5a27' }} />
          </Box>
        ) : asilos.length === 0 ? (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
            Nenhuma unidade cadastrada.
          </Typography>
        ) : isMobile ? (
          // Mobile: cards
          <Box>
            {asilos.map((asilo) => (
              <AsiloCard key={asilo.id} asilo={asilo}
                onEditar={abrirEdicao}
                onInativar={(a) => setConfirmarInativar(a)} />
            ))}
          </Box>
        ) : (
          // Desktop: tabela
          <TableContainer>
            <Table aria-label="Lista de unidades">
              <TableHead sx={{ bgcolor: '#f4f7f1' }}>
                <TableRow>
                  {['Nome', 'CNPJ', 'Endereço', 'Status', 'Ações'].map((col, i) => (
                    <TableCell key={col} align={i === 4 ? 'center' : 'left'}
                      sx={{ fontWeight: 'bold', color: '#1a3d0a' }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {asilos.map((asilo) => (
                  <TableRow key={asilo.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{asilo.nome}</TableCell>
                    <TableCell>{asilo.cnpj}</TableCell>
                    <TableCell>{asilo.endereco || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={asilo.ativo ? "Ativo" : "Inativo"}
                        size="small"
                        color={asilo.ativo ? "success" : "default"}
                        sx={{ fontWeight: 'bold', fontSize: '0.72rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar dados">
                        <IconButton onClick={() => abrirEdicao(asilo)} sx={{ color: '#2d5a27' }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={asilo.ativo ? "Inativar unidade" : "Já inativa"}>
                        <span>
                          <IconButton
                            onClick={() => setConfirmarInativar(asilo)}
                            disabled={!asilo.ativo}
                            sx={{ color: asilo.ativo ? '#d32f2f' : '#ccc' }}>
                            <BlockIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ── DIALOG DE CONFIRMAÇÃO DE INATIVAÇÃO ── */}
      <Dialog open={!!confirmarInativar} onClose={() => setConfirmarInativar(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
          Inativar Unidade
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja bloquear a unidade{' '}
            <strong>{confirmarInativar?.nome}</strong>?
            <br /><br />
            Todos os acessos vinculados a esta unidade serão impedidos.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setConfirmarInativar(null)} variant="outlined" color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleInativar} variant="contained"
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}>
            Confirmar Inativação
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}