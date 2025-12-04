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
    Chip,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    Fade,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Language as LanguageIcon,
    Link as LinkIcon,
    VideoCall as VideoIcon,
    Person as PersonIcon,
    CheckCircle as SuccessIcon,
    TextFields as TextIcon,
    Code as CodeIcon,
    ContentCopy as CopyIcon,
    Translate as TranslateIcon,
    Web as WebIcon,
} from '@mui/icons-material';

const InterpreterPage = () => {
    const navigate = useNavigate();

    // Estados para o primeiro formulário (buscar trecho)
    const [searchForm, setSearchForm] = useState({
        siteId: '',
        translateOption: 'single', // 'single' ou 'all'
    });

    // Estados para o segundo formulário (registrar tradução)
    const [translationForm, setTranslationForm] = useState({
        interpreterId: '',
        videoUrl: '',
    });

    // Estados para controle do fluxo
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Dados recebidos da API
    //const [trechoData, setTrechoData] = useState(null);
    const [trechoData, setTrechoData] = useState({
        conteudo: 'Lorem Ipsum dolor sit amet',
        snapshotName: 'snapshot.jpg',
        trechoId: '123',
        siteUrl: 'www.meusite.com',
        siteId: '1',
    })

    // Snackbar para feedback
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleBack = () => {
        navigate('/');
    };

    // Função para copiar texto para área de transferência
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSnackbar({
            open: true,
            message: 'Texto copiado para a área de transferência!',
            severity: 'info',
        });
    };

    // Função para buscar trecho para tradução
    const handleSearchTrecho = async (e) => {
        e.preventDefault();
        setSearching(true);

        try {
            // Construir parâmetros da API
            const params = new URLSearchParams();

            // site_id é opcional, só adiciona se não for vazio
            if (searchForm.siteId.trim() !== '') {
                // Converter para número inteiro
                const siteId = parseInt(searchForm.siteId);
                if (!isNaN(siteId)) {
                    params.append('site_id', siteId);
                }
            }

            // get_all_trechos_from_site é baseado na opção selecionada
            const getAllTrechos = searchForm.translateOption === 'all';
            params.append('get_all_trechos_from_site', getAllTrechos);

            //  CHAMADA /get_trecho_para_traduzir
            const response = await fetch(`http://localhost:8000/db_queries/get_trecho_para_traduzir?${params.toString()}`, {
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
            if (data.conteudo && data.trecho_id) {
                setTrechoData({
                    conteudo: data.conteudo,
                    snapshotName: data.snapshot_name || 'snapshot.jpg',
                    trechoId: data.trecho_id,
                    siteUrl: data.site_url || 'URL não disponível',
                    siteId: data.site_id || 'N/A',
                });

                setSnackbar({
                    open: true,
                    message: 'Trecho carregado com sucesso!',
                    severity: 'success',
                });
            } else {
                throw new Error('Formato de resposta inválido da API');
            }

        } catch (error) {
            console.error('Erro ao buscar trecho:', error);

            // Mensagens de erro específicas
            let errorMessage = 'Erro ao buscar trecho para tradução.';

            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique se a API está rodando';
            } else if (error.message.includes('Erro na API')) {
                errorMessage = `Erro no servidor: ${error.message}`;
            } else if (error.message.includes('Formato de resposta inválido')) {
                errorMessage = 'A API retornou um formato de dados inesperado.';
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error',
            });

            setTrechoData(null);
        } finally {
            setSearching(false);
        }
    };

    // Função para registrar vídeo da tradução
    const handleRegisterVideo = async (e) => {
        e.preventDefault();

        if (!translationForm.interpreterId || !translationForm.videoUrl || !trechoData) {
            setSnackbar({
                open: true,
                message: 'Por favor, preencha todos os campos obrigatórios e busque um trecho primeiro.',
                severity: 'error',
            });
            return;
        }

        setSubmitting(true);

        try {
            // Construir parâmetros da API
            const params = new URLSearchParams();
            params.append('interprete_id', translationForm.interpreterId);
            params.append('video_url', translationForm.videoUrl);
            params.append('trecho_id', trechoData.trechoId);

            // CHAMADA registra_video
            const response = await fetch(`http://localhost:8000/db_queries/registra_video?${params.toString()}`, {
                method: 'GET', // realmente GET?
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
            }

            // A API não retorna dados, apenas valida o status
            setSnackbar({
                open: true,
                message: 'Vídeo registrado com sucesso! Sua tradução foi salva.',
                severity: 'success',
            });

            // Resetar formulários após sucesso
            setTranslationForm({
                interpreterId: '',
                videoUrl: '',
            });
            setSearchForm({
                siteId: '',
                translateOption: 'single',
            });
            setTrechoData(null);

        } catch (error) {
            console.error('Erro ao registrar vídeo:', error);

            // Mensagens de erro específicas
            let errorMessage = 'Erro ao registrar vídeo da tradução.';

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
            setSubmitting(false);
        }
    };

    // Manipuladores de mudança nos formulários
    const handleSearchFormChange = (e) => {
        const { name, value } = e.target;
        setSearchForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTranslationFormChange = (e) => {
        const { name, value } = e.target;
        setTranslationForm(prev => ({
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
                        {/* Passo 1: Buscar trecho para tradução */}
                        <Card sx={{ mb: 4 }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" mb={3}>
                                    <LanguageIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                                    <Typography variant="h5" component="h2" fontWeight="600">
                                        1. Buscar Trecho para Tradução
                                    </Typography>
                                </Box>

                                <Typography variant="body1" color="text.secondary" mb={3}>
                                    Preencha os campos abaixo para buscar um trecho específico para traduzir.
                                </Typography>

                                <Box component="form" onSubmit={handleSearchTrecho}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="ID do Site (opcional)"
                                                name="siteId"
                                                variant="outlined"
                                                value={searchForm.siteId}
                                                onChange={handleSearchFormChange}
                                                placeholder="Ex: 123"
                                                disabled={searching}
                                                helperText="Deixe em branco para receber qualquer trecho disponível"
                                                InputProps={{
                                                    startAdornment: (
                                                        <Box sx={{ color: 'text.secondary', mr: 1 }}>
                                                            <WebIcon fontSize="small" />
                                                        </Box>
                                                    ),
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FormControl component="fieldset">
                                                <FormLabel component="legend" sx={{ mb: 2 }}>
                                                    Tipo de Tradução:
                                                </FormLabel>
                                                <RadioGroup
                                                    row
                                                    name="translateOption"
                                                    value={searchForm.translateOption}
                                                    onChange={handleSearchFormChange}
                                                >
                                                    <FormControlLabel
                                                        value="single"
                                                        control={<Radio />}
                                                        label="Trecho Específico"
                                                        disabled={searching}
                                                    />
                                                    <FormControlLabel
                                                        value="all"
                                                        control={<Radio />}
                                                        label="Todo o Site"
                                                        disabled={searching}
                                                    />
                                                </RadioGroup>
                                            </FormControl>
                                            <Typography variant="caption" color="text.secondary">
                                                {searchForm.translateOption === 'single'
                                                    ? 'Receba um trecho específico para traduzir'
                                                    : 'Receba todos os trechos disponíveis deste site'}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={searching}
                                        startIcon={searching ? <CircularProgress size={20} /> : <TranslateIcon />}
                                        sx={{
                                            mt: 3,
                                            py: 1.5,
                                            px: 4,
                                            minWidth: 250,
                                        }}
                                    >
                                        {searching ? 'Buscando...' : 'Buscar Trecho para Tradução'}
                                    </Button>
                                </Box>


                            </CardContent>
                        </Card>

                        {/* Exibir dados recebidos da API */}
                        {trechoData && (
                            <Fade in={true} timeout={500}>
                                <Box>
                                    {/* Card com informações do site */}
                                    <Card sx={{ mb: 4 }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Box display="flex" alignItems="center" mb={3}>
                                                <WebIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                                                <Typography variant="h5" component="h2" fontWeight="600">
                                                    Informações do Site
                                                </Typography>
                                            </Box>

                                            <Grid container spacing={3}>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle1" gutterBottom fontWeight="600" color="primary">
                                                        URL do Site:
                                                    </Typography>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            p: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            bgcolor: 'background.default'
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                wordBreak: 'break-all',
                                                                fontFamily: 'monospace',
                                                                color: 'primary.main',
                                                                flex: 1,
                                                                mr: 2
                                                            }}
                                                        >
                                                            {trechoData.siteUrl}
                                                        </Typography>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => window.open(trechoData.siteUrl, '_blank')}
                                                            startIcon={<LinkIcon />}
                                                            disabled={trechoData.siteUrl === 'URL não disponível'}
                                                        >
                                                            Abrir
                                                        </Button>
                                                    </Paper>
                                                </Grid>

                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle1" gutterBottom fontWeight="600" color="primary">
                                                        Informações do Trecho:
                                                    </Typography>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            p: 2,
                                                            bgcolor: 'background.default'
                                                        }}
                                                    >
                                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                                            <Typography variant="body2">ID do Trecho:</Typography>
                                                            <Typography variant="body2" fontWeight="600" fontFamily="monospace">
                                                                {trechoData.trechoId}
                                                            </Typography>
                                                        </Box>
                                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                                            <Typography variant="body2">ID do Site:</Typography>
                                                            <Typography variant="body2" fontFamily="monospace">
                                                                {trechoData.siteId}
                                                            </Typography>
                                                        </Box>
                                                        <Box display="flex" justifyContent="space-between">
                                                            <Typography variant="body2">Snapshot:</Typography>
                                                            <Typography variant="body2" fontFamily="monospace">
                                                                {trechoData.snapshotName}
                                                            </Typography>
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>

                                    {/* Card com trecho para tradução */}
                                    <Card sx={{ mb: 4 }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Box display="flex" alignItems="center" mb={3}>
                                                <TextIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                                                <Typography variant="h5" component="h2" fontWeight="600">
                                                    Trecho para Tradução
                                                </Typography>
                                            </Box>

                                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                                <Typography variant="subtitle1" color="primary" fontWeight="600">
                                                    Conteúdo a ser traduzido:
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<CopyIcon />}
                                                    onClick={() => copyToClipboard(trechoData.conteudo)}
                                                >
                                                    Copiar Texto
                                                </Button>
                                            </Box>

                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 3,
                                                    bgcolor: 'background.default',
                                                    maxHeight: 400,
                                                    overflow: 'auto',
                                                    whiteSpace: 'pre-wrap',
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {trechoData.conteudo}
                                            </Paper>

                                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {trechoData.conteudo.length} caracteres
                                                </Typography>
                                                <Chip
                                                    label="Pronto para Tradução"
                                                    color="success"
                                                    size="small"
                                                    icon={<SuccessIcon />}
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>

                                    {/* Passo 2: Formulário de registro de vídeo */}
                                    <Card>
                                        <CardContent sx={{ p: 4 }}>
                                            <Box display="flex" alignItems="center" mb={3}>
                                                <VideoIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                                                <Typography variant="h5" component="h2" fontWeight="600">
                                                    2. Registrar Vídeo da Tradução
                                                </Typography>
                                            </Box>

                                            <Typography variant="body1" color="text.secondary" mb={3}>
                                                Após realizar a tradução, preencha os dados abaixo para registrar seu vídeo.
                                            </Typography>

                                            <Box component="form" onSubmit={handleRegisterVideo}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="ID do Intérprete *"
                                                            name="interpreterId"
                                                            variant="outlined"
                                                            value={translationForm.interpreterId}
                                                            onChange={handleTranslationFormChange}
                                                            placeholder="Ex: INT12345"
                                                            disabled={submitting}
                                                            required
                                                            helperText="Seu identificador único de intérprete"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <Box sx={{ color: 'text.secondary', mr: 1 }}>
                                                                        <PersonIcon fontSize="small" />
                                                                    </Box>
                                                                ),
                                                            }}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="URL do Vídeo *"
                                                            name="videoUrl"
                                                            variant="outlined"
                                                            value={translationForm.videoUrl}
                                                            onChange={handleTranslationFormChange}
                                                            placeholder="https://drive.google.com/... ou https://youtube.com/..."
                                                            disabled={submitting}
                                                            required
                                                            helperText="Link do vídeo com sua tradução"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <Box sx={{ color: 'text.secondary', mr: 1 }}>
                                                                        <VideoIcon fontSize="small" />
                                                                    </Box>
                                                                ),
                                                            }}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="ID do Trecho"
                                                            variant="outlined"
                                                            value={trechoData.trechoId}
                                                            disabled
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <Box sx={{ color: 'text.secondary', mr: 1 }}>
                                                                        <CodeIcon fontSize="small" />
                                                                    </Box>
                                                                ),
                                                            }}
                                                            helperText="Este campo será enviado automaticamente"
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
                                                    {submitting ? 'Registrando...' : 'Registrar Vídeo'}
                                                </Button>
                                            </Box>


                                        </CardContent>
                                    </Card>
                                </Box>
                            </Fade>
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