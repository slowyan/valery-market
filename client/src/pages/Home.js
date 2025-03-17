import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import whatsappIcon from '../images/whatsapp.png';
import telegramIcon from '../images/telegram.png';
import main1Image from '../images/main1.jpg';
import mainMobileImage from '../images/main.png';
import '../styles/main.css';

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
      <Box 
        className="image-container"
        sx={{
          height: '85.4vh',
          backgroundImage: `linear-gradient(to top, rgba(255, 255, 255, 0), 83%, white),
                           linear-gradient(to bottom, rgba(255, 255, 255, 0), 94%, white),
                           url(${main1Image})`,
          backgroundSize: '100% auto',
          backgroundRepeat: 'no-repeat',
          textShadow: '0px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#E0FFFF',
          '@media (max-width: 576px)': {
            height: '26vh',
            backgroundImage: `linear-gradient(to top, rgba(255, 255, 255, 0), 89%, rgba(255, 255, 255, 1)),
                             linear-gradient(to bottom, rgba(255, 255, 255, 0) 61%, white),
                             url(${mainMobileImage})`,
            backgroundSize: 'contain',
          }
        }}
      >
        <h1 className="main-title">VALERY-POOLS</h1>
        <h2 className="main-subtitle">Услуги по бассейнам высшего качества</h2>
      </Box>

      <div className="social-links">
        <a href="https://wa.me/+79030008554" target="_blank" rel="noopener noreferrer">
          <img src={whatsappIcon} alt="WhatsApp" className="social-icon whatsapp" />
        </a>
        <a href="https://t.me/Valerypools" target="_blank" rel="noopener noreferrer">
          <img src={telegramIcon} alt="Telegram" className="social-icon telegram" />
        </a>
      </div>

      <Container maxWidth={false} sx={{ py: 0 }}>
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

        <div className="prices">
          <h2>Наши расценки</h2>
          <p>
            Из-за высокой инфляции последних лет цены на работы значительно выросли, и даже некачественные мастера завышают стоимость услуг. Мы работаем только с платежеспособными клиентами и рассчитываем на ваше понимание.
          </p>
          <p>
            Актуальные расценки на основные виды работ по бассейнам обновлены в разделе <a href="/prices" className="prices-link">Расценки</a>
          </p>
        </div>
      </Container>
    </Box>
  );
};

export default Home; 