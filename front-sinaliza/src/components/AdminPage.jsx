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
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    AddLink as LinkIcon,
} from '@mui/icons-material';

const AdminPage = () => {
    const navigate = useNavigate();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleBack = () => {
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!url) {
            setSnackbar({
                open: true,
                message: 'Por favor, insira uma URL válida',
                severity: 'error',
            });
            return;
        }

        // Validar formato da URL
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlPattern.test(url)) {
            setSnackbar({
                open: true,
                message: 'Por favor, insira uma URL válida',
                severity: 'error',
            });
            return;
        }

        setLoading(true);

        try {
            // CHAMADA API
            const response = await fetch(`http://localhost:8000/db_queries/registra_site?site_url=${encodeURIComponent(url)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Verificar se a resposta contém os campos esperados
            if (data.site_url && data.site_id) {
                setSnackbar({
                    open: true,
                    message: `Site cadastrado com sucesso! ID: ${data.site_id}`,
                    severity: 'success',
                });
                setUrl('');
            } else {
                // Se a resposta não tiver o formato esperado, mas a requisição foi bem-sucedida
                console.log('Resposta da API:', data);
                setSnackbar({
                    open: true,
                    message: 'Site cadastrado com sucesso!',
                    severity: 'success',
                });
                setUrl('');
            }

        } catch (error) {
            console.error('Erro ao cadastrar link:', error);

            // Mensagens de erro específicas
            let errorMessage = 'Erro ao cadastrar link. Tente novamente.';

            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique se a API está rodando';
            } else if (error.message.includes('Erro na API')) {
                errorMessage = `Erro no servidor: ${error.message}`;
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="static" color="primary">
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
                        Painel Administrativo
                    </Typography>
                    <Button color="inherit" onClick={handleBack}>
                        Sair
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Seção de Cadastro de Links */}
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" mb={3}>
                                    <LinkIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                                    <Typography variant="h5" component="h2" fontWeight="600">
                                        Cadastrar Novo Site
                                    </Typography>
                                </Box>

                                <Typography variant="body1" color="text.secondary" mb={4}>
                                    Insira o link da página que será disponibilizada para os intérpretes traduzirem.
                                    O sistema registrará o site na API local (localhost:8000).
                                </Typography>

                                <Box component="form" onSubmit={handleSubmit}>
                                    <TextField
                                        fullWidth
                                        label="URL do Site"
                                        variant="outlined"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://exemplo.com/pagina-para-traducao"
                                        disabled={loading}
                                        InputProps={{
                                            startAdornment: (
                                                <Box sx={{ color: 'text.secondary', mr: 1 }}>🌐</Box>
                                            ),
                                        }}
                                        sx={{ mb: 3 }}
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
                                        sx={{
                                            py: 1.5,
                                            px: 4,
                                            minWidth: 200,
                                        }}
                                    >
                                        {loading ? 'Cadastrando...' : 'Cadastrar Site'}
                                    </Button>
                                </Box>

                            </CardContent>
                        </Card>
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

export default AdminPage;