const axios = require('axios');

class SmsService {
  constructor() {
    // Инициализация будет происходить позже
    this.baseUrl = 'https://sms.ru';
  }

  initialize() {
    this.apiKey = process.env.SMS_RU_API_KEY;
    console.log('SMS.RU API Key initialized:', this.apiKey);
  }

  async sendVerificationCode(phone, code) {
    if (!this.apiKey) {
      this.initialize();
    }

    try {
      // В режиме разработки просто логируем код
      if (process.env.NODE_ENV === 'development') {
        console.log('==================================');
        console.log('🔐 КОД ПОДТВЕРЖДЕНИЯ');
        console.log('📱 Телефон:', phone);
        console.log('🔑 Код:', code);
        console.log('==================================');
        return true;
      }

      // В production отправляем реальное SMS
      const message = `Ваш код подтверждения: ${code}`;
      const url = `${this.baseUrl}/sms/send`;
      
      console.log('Отправляем запрос к SMS.RU:');
      console.log('URL:', url);
      console.log('Параметры:', {
        api_id: this.apiKey,
        to: phone,
        msg: message,
        json: 1
      });
      
      const response = await axios.get(url, {
        params: {
          api_id: this.apiKey,
          to: phone,
          msg: message,
          json: 1
        }
      });

      console.log('Ответ от SMS.RU:', JSON.stringify(response.data, null, 2));

      // Проверяем успешность отправки
      if (response.data.status === "OK") {
        const sms = response.data.sms[phone];
        if (sms.status === "OK") {
          console.log('SMS успешно отправлено, ID:', sms.sms_id);
          return true;
        } else {
          console.error('Ошибка отправки SMS:', sms.status_text);
          return false;
        }
      } else {
        console.error('Ошибка API SMS.RU:', response.data.status_text);
        return false;
      }
    } catch (error) {
      console.error('Ошибка отправки SMS:', error.message);
      return false;
    }
  }

  async checkBalance() {
    if (!this.apiKey) {
      this.initialize();
    }

    try {
      const url = `${this.baseUrl}/my/balance`;
      const response = await axios.get(url, {
        params: {
          api_id: this.apiKey,
          json: 1
        }
      });
      
      console.log('Ответ от SMS.RU (баланс):', response.data);
      
      if (response.data.status === "OK") {
        return {
          success: true,
          balance: response.data.balance
        };
      } else {
        return {
          success: false,
          message: response.data.status_text
        };
      }
    } catch (error) {
      console.error('Ошибка проверки баланса:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

const smsService = new SmsService();

module.exports = smsService; 