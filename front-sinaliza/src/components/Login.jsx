import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Box,
    IconButton,
    useTheme,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    AdminPanelSettings as AdminIcon,
    RecordVoiceOver as InterpreterIcon,
} from '@mui/icons-material';

const Login = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const role = searchParams.get('role') || 'admin';

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        // Preencher com dados de demonstração
        setFormData({
            email: role === 'admin' ? 'admin@demo.com' : 'interpreter@demo.com',
            password: 'demo123'
        });
    }, [role]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simulação de login - sempre bem-sucedido para demonstração
        if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/interpreter');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBack = () => {
        navigate('/');
    };

    const roleConfig = {
        admin: {
            title: 'Login Administrativo',
            icon: <AdminIcon sx={{ fontSize: 48 }} />,
            buttonText: 'Acessar Painel Admin',
            color: theme.palette.primary.main,
        },
        interpreter: {
            title: 'Login do Intérprete',
            icon: <InterpreterIcon sx={{ fontSize: 48 }} />,
            buttonText: 'Acessar Plataforma',
            color: theme.palette.secondary.main,
        },
    };

    const config = roleConfig[role];

    return (
        <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
            <IconButton
                onClick={handleBack}
                sx={{ mb: 2 }}
                color="primary"
            >
                <BackIcon />
                <Typography variant="body1" sx={{ ml: 1 }}>
                    Voltar
                </Typography>
            </IconButton>

            <Card>
                <CardContent sx={{ p: 4 }}>
                    <Box textAlign="center" mb={3}>
                        <Box sx={{ color: config.color, mb: 2 }}>
                            {config.icon}
                        </Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
                            {config.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Use as credenciais para continuar
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="E-mail"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Senha"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{
                                mt: 1,
                                mb: 2,
                                py: 1.5,
                                bgcolor: config.color,
                                '&:hover': {
                                    bgcolor: config.color,
                                },
                            }}
                        >
                            {config.buttonText}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Login;