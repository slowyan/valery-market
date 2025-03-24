import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import '../styles/UserOrders.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Необходима авторизация');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${config.apiUrl}/orders/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Не удалось загрузить заказы');
      }
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
      setError(error.message || 'Ошибка при загрузке заказов');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      new: '#1976d2',
      processing: '#2e7d32',
      completed: '#1976d2',
      cancelled: '#d32f2f'
    };
    return colors[status] || '#757575';
  };

  const getStatusText = (status) => {
    const statusMap = {
      new: 'Новый',
      processing: 'В обработке',
      completed: 'Выполнен',
      cancelled: 'Отменён'
    };
    return statusMap[status] || status;
  };

  const handleAccordionChange = (orderId) => (event, isExpanded) => {
    setExpandedOrder(isExpanded ? orderId : null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="200px">
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h6" color="text.secondary">
          У вас пока нет заказов
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="user-orders-container">
      <Typography variant="h5" gutterBottom>
        Мои заказы
      </Typography>
      
      {orders.map((order) => (
        <Accordion
          key={order._id}
          expanded={expandedOrder === order._id}
          onChange={handleAccordionChange(order._id)}
          className="order-accordion"
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">
                  Заказ #{order._id.slice(-6)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(order.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} container justifyContent="flex-end" spacing={2}>
                <Grid item>
                  <Typography variant="subtitle1" color="primary">
                    {order.totalAmount} ₽
                  </Typography>
                </Grid>
                <Grid item>
                  <Chip
                    label={getStatusText(order.status)}
                    style={{ backgroundColor: getStatusColor(order.status), color: 'white' }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </AccordionSummary>
          
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Информация о доставке
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Адрес"
                      secondary={order.address}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Телефон"
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
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Состав заказа
                </Typography>
                <List dense>
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
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default UserOrders; 