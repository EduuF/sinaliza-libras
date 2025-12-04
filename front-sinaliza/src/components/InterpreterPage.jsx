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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Language as LanguageIcon,
    Link as LinkIcon,
    VideoCall as VideoIcon,
    Person as PersonIcon,
    CheckCircle as SuccessIcon,
    Code as CodeIcon,
    ContentCopy as CopyIcon,
    Translate as TranslateIcon,
    Web as WebIcon,
    ExpandMore as ExpandMoreIcon,
    List as ListIcon,
    KeyboardArrowRight as ArrowRightIcon,
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
        trechoId: '',
    });

    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTrechoIndex, setSelectedTrechoIndex] = useState(0);

    // Dados recebidos da API - agora é um array
    const [trechoList, setTrechoList] = useState([]);
    const [siteInfo, setSiteInfo] = useState(null);

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
        setTrechoList([]);
        setSiteInfo(null);
        setSelectedTrechoIndex(0);

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
            if (data.status === 'success' && Array.isArray(data.response)) {
                if (data.response.length === 0) {
                    setSnackbar({
                        open: true,
                        message: 'Nenhum trecho disponível para tradução com os critérios informados.',
                        severity: 'info',
                    });
                    setTrechoList([]);
                } else {
                    // Extrair informações do primeiro trecho para o siteInfo
                    const firstTrecho = data.response[0];
                    setSiteInfo({
                        siteUrl: firstTrecho.site_url,
                        siteId: firstTrecho.site_id,
                    });

                    // Mapear os trechos para o formato esperado
                    const trechos = data.response.map((trecho, index) => ({
                        id: index,
                        conteudo: trecho.conteudo,
                        snapshotName: trecho.snapshot_name,
                        trechoId: trecho.trecho_id,
                        siteUrl: trecho.site_url,
                        siteId: trecho.site_id,
                        status: 'pendente',
                    }));

                    setTrechoList(trechos);

                    // Preencher o formulário com o primeiro trecho
                    if (trechos.length > 0) {
                        setTranslationForm(prev => ({
                            ...prev,
                            trechoId: trechos[0].trechoId.toString()
                        }));
                    }

                    setSnackbar({
                        open: true,
                        message: `Encontrados ${trechos.length} trecho(s) para tradução!`,
                        severity: 'success',
                    });
                }
            } else {
                throw new Error('Formato de resposta inválido da API');
            }

        } catch (error) {
            console.error('Erro ao buscar trecho:', error);

            // Mensagens de erro específicas
            let errorMessage = 'Erro ao buscar trecho para tradução.';

            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique se a API está rodando em localhost:8000';
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

            setTrechoList([]);
            setSiteInfo(null);
        } finally {
            setSearching(false);
        }
    };

    // Função para selecionar um trecho específico
    const handleSelectTrecho = (index) => {
        setSelectedTrechoIndex(index);
        setTranslationForm(prev => ({
            ...prev,
            trechoId: trechoList[index].trechoId.toString()
        }));
    };

    // Função para marcar um trecho como traduzido
    const handleMarkAsTranslated = (index) => {
        const updatedTrechos = [...trechoList];
        updatedTrechos[index].status = 'traduzido';
        setTrechoList(updatedTrechos);

        setSnackbar({
            open: true,
            message: `Trecho ${trechoList[index].trechoId} marcado como traduzido!`,
            severity: 'success',
        });
    };

    // Função para registrar vídeo da tradução
    const handleRegisterVideo = async (e) => {
        e.preventDefault();

        if (!translationForm.interpreterId || !translationForm.videoUrl || !translationForm.trechoId) {
            setSnackbar({
                open: true,
                message: 'Por favor, preencha todos os campos obrigatórios.',
                severity: 'error',
            });
            return;
        }

        if (trechoList.length === 0) {
            setSnackbar({
                open: true,
                message: 'Nenhum trecho disponível para registro.',
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
            params.append('trecho_id', translationForm.trechoId);

            // CHAMADA REAL DA API
            const response = await fetch(`http://localhost:8000/db_queries/registra_video?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
            }

            // Marcar o trecho atual como traduzido
            handleMarkAsTranslated(selectedTrechoIndex);

            // Resetar apenas os campos de tradução, mantendo o ID do intérprete
            setTranslationForm(prev => ({
                interpreterId: prev.interpreterId, // Mantém o ID do intérprete
                videoUrl: '',
                trechoId: trechoList.length > 0 ?
                    (selectedTrechoIndex < trechoList.length - 1 ?
                        trechoList[selectedTrechoIndex + 1].trechoId.toString() :
                        trechoList[0].trechoId.toString()
                    ) : ''
            }));

            // Selecionar o próximo trecho automaticamente, se houver
            if (selectedTrechoIndex < trechoList.length - 1) {
                setSelectedTrechoIndex(selectedTrechoIndex + 1);
            } else {
                setSelectedTrechoIndex(0);
            }

            setSnackbar({
                open: true,
                message: 'Vídeo registrado com sucesso! Continue com os próximos trechos.',
                severity: 'success',
            });

        } catch (error) {
            console.error('Erro ao registrar vídeo:', error);

            // Mensagens de erro específicas
            let errorMessage = 'Erro ao registrar vídeo da tradução.';

            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique se a API está rodando em localhost:8000';
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
                                        1. Buscar Trechos para Tradução
                                    </Typography>
                                </Box>

                                <Typography variant="body1" color="text.secondary" mb={3}>
                                    Preencha os campos abaixo para buscar trechos para traduzir.
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
                                                helperText="Deixe em branco para receber trechos de qualquer site"
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
                                        {searching ? 'Buscando...' : 'Buscar Trechos'}
                                    </Button>
                                </Box>


                            </CardContent>
                        </Card>

                        {/* Exibir informações do site */}
                        {siteInfo && (
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
                                                    {siteInfo.siteUrl}
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => window.open(siteInfo.siteUrl, '_blank')}
                                                    startIcon={<LinkIcon />}
                                                >
                                                    Abrir
                                                </Button>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle1" gutterBottom fontWeight="600" color="primary">
                                                ID do Site:
                                            </Typography>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    bgcolor: 'background.default'
                                                }}
                                            >
                                                <Typography variant="h6" fontFamily="monospace" textAlign="center">
                                                    {siteInfo.siteId}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}

                        {/* Exibir lista de trechos */}
                        {trechoList.length > 0 && (
                            <Card sx={{ mb: 4 }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Box display="flex" alignItems="center" mb={3}>
                                        <ListIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                                        <Typography variant="h5" component="h2" fontWeight="600">
                                            Trechos Encontrados ({trechoList.length})
                                        </Typography>
                                    </Box>

                                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                                        {trechoList.map((trecho, index) => (
                                            <Accordion
                                                key={trecho.trechoId}
                                                expanded={selectedTrechoIndex === index}
                                                onChange={() => handleSelectTrecho(index)}
                                                sx={{
                                                    mb: 2,
                                                    border: selectedTrechoIndex === index ? '2px solid #2196f3' : '1px solid #e0e0e0'
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{
                                                        bgcolor: selectedTrechoIndex === index ? 'primary.light' : 'background.paper',
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography fontWeight="600">
                                                                Trecho #{index + 1} - ID: {trecho.trechoId}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {trecho.conteudo.substring(0, 100)}...
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ ml: 2 }}>
                                                            <Chip
                                                                label={trecho.status === 'pendente' ? 'Pendente' : 'Traduzido'}
                                                                color={trecho.status === 'pendente' ? 'warning' : 'success'}
                                                                size="small"
                                                            />
                                                        </Box>
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" gutterBottom color="primary">
                                                            Conteúdo:
                                                        </Typography>
                                                        <Paper
                                                            variant="outlined"
                                                            sx={{
                                                                p: 2,
                                                                bgcolor: 'background.default',
                                                                maxHeight: 200,
                                                                overflow: 'auto',
                                                                whiteSpace: 'pre-wrap',
                                                                lineHeight: 1.6
                                                            }}
                                                        >
                                                            {trecho.conteudo}
                                                        </Paper>
                                                        <Box display="flex" justifyContent="space-between" mt={1}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {trecho.conteudo.length} caracteres
                                                            </Typography>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<CopyIcon />}
                                                                onClick={() => copyToClipboard(trecho.conteudo)}
                                                            >
                                                                Copiar Texto
                                                            </Button>
                                                        </Box>
                                                    </Box>

                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body2" color="text.secondary">
                                                            Snapshot: {trecho.snapshotName}
                                                        </Typography>
                                                        {selectedTrechoIndex === index && (
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                startIcon={<ArrowRightIcon />}
                                                                onClick={() => handleSelectTrecho(index)}
                                                            >
                                                                Selecionado
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        )}

                        {/* Passo 2: Formulário de registro de vídeo */}
                        {(trechoList.length > 0) && (
                            <Card>
                                <CardContent sx={{ p: 4 }}>
                                    <Box display="flex" alignItems="center" mb={3}>
                                        <VideoIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                                        <Typography variant="h5" component="h2" fontWeight="600">
                                            2. Registrar Vídeo da Tradução
                                        </Typography>
                                    </Box>

                                    <Typography variant="body1" color="text.secondary" mb={3}>
                                        {trechoList[selectedTrechoIndex]?.status === 'traduzido'
                                            ? 'Este trecho já foi traduzido. Continue com o próximo.'
                                            : `Registre a tradução para o Trecho #${selectedTrechoIndex + 1} (ID: ${trechoList[selectedTrechoIndex]?.trechoId})`}
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
                                                    disabled={submitting || trechoList[selectedTrechoIndex]?.status === 'traduzido'}
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
                                                    disabled={submitting || trechoList[selectedTrechoIndex]?.status === 'traduzido'}
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
                                                    label="ID do Trecho Atual"
                                                    variant="outlined"
                                                    value={translationForm.trechoId}
                                                    disabled
                                                    InputProps={{
                                                        startAdornment: (
                                                            <Box sx={{ color: 'text.secondary', mr: 1 }}>
                                                                <CodeIcon fontSize="small" />
                                                            </Box>
                                                        ),
                                                    }}
                                                    helperText={`Trecho #${selectedTrechoIndex + 1} de ${trechoList.length}`}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Box display="flex" gap={2} mt={3}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                disabled={submitting || trechoList[selectedTrechoIndex]?.status === 'traduzido'}
                                                startIcon={submitting ? <CircularProgress size={20} /> : <SuccessIcon />}
                                                sx={{
                                                    py: 1.5,
                                                    px: 4,
                                                    minWidth: 200,
                                                }}
                                            >
                                                {submitting ? 'Registrando...' : 'Registrar Vídeo'}
                                            </Button>

                                            {selectedTrechoIndex < trechoList.length - 1 && (
                                                <Button
                                                    variant="outlined"
                                                    size="large"
                                                    onClick={() => handleSelectTrecho(selectedTrechoIndex + 1)}
                                                    startIcon={<ArrowRightIcon />}
                                                    sx={{
                                                        py: 1.5,
                                                        px: 4,
                                                    }}
                                                >
                                                    Próximo Trecho
                                                </Button>
                                            )}
                                        </Box>
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