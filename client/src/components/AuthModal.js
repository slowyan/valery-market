import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/AuthModal.css';

const API_URL = config.apiUrl;

const AuthModal = ({ isOpen, onClose }) => {
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState('phone');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const phoneInputRef = useRef(null);
    const codeInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
    const timerRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (step === 'phone' && phoneInputRef.current) {
                phoneInputRef.current.focus();
            } else if (step === 'code' && codeInputRefs[0].current) {
                codeInputRefs[0].current.focus();
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isOpen, step]);

    useEffect(() => {
        if (resendTimer > 0) {
            timerRef.current = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timerRef.current);
        }
    }, [resendTimer]);

    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length === 0) return '';
        const restOfNumber = numbers.startsWith('7') ? numbers.slice(1) : numbers;
        if (restOfNumber.length <= 3) return restOfNumber;
        if (restOfNumber.length <= 6) return `${restOfNumber.slice(0, 3)} ${restOfNumber.slice(3)}`;
        if (restOfNumber.length <= 8) return `${restOfNumber.slice(0, 3)} ${restOfNumber.slice(3, 6)} ${restOfNumber.slice(6)}`;
        return `${restOfNumber.slice(0, 3)} ${restOfNumber.slice(3, 6)} ${restOfNumber.slice(6, 8)} ${restOfNumber.slice(8, 10)}`;
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            const formattedPhone = formatPhoneNumber(value);
            setPhone(formattedPhone);
            setError('');
        }
    };

    const handleCodeChange = (index, value) => {
        const newValue = value.replace(/\D/g, '');
        if (newValue.length <= 1) {
            const newCode = [...code];
            newCode[index] = newValue;
            setCode(newCode);
            setError('');

            if (newValue.length === 1 && index < 5) {
                codeInputRefs[index + 1].current.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            codeInputRefs[index - 1].current.focus();
        }
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const phoneNumber = '7' + phone.replace(/\D/g, '');
            console.log('Отправка запроса на сервер:', phoneNumber);
            
            const response = await axios.post(`${API_URL}/auth/send-code`, {
                phone: phoneNumber
            });

            console.log('Ответ сервера:', response.data);

            if (response.data.success) {
                setStep('code');
                setCode(['', '', '', '', '', '']);
                setResendTimer(60);
            } else {
                throw new Error(response.data.message || 'Ошибка отправки кода');
            }
        } catch (err) {
            console.error('Ошибка при отправке кода:', err);
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                setError('Не удалось подключиться к серверу. Возможно, сервер не запущен.');
            } else {
                setError(err.response?.data?.message || err.message || 'Ошибка сервера. Пожалуйста, попробуйте позже.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;
        await handlePhoneSubmit({ preventDefault: () => {} });
    };

    const handleCodeKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            codeInputRefs[index - 1].current.focus();
        } else if (e.key === 'Enter' && !code.some(digit => !digit)) {
            handleCodeSubmit(e);
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const phoneNumber = '7' + phone.replace(/\D/g, '');
            const verificationCode = code.join('');
            console.log('Отправка кода на проверку:', { phone: phoneNumber, code: verificationCode });

            const response = await axios.post(`${API_URL}/auth/verify-code`, {
                phone: phoneNumber,
                code: verificationCode
            });

            console.log('Ответ сервера при проверке кода:', response.data);

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                onClose();
                window.location.reload();
            } else {
                throw new Error(response.data.message || 'Неверный код');
            }
        } catch (err) {
            console.error('Ошибка при проверке кода:', err);
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                setError('Не удалось подключиться к серверу. Возможно, сервер не запущен.');
            } else {
                setError(err.response?.data?.message || err.message || 'Ошибка сервера. Пожалуйста, попробуйте позже.');
            }
            setCode(['', '', '', '', '', '']);
            if (codeInputRefs[0].current) {
                codeInputRefs[0].current.focus();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setStep('phone');
        setError('');
        setCode(['', '', '', '', '', '']);
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal">
                <button className="close-button" onClick={onClose}>&times;</button>
                {step === 'code' && (
                    <button className="back-button" onClick={handleBack}>&larr;</button>
                )}
                <h2>{step === 'phone' ? 'Введите номер телефона' : 'Введите код'}</h2>
                
                <div className={`auth-steps ${step === 'code' ? 'code-step' : ''}`}>
                    <div className="auth-step">
                        <form onSubmit={handlePhoneSubmit}>
                            <div className="form-group">
                                <div className="phone-input-container">
                                    <span className="phone-prefix">+7</span>
                                    <input
                                        ref={phoneInputRef}
                                        type="text"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="999 999 99 99"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            {error && <div className="error-message">{error}</div>}
                            <button 
                                type="submit" 
                                disabled={phone.replace(/\D/g, '').length !== 10 || isLoading}
                            >
                                {isLoading ? 'Отправка...' : 'Отправить'}
                            </button>
                        </form>
                    </div>

                    <div className="auth-step">
                        <form onSubmit={handleCodeSubmit}>
                            <div className="phone-display">
                                +7 {phone}
                            </div>
                            <div className="code-input-container">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={codeInputRefs[index]}
                                        type="text"
                                        className="code-input"
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                        maxLength="1"
                                        required
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>
                            {error && <div className="error-message">{error}</div>}
                            <button 
                                type="submit"
                                disabled={code.some(digit => !digit) || isLoading}
                            >
                                {isLoading ? 'Проверка...' : 'Войти'}
                            </button>
                            <div className="resend-code">
                                {resendTimer > 0 ? (
                                    <span>Отправить код повторно через {resendTimer} сек</span>
                                ) : (
                                    <button 
                                        type="button" 
                                        onClick={handleResendCode}
                                        className="resend-button"
                                    >
                                        Отправить код повторно
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal; 