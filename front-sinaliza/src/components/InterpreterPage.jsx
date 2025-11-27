import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Grid,
    AppBar,
    Toolbar,
    IconButton,
    TextField,
    Alert,
    Snackbar,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Language as LanguageIcon,
    Link as LinkIcon,
    VideoCall as VideoIcon,
    Person as PersonIcon,
    CheckCircle as SuccessIcon,
} from '@mui/icons-material';

const InterpreterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [requestingPage, setRequestingPage] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [assignedUrl, setAssignedUrl] = useState('');
    const [formData, setFormData] = useState({
        interpreterId: '',
        videoLink: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleBack = () => {
        navigate('/');
    };

    // Função para solicitar uma página para tradução
    const handleRequestPage = async () => {
        setRequestingPage(true);

        try {
            // SIMULAÇÃO COM TIMEOUT - SUBSTITUIR POR API REAL
            // ===============================================
            // CÓDIGO REAL PARA IMPLEMENTAR:
            // const response = await fetch('https://sua-api.com/api/assign-page', {
            //   method: 'GET',
            //   headers: {
            //     'Authorization': 'Bearer seu-token-aqui',
            //     'Content-Type': 'application/json'
            //   }
            // });
            // 
            // if (!response.ok) throw new Error('Erro ao buscar página');
            // const data = await response.json();
            // setAssignedUrl(data.url);
            // ===============================================

            // Simulação com timeout
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulação de resposta da API
            const mockResponse = {
                url: 'https://exemplo.com/pagina-para-traducao-' + Math.floor(Math.random() * 1000),
                id: 'page_' + Math.random().toString(36).substr(2, 9),
                title: 'Página de Exemplo para Tradução',
                assignedAt: new Date().toISOString()
            };

            setAssignedUrl(mockResponse.url);
            setSnackbar({
                open: true,
                message: 'Página atribuída com sucesso!',
                severity: 'success',
            });

        } catch (error) {
            console.error('Erro ao solicitar página:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao solicitar página. Tente novamente.',
                severity: 'error',
            });
        } finally {
            setRequestingPage(false);
        }
    };

    // Função para enviar os dados de tradução
    const handleSubmitTranslation = async (e) => {
        e.preventDefault();

        if (!formData.interpreterId || !formData.videoLink) {
            setSnackbar({
                open: true,
                message: 'Por favor, preencha todos os campos',
                severity: 'error',
            });
            return;
        }

        if (!assignedUrl) {
            setSnackbar({
                open: true,
                message: 'Primeiro solicite uma página para tradução',
                severity: 'warning',
            });
            return;
        }

        setSubmitting(true);

        try {
            // SIMULAÇÃO COM TIMEOUT - SUBSTITUIR POR API REAL
            // ===============================================
            // CÓDIGO REAL PARA IMPLEMENTAR:
            // const response = await fetch('https://sua-api.com/api/submit-translation', {
            //   method: 'POST',
            //   headers: {
            //     'Authorization': 'Bearer seu-token-aqui',
            //     'Content-Type': 'application/json'
            //   },
            //   body: JSON.stringify({
            //     interpreterId: formData.interpreterId,
            //     videoLink: formData.videoLink,
            //     assignedUrl: assignedUrl,
            //     submittedAt: new Date().toISOString()
            //   })
            // });
            // 
            // if (!response.ok) throw new Error('Erro ao enviar tradução');
            // const data = await response.json();
            // ===============================================

            // Simulação com timeout
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulação de resposta bem-sucedida
            const mockResponse = {
                success: true,
                translationId: 'trans_' + Math.random().toString(36).substr(2, 9),
                message: 'Tradução registrada com sucesso'
            };

            setSnackbar({
                open: true,
                message: 'Tradução enviada com sucesso! Sua contribuição foi registrada.',
                severity: 'success',
            });

            // Resetar formulário após sucesso
            setFormData({
                interpreterId: '',
                videoLink: ''
            });
            setAssignedUrl('');

        } catch (error) {
            console.error('Erro ao enviar tradução:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao enviar tradução. Tente novamente.',
                severity: 'error',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="static" color="secondary">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleBack}
                        sx={{ mr: 2 }}
                    >
                        <BackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Plataforma do Intérprete
                    </Typography>
                    <Button color="inherit" onClick={handleBack}>
                        Sair
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                    {/* Coluna principal - Fluxo de trabalho */}
                    <Grid item xs={12} lg={8}>
                        {/* Passo 1: Solicitar página */}
                        <Card sx={{ mb: 4 }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" mb={3}>
                                    <LanguageIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                                    <Typography variant="h5" component="h2" fontWeight="600">
                                        1. Solicitar Página para Tradução
                                    </Typography>
                                </Box>

                                <Typography variant="body1" color="text.secondary" mb={3}>
                                    Clique no botão abaixo para receber uma página que precisa ser traduzida.
                                </Typography>

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleRequestPage}
                                    disabled={requestingPage || !!assignedUrl}
                                    startIcon={requestingPage ? <CircularProgress size={20} /> : <LinkIcon />}
                                    sx={{
                                        py: 1.5,
                                        px: 4,
                                        minWidth: 250,
                                    }}
                                >
                                    {requestingPage ? 'Solicitando...' : 'Solicitar Página'}
                                </Button>

                                {/* Exibir URL atribuída */}
                                {assignedUrl && (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            mt: 3,
                                            bgcolor: 'success.light',
                                            borderColor: 'success.main'
                                        }}
                                    >
                                        <Box display="flex" alignItems="flex-start">
                                            <SuccessIcon color="success" sx={{ mr: 2, mt: 0.5 }} />
                                            <Box>
                                                <Typography variant="subtitle1" gutterBottom fontWeight="600" color="success.dark">
                                                    Página Atribuída com Sucesso!
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 2 }} color="success.dark">
                                                    Utilize o link abaixo para acessar o conteúdo a ser traduzido:
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        bgcolor: 'background.paper',
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            wordBreak: 'break-all',
                                                            fontFamily: 'monospace',
                                                            color: 'primary.main'
                                                        }}
                                                    >
                                                        {assignedUrl}
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => window.open(assignedUrl, '_blank')}
                                                    sx={{ mt: 1 }}
                                                >
                                                    Abrir Link
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Paper>
                                )}
                            </CardContent>
                        </Card>

                        {/* Passo 2: Formulário de tradução */}
                        {assignedUrl && (
                            <Card>
                                <CardContent sx={{ p: 4 }}>
                                    <Box display="flex" alignItems="center" mb={3}>
                                        <VideoIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                                        <Typography variant="h5" component="h2" fontWeight="600">
                                            2. Registrar Tradução
                                        </Typography>
                                    </Box>

                                    <Typography variant="body1" color="text.secondary" mb={3}>
                                        Preencha os dados abaixo para registrar sua tradução.
                                    </Typography>

                                    <Box component="form" onSubmit={handleSubmitTranslation}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="ID do Intérprete"
                                                    name="interpreterId"
                                                    variant="outlined"
                                                    value={formData.interpreterId}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: INT12345"
                                                    disabled={submitting}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <Box sx={{ color: 'text.secondary', mr: 1 }}>
                                                                <PersonIcon fontSize="small" />
                                                            </Box>
                                                        ),
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Link do Vídeo com a Tradução"
                                                    name="videoLink"
                                                    variant="outlined"
                                                    value={formData.videoLink}
                                                    onChange={handleInputChange}
                                                    placeholder="https://youtube.com/..."
                                                    disabled={submitting}
                                                    required
                                                    InputProps={{
                                                        startAdornment: (
                                                            <Box sx={{ color: 'text.secondary', mr: 1 }}>
                                                                <VideoIcon fontSize="small" />
                                                            </Box>
                                                        ),
                                                    }}
                                                    helperText="Cole o link do vídeo onde está disponível a tradução"
                                                />
                                            </Grid>
                                        </Grid>

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={submitting}
                                            startIcon={submitting ? <CircularProgress size={20} /> : <SuccessIcon />}
                                            sx={{
                                                mt: 3,
                                                py: 1.5,
                                                px: 4,
                                                minWidth: 200,
                                            }}
                                        >
                                            {submitting ? 'Enviando...' : 'Registrar Tradução'}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </Grid>

                </Grid>
            </Container>

            {/* Snackbar para feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default InterpreterPage;