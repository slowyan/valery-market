import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const PublicOffer = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Публичная оферта
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" paragraph>
            Настоящая публичная оферта (далее – «Оферта») является официальным предложением ООО "Валерий-Пулз" (далее – «Продавец») заключить договор розничной купли-продажи товара дистанционным способом (далее – «Договор») на указанных ниже условиях.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            1. Предмет договора
          </Typography>
          <Typography variant="body1" paragraph>
            1.1. Продавец обязуется передать в собственность Покупателю товар (далее – «Товар»), а Покупатель обязуется оплатить Товар и принять его на условиях настоящего Договора.
          </Typography>
          <Typography variant="body1" paragraph>
            1.2. Наименование, цена, количество Товара, а также другие необходимые условия Договора определяются на основе сведений, сообщенных Покупателем при оформлении заказа.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            2. Момент заключения договора
          </Typography>
          <Typography variant="body1" paragraph>
            2.1. Акцептом настоящей Оферты является оформление Покупателем заказа на Товар в порядке, установленном на сайте.
          </Typography>
          <Typography variant="body1" paragraph>
            2.2. Акцептируя настоящую Оферту, Покупатель выражает согласие в том, что:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
            <li>ознакомлен с условиями настоящей Оферты в полном объеме до совершения акцепта;</li>
            <li>полностью принимает условия настоящей Оферты без каких-либо изъятий и ограничений;</li>
            <li>подтверждает, что все условия настоящей Оферты ему понятны;</li>
            <li>имеет полное право на совершение действий, направленных на акцепт настоящей Оферты.</li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            3. Цена и порядок оплаты
          </Typography>
          <Typography variant="body1" paragraph>
            3.1. Цена Товара определяется на основе сведений, сообщенных Покупателем при оформлении заказа.
          </Typography>
          <Typography variant="body1" paragraph>
            3.2. Оплата Товара производится в порядке, установленном на сайте.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            4. Доставка
          </Typography>
          <Typography variant="body1" paragraph>
            4.1. Доставка Товара осуществляется в порядке, установленном на сайте.
          </Typography>
          <Typography variant="body1" paragraph>
            4.2. Риск случайной гибели или случайного повреждения Товара переходит к Покупателю с момента передачи ему Товара.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            5. Возврат товара
          </Typography>
          <Typography variant="body1" paragraph>
            5.1. Покупатель вправе отказаться от Товара в течение 7 дней с момента передачи ему Товара.
          </Typography>
          <Typography variant="body1" paragraph>
            5.2. Возврат Товара надлежащего качества возможен в случае, если сохранены его товарный вид, потребительские свойства, а также документ, подтверждающий факт и условия покупки указанного Товара.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            6. Конфиденциальность
          </Typography>
          <Typography variant="body1" paragraph>
            6.1. Продавец обязуется не разглашать полученную от Покупателя информацию. Не считается нарушением предоставление Продавцом информации лицам, действующим на основании договора с Продавцом, для исполнения обязательств перед Покупателем.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            7. Заключительные положения
          </Typography>
          <Typography variant="body1" paragraph>
            7.1. Настоящая Оферта регулируется и толкуется в соответствии с законодательством Российской Федерации.
          </Typography>
          <Typography variant="body1" paragraph>
            7.2. Все споры, которые могут возникнуть между сторонами по настоящему Договору, разрешаются путем переговоров. В случае невозможности разрешения споров путем переговоров они подлежат рассмотрению в соответствующем суде по месту нахождения ответчика.
          </Typography>

          <Typography variant="body1" sx={{ mt: 4, fontStyle: 'italic' }}>
            ООО "Валерий-Пулз"<br />
            ИНН: 9728127231<br />
            ОГРН: 1247700192960<br />
            Адрес: 117630, город Москва, ул Воронцовские Пруды, д. 3, помещ. 48/2 <br />
            Телефон: +7 (903) 000-85-54<br />
            Email: valery-pools@yandex.ru
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PublicOffer; 