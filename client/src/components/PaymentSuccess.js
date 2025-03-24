import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../styles/PaymentSuccess.css';

const PaymentSuccess = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const orderId = searchParams.get('orderId');
        
        if (!orderId) {
          console.error('orderId не найден в URL параметрах');
          setError('ID заказа не найден. Пожалуйста, проверьте правильность ссылки.');
          setLoading(false);
          return;
        }

        console.log('Получаем информацию о заказе:', orderId);
        const response = await axios.get(`${config.apiUrl}/orders/${orderId}`);
        
        if (response.data.success) {
          console.log('Получены данные заказа:', response.data.order);
          setOrder(response.data.order);
        } else {
          console.error('Ошибка при получении заказа:', response.data.message);
          setError(response.data.message || 'Ошибка при получении информации о заказе');
        }
      } catch (err) {
        console.error('Ошибка при получении информации о заказе:', err);
        setError('Ошибка при получении информации о заказе. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="60vh" p={3}>
        <Typography color="error" variant="h6" align="center" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Вернуться на главную
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="60vh" p={3}>
        <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
          Информация о заказе не найдена
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Вернуться на главную
        </Button>
      </Box>
    );
  }

  return (
    <Box className="payment-success-container">
      <Paper elevation={3} className="payment-success-paper">
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Оплата прошла успешно!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Спасибо за ваш заказ
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Информация о заказе
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Номер заказа"
                  secondary={`#${order._id.slice(-6)}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Дата заказа"
                  secondary={formatDate(order.createdAt)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Статус заказа"
                  secondary={order.status === 'processing' ? 'В обработке' : order.status}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Информация о доставке
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Адрес доставки"
                  secondary={order.address}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Контактный телефон"
                  secondary={order.phone}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary={order.email}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Состав заказа
            </Typography>
            <List>
              {order.items.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={item.product.name}
                    secondary={`${item.quantity} шт. x ${item.price} ₽`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" align="right">
              Итого: {order.totalAmount} ₽
            </Typography>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center" mt={4} gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            size="large"
          >
            Вернуться на главную
          </Button>
          {localStorage.getItem('token') && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/profile')}
              size="large"
            >
              Перейти в профиль
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentSuccess; 