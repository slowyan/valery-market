import React, { useState } from 'react';
import { Button, CircularProgress, Typography, Box, Alert } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import axios from 'axios';

const YookassaPayment = ({ order, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/payment/create', {
        orderId: order._id
      });

      if (response.data.confirmation_url) {
        onSuccess && onSuccess(response.data);
        window.location.href = response.data.confirmation_url;
      } else {
        throw new Error('Не получен URL для оплаты');
      }

    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      setError(error.response?.data?.error || 'Произошла ошибка при создании платежа');
      onError && onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: 400,
      mx: 'auto',
      p: 3,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      bgcolor: 'background.paper'
    }}>
      <Typography variant="h6" gutterBottom align="center">
        Оплата заказа
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }} align="center">
        Сумма к оплате: {order.totalAmount.toLocaleString('ru-RU')} ₽
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handlePayment}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
        sx={{ 
          py: 1.5,
          fontSize: '1.1rem'
        }}
      >
        {loading ? 'Подготовка к оплате...' : 'Оплатить заказ'}
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }} align="center">
        Оплата осуществляется через сервис ЮKassa
      </Typography>
    </Box>
  );
};

export default YookassaPayment; 