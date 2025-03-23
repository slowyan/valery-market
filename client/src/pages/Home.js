import React, { useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import whatsappIcon from '../images/whatsapp.png';
import telegramIcon from '../images/telegram.png';
import imageMoscow from '../images/mo.png';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PoolIcon from '@mui/icons-material/Pool';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ConstructionIcon from '@mui/icons-material/Construction';
import '../styles/main.css';

// Анимированные компоненты
const MotionContainer = motion(Container);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionBox = motion(Box);
const MotionGrid = motion(Grid);
const MotionPaper = motion(Paper);

// Варианты анимации
const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1,
    y: 0, 
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
      ease: "easeOut"
    }
  }
};

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3)), url("/images/pool-hero.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  padding: theme.spacing(22, 2, 15, 2),
  textAlign: 'center',
  marginBottom: theme.spacing(6),
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))',
    zIndex: 1
  },
  '& > *': {
    position: 'relative',
    zIndex: 2
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(15, 2, 10, 2),
    minHeight: '80vh',
    '& h1': {
      fontSize: '2.5rem'
    },
    '& h5': {
      fontSize: '1.2rem'
    }
  },
  [theme.breakpoints.down('xs')]: {
    padding: theme.spacing(12, 1, 8, 1),
    minHeight: '70vh',
    '& h1': {
      fontSize: '2rem'
    },
    '& h5': {
      fontSize: '1rem'
    }
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const Home = () => {
  useEffect(() => {
    const checkSocialPosition = () => {
      const footer = document.querySelector('footer');
      const socialLinks = document.querySelector('.social-links');
      
      if (!footer || !socialLinks) return;
      
      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const bottomOffset = 30; // Отступ от низа экрана
      
      if (footerRect.top <= viewportHeight) {
        const distanceToFooter = footerRect.top - viewportHeight;
        socialLinks.style.bottom = `${Math.abs(distanceToFooter) + bottomOffset}px`;
      } else {
        socialLinks.style.bottom = `${bottomOffset}px`;
      }
    };

    window.addEventListener('scroll', checkSocialPosition);
    window.addEventListener('resize', checkSocialPosition);
    checkSocialPosition();

    return () => {
      window.removeEventListener('scroll', checkSocialPosition);
      window.removeEventListener('resize', checkSocialPosition);
    };
  }, []);

  return (
    <Box>
      <HeroSection>
        <MotionContainer 
          maxWidth="md" 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            width: '100%'
          }}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <MotionTypography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.75rem' },
              fontWeight: 'bold'
            }}
            variants={fadeInUp}
          >
            Строительство бассейнов
          </MotionTypography>
          <MotionTypography 
            variant="h5" 
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
              mb: { xs: 2, sm: 3, md: 4 }
            }}
            variants={fadeInUp}
          >
            Профессиональное строительство бассейнов в Москве и Подмосковье
          </MotionTypography>
          <MotionButton 
            variant="contained" 
            size="large" 
        sx={{
              mt: { xs: 2, sm: 3, md: 4 },
              px: { xs: 3, sm: 4, md: 6 },
              py: { xs: 1, sm: 1.5 }
            }}
            href="/contact"
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Связаться с нами
          </MotionButton>
        </MotionContainer>
      </HeroSection>

      <Container maxWidth="lg">
        <MotionBox 
          sx={{ mb: 8 }}
          initial="visible"
          animate="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <MotionTypography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            align="center" 
            sx={{ mb: 4 }}
            variants={fadeInUp}
          >
            Наши услуги
          </MotionTypography>
          <MotionGrid container spacing={4}>
            <MotionGrid 
              item 
              xs={12} 
              md={4} 
              initial={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
            >
              <StyledCard>
                <CardMedia
                  component="img"
                  height="200"
                  image="/images/pool-construction.jpg"
                  alt="Строительство бассейнов"
                />
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    Строительство бассейнов
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Полный цикл строительства бассейнов любой сложности: от проектирования до запуска
                  </Typography>
                </CardContent>
              </StyledCard>
            </MotionGrid>
            <MotionGrid 
              item 
              xs={12} 
              md={4} 
              initial={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
            >
              <StyledCard>
                <CardMedia
                  component="img"
                  height="200"
                  image="/images/pool-repair.jpg"
                  alt="Ремонт бассейнов"
                />
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    Ремонт бассейнов
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Профессиональный ремонт и реконструкция бассейнов любых типов
                  </Typography>
                </CardContent>
              </StyledCard>
            </MotionGrid>
            <MotionGrid 
              item 
              xs={12} 
              md={4} 
              initial={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
            >
              <StyledCard>
                <CardMedia
                  component="img"
                  height="200"
                  image="/images/pool-service.jpg"
                  alt="Обслуживание бассейнов"
                />
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    Обслуживание
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Регулярное обслуживание и поддержание работоспособности бассейнов
                  </Typography>
                </CardContent>
              </StyledCard>
            </MotionGrid>
          </MotionGrid>
        </MotionBox>

        <MotionBox 
          sx={{ mb: 8 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <MotionTypography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            align="center" 
            sx={{ mb: 4 }}
            variants={fadeInUp}
          >
            Почему выбирают нас
          </MotionTypography>
          <MotionGrid container spacing={4} variants={staggerContainer}>
            <MotionGrid item xs={12} md={6} variants={fadeInUp}>
              <MotionPaper 
                elevation={3} 
                sx={{ p: 3, height: '100%' }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="20+ лет опыта"
                      secondary="Огромный опыт в строительстве бассейнов различной сложности"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Гарантия качества"
                      secondary="Предоставляем гарантию на все выполненные работы"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Индивидуальный подход"
                      secondary="Учитываем все пожелания заказчика и особенности проекта"
                    />
                  </ListItem>
                </List>
              </MotionPaper>
            </MotionGrid>
            <MotionGrid item xs={12} md={6} variants={fadeInUp}>
              <MotionPaper 
                elevation={3} 
                sx={{ p: 3, height: '100%' }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Честные цены"
                      secondary="Прозрачное ценообразование без скрытых платежей"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Современные технологии"
                      secondary="Используем передовые материалы и технологии строительства"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Полный комплекс услуг"
                      secondary="От проектирования до обслуживания готового бассейна"
                    />
                  </ListItem>
                </List>
              </MotionPaper>
            </MotionGrid>
          </MotionGrid>
        </MotionBox>

        <MotionBox 
          sx={{ mb: 8 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <MotionTypography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            align="center" 
            sx={{ mb: 4 }}
            variants={fadeInUp}
          >
            Этапы работы
          </MotionTypography>
          <MotionGrid container spacing={3} variants={staggerContainer}>
            <MotionGrid item xs={12} sm={6} md={3} variants={fadeInUp}>
              <Box textAlign="center">
                <PoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  1. Консультация
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Обсуждение проекта и ваших пожеланий
                </Typography>
              </Box>
            </MotionGrid>
            <MotionGrid item xs={12} sm={6} md={3} variants={fadeInUp}>
              <Box textAlign="center">
                <EngineeringIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  2. Проектирование
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Разработка проекта и сметы
                </Typography>
              </Box>
            </MotionGrid>
            <MotionGrid item xs={12} sm={6} md={3} variants={fadeInUp}>
              <Box textAlign="center">
                <ConstructionIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  3. Строительство
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Выполнение всех строительных работ
                </Typography>
              </Box>
            </MotionGrid>
            <MotionGrid item xs={12} sm={6} md={3} variants={fadeInUp}>
              <Box textAlign="center">
                <PoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  4. Сдача объекта
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Проверка и запуск бассейна
                </Typography>
      </Box>
            </MotionGrid>
          </MotionGrid>
        </MotionBox>
      </Container>

      <div className="social-links">
        <a href="https://wa.me/+79030008554" target="_blank" rel="noopener noreferrer">
          <img src={whatsappIcon} alt="WhatsApp" className="social-icon whatsapp" />
        </a>
        <a href="https://t.me/Valerypools" target="_blank" rel="noopener noreferrer">
          <img src={telegramIcon} alt="Telegram" className="social-icon telegram" />
        </a>
      </div>

      <Container maxWidth="lg" sx={{ py: 0 }}>
        <div className="about">
          <p>
            Мы предлагаем услуги по строительству и модернизации бассейнов для частных клиентов и организаций.
          </p>
          <p>
            Наш коллектив полностью сформирован, и теперь мы работаем с частными домовладельцами, гарантируя прозрачность, ответственность и высокий уровень сервиса.
          </p>
          <p>
            Мы привлекаем только опытных, проверенных специалистов, уделяя внимание их профессионализму и качеству работы. Контроль ведется на каждом этапе, что обеспечивает надежность и долговечность наших проектов.
          </p>
          <p>
            Наша команда постоянно развивается, а каждый сотрудник имеет возможность профессионального и карьерного роста. Мы строим не только бассейны, но и репутацию надежной компании.
          </p>
        </div>

        <div className="infoblock">
          <h2>Наши расценки</h2>
          <p>
            Из-за высокой инфляции последних лет цены на работы значительно выросли, и даже некачественные мастера завышают стоимость услуг. Мы работаем только с платежеспособными клиентами и рассчитываем на ваше понимание.
          </p>
          <p>
            Актуальные расценки на основные виды работ по бассейнам обновлены в разделе <a href="/prices" className="infoblock-link">Расценки</a>
          </p>
        </div>

        <div className="infoblock infoblock-moscow">
          
          <div className="infoblock-moscow-text">
            <h2>Строительство в Москве и Московской области</h2>
            <p>Мы строим бассейны по всей Московской области, принимая заказы как вблизи, так и на удалённых участках. При необходимости наши специалисты могут оставаться на объекте с ночлегом, чтобы оптимизировать затраты и сроки работ.</p>
          </div>
          <div className="infoblock-image">
            <img src={imageMoscow} alt="Московская область"/>
          </div>
        </div>
        <div className="infoblock">
          <h2>Строительство бассейнов в регионах России</h2>
          <p>Мы рассматриваем заказы по всей России и уже оказываем техническую
          поддержку работ в Казахстане. В ближайшее время наша команда
          отправляется туда для монтажа системы водоподготовки.

          В отличие от крупных компаний, у нас пока не тысячи выполненных
          объектов, но качество наших работ значительно выше. Это достигается
          благодаря инженерному подходу: наши специалисты не просто
          контролируют процесс, а лично обучают исполнителей, участвуя в
          работе вместе с ними. Такой уровень ответственности и
          профессионализма основа нашей репутации.
          </p>
        </div>
      </Container>
    </Box>
  );
};

export default Home; 