import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import whatsappIcon from '../images/whatsapp.png';
import telegramIcon from '../images/telegram.png';
import '../styles/main.css';
const currentYear = new Date().getFullYear();

const Footer = () => {
  const footerLinks = [
    'Последовательность работ',
    'Партнёры',
    'О себе',
    'Расценки',
    'Смета',
    'Договор',
    'Публичная оферта'
  ];


  return (
    <Box 
      component="footer" 
      sx={{ 
        background: 'rgba(0, 0, 0, 0.05)',
        py: { xs: 2, md: 5 },
        px: { xs: 1, md: 8.75 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              mb: { xs: 2, md: 0 }, 
              px: { xs: 0, md: 8.75 }
            }}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: '20px', lineHeight: '27px' }}>
                © 2000-{currentYear} valery-pools
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontSize: '20px', lineHeight: '27px' }}>
                Строительство и ремонт бассейнов
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: '20px', lineHeight: '27px' }}>
                Монтаж систем водоподготовки, обслуживание бассейнов
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 1
              }}>
                <Typography variant="body1" sx={{ fontSize: '20px', lineHeight: '27px' }}>
                  <span className="email-info">valery-pools@yandex.ru</span>
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '20px', lineHeight: '27px' }}>
                  <span className="tel-info">Тел. 8 (903) 000-85-54</span>
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                mt: 2,
              }}>
                <a href="https://wa.me/+79030008554" target="_blank" rel="noopener noreferrer">
                  <img 
                    src={whatsappIcon} 
                    alt="WhatsApp" 
                    style={{ 
                      width: '24px', 
                      height: '24px' 
                    }} 
                  />
                </a>
                <a href="tg://resolve?domain=+79030008554">
                  <img 
                    src={telegramIcon} 
                    alt="Telegram" 
                    style={{ 
                      width: '24px', 
                      height: '24px' 
                    }} 
                  />
                </a>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <List sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 2,
              p: 0,
              m: 0
            }}>
              {footerLinks.map((link) => (
                <ListItem 
                  key={link} 
                  sx={{ 
                    width: 'auto',
                    p: 0
                  }}
                >
                  <ListItemText
                    primary={
                      <Link 
                        to={`/${link.toLowerCase().replace(/\s+/g, '-')}`} 
                        className="nav-link"
                        style={{ 
                          fontSize: '18px',
                          textDecoration: 'none',
                          color: 'black',
                          lineHeight: '27px'
                        }}
                      >
                        {link}
                      </Link>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 