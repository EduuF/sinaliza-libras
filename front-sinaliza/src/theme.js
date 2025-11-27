import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#667eea',
            light: '#a3b5ff',
            dark: '#5a6fd8',
        },
        secondary: {
            main: '#764ba2',
            light: '#a67fd4',
            dark: '#653a8c',
        },
        background: {
            default: '#f5f7fa',
        },
    },
    typography: {
        h3: {
            fontWeight: 700,
        },
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
            },
        },
    },
});

export default theme;