import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Grid,
    useTheme,
} from '@mui/material';
import {
    AdminPanelSettings as AdminIcon,
    RecordVoiceOver as InterpreterIcon,
} from '@mui/icons-material';

const HomePage = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const handleAdminClick = () => {
        navigate('/login?role=admin');
    };

    const handleInterpreterClick = () => {
        navigate('/login?role=interpreter');
    };

    const roleCards = [
        {
            title: 'Administrador',
            description: 'Acesso ao painel de gestão e configurações do sistema',
            icon: <AdminIcon sx={{ fontSize: 48 }} />,
            buttonText: 'Acessar como Admin',
            onClick: handleAdminClick,
            color: theme.palette.primary.main,
        },
        {
            title: 'Intérprete',
            description: 'Acesso à plataforma de interpretação e tradução',
            icon: <InterpreterIcon sx={{ fontSize: 48 }} />,
            buttonText: 'Acessar como Intérprete',
            onClick: handleInterpreterClick,
            color: theme.palette.secondary.main,
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box textAlign="center" mb={6}>
                <Typography variant="h3" component="h1" gutterBottom color="primary" fontWeight="bold">
                    Bem-vindo ao Sistema Sinaliza Libras
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Selecione seu tipo de acesso para continuar
                </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                {roleCards.map((card, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                },
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                <Box
                                    sx={{
                                        color: card.color,
                                        mb: 3,
                                    }}
                                >
                                    {card.icon}
                                </Box>

                                <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
                                    {card.title}
                                </Typography>

                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ mb: 3, minHeight: '60px' }}
                                >
                                    {card.description}
                                </Typography>

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={card.onClick}
                                    sx={{
                                        bgcolor: card.color,
                                        px: 4,
                                        py: 1.5,
                                        '&:hover': {
                                            bgcolor: card.color,
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                >
                                    {card.buttonText}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default HomePage;