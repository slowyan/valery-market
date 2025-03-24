import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import config from '../config';

const PaymentSuccess = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const orderId = localStorage.getItem('pendingOrderId');
      
      if (!orderId) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get(`${config.apiUrl}/orders/${orderId}`);
        
        if (response.data.success) {
          setOrderDetails(response.data.order);
          
          if (response.data.order.paymentStatus === 'succeeded') {
            localStorage.removeItem('pendingOrderId');
            if (onSuccess) {
              onSuccess(response.data);
            }
          }
        } else {
          setError('Не удалось получить информацию о заказе');
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса оплаты:', error);
        setError('Произошла ошибка при проверке статуса оплаты');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [navigate, onSuccess]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {error ? (
          <Box textAlign="center">
            <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" color="error" gutterBottom>
              {error}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
              Вернуться на главную
            </Button>
          </Box>
        ) : orderDetails && (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
              {orderDetails.paymentStatus === 'succeeded' ? (
                <>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h5" color="success.main">
                    Оплата прошла успешно
                  </Typography>
                </>
              ) : (
                <Alert severity="info" sx={{ width: '100%' }}>
                  Ожидание подтверждения оплаты...
                </Alert>
              )}
            </Box>

            <Typography variant="h6" gutterBottom>
              Детали заказа №{orderDetails._id}
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Товар</TableCell>
                    <TableCell align="right">Количество</TableCell>
                    <TableCell align="right">Цена</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderDetails.items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.product?.name || 'Товар'}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.price} ₽</TableCell>
                      <TableCell align="right">{item.price * item.quantity} ₽</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right"><strong>Итого:</strong></TableCell>
                    <TableCell align="right"><strong>{orderDetails.totalAmount} ₽</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Информация о доставке
              </Typography>
              <Typography variant="body1">
                Получатель: {orderDetails.customerName}
              </Typography>
              <Typography variant="body1">
                Телефон: {orderDetails.phone}
              </Typography>
              <Typography variant="body1">
                Адрес: {orderDetails.address}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="center" gap={2}>
              <Button 
                variant="contained" 
                onClick={() => navigate(`/orders/${orderDetails._id}`)}
              >
                Перейти к заказу
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/')}
              >
                На главную
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentSuccess; 