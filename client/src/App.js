import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Catalog from './components/Catalog';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import PublicOffer from './pages/PublicOffer';
import Contract from './pages/Contract';
import './styles/main.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Header />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={
                  <ProtectedRoute adminRequired={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="/публичная-оферта" element={<PublicOffer />} />
                <Route path="/договор" element={<Contract />} />
                <Route path="/contract" element={<Contract />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 