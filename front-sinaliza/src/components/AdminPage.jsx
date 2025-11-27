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
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    Analytics as AnalyticsIcon,
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
            // Simular chamada API - substitua pela sua URL real
            const response = await fetch('http://localhost:3001/api/links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    name: `Link ${new Date().toLocaleDateString()}`,
                    description: 'Link cadastrado via painel administrativo',
                }),
            });

            // Simulando delay da API
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (response.ok) {
                setSnackbar({
                    open: true,
                    message: 'Link cadastrado com sucesso!',
                    severity: 'success',
                });
                setUrl('');
            } else {
                throw new Error('Erro ao cadastrar link');
            }
        } catch (error) {
            console.error('Erro ao cadastrar link:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao cadastrar link. Tente novamente.',
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
                                        Cadastrar Novo Link
                                    </Typography>
                                </Box>

                                <Typography variant="body1" color="text.secondary" mb={4}>
                                    Insira o link da página onde os intérpretes irão buscar informações para tradução.
                                </Typography>

                                <Box component="form" onSubmit={handleSubmit}>
                                    <TextField
                                        fullWidth
                                        label="URL da Página"
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
                                        {loading ? 'Cadastrando...' : 'Cadastrar Link'}
                                    </Button>
                                </Box>

                                {/* Informações adicionais */}
                                <Paper variant="outlined" sx={{ p: 3, mt: 4, bgcolor: 'background.default' }}>
                                    <Typography variant="subtitle2" gutterBottom color="primary">
                                        💡 Informações importantes:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        • Certifique-se de que o link é acessível publicamente<br />
                                        • A página deve conter o conteúdo a ser traduzido<br />
                                        • Os intérpretes terão acesso a este link<br />
                                        • Você pode cadastrar múltiplos links
                                    </Typography>
                                </Paper>
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