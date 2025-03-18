const axios = require('axios');
const config = require('../config');
const isDevelopment = process.env.NODE_ENV !== 'production';

class SmsService {
  constructor() {
    this.baseUrl = 'https://sms.ru';
    this.apiKey = config.sms.apiKey;
  }

  async sendVerificationCode(phone, code) {
    try {
      // В режиме разработки просто логируем код
      if (isDevelopment) {
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

  async sendSms(phone, message) {
    try {
      if (config.sms.enabled) {
        // Здесь будет реальная отправка SMS через провайдера
        console.log('SMS отправлено через провайдера:', { phone, message });
      } else {
        // В режиме разработки просто выводим код в консоль
        console.log('=================================');
        console.log(`Код подтверждения для ${phone}:`);
        console.log(message);
        console.log('=================================');
      }
      return true;
    } catch (error) {
      console.error('Ошибка отправки SMS:', error);
      return false;
    }
  }

  async sendSMS(phone, message) {
    try {
      // В реальном приложении здесь был бы запрос к SMS-сервису
      // Для тестирования просто логируем сообщение
      console.log('SMS Service:', {
        to: phone,
        message: message,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        messageId: Math.random().toString(36).substring(7)
      };
    } catch (error) {
      console.error('SMS Service Error:', error);
      throw new Error('Failed to send SMS');
    }
  }
}

module.exports = new SmsService(); 