import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

interface SimpleCaptchaProps {
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
}

export const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({ onChange, error, touched }) => {
  const [captchaValue, setCaptchaValue] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  const generateRandomChar = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  const generateCaptcha = () => {
    // Generate a random 6-character string with mix of letters and numbers
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += generateRandomChar();
    }
    setCaptchaValue(captcha);
    setUserInput('');
    setIsValid(false);
    onChange('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setUserInput(value);
    console.log(value, captchaValue);
    // Compare case-insensitively
    if (value === captchaValue) {
      setIsValid(true);
      onChange(captchaValue); // Pass the original captcha value
    } else {
      setIsValid(false);
      onChange('');
    }
  };

  // Function to generate random rotation for each character
  const getRandomRotation = () => {
    return Math.floor(Math.random() * 30) - 15; // Random rotation between -15 and 15 degrees
  };

  return (
    <div className="captcha-container" dir='ltr'>
      <div className="d-flex align-items-center me-3">
        <div 
          className="captcha-display bg-light-primary p-3 rounded me-3 position-relative my-2"
          style={{ 
            fontFamily: 'monospace', 
            fontSize: '1.5rem',
            letterSpacing: '3px',
            userSelect: 'none',
            minWidth: '180px',
            textAlign: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Background noise lines */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `${Math.random() * 100}%`,
                left: '0',
                width: '100%',
                height: '1px',
                backgroundColor: 'rgba(0,0,0,0.1)',
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
          
          {/* CAPTCHA characters */}
          {captchaValue.split('').map((char, index) => (
            <span
              key={index}
              style={{
                display: 'inline-block',
                transform: `rotate(${getRandomRotation()}deg)`,
                margin: '0 2px',
                color: `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`
              }}
            >
              {char}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-icon btn-light-primary btn-sm"
          onClick={generateCaptcha}
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      
      <div className="captcha-input">
        <input
          type="text"
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid': touched && error,
              'is-valid': isValid
            }
          )}
          placeholder="کد امنیتی را وارد کنید"
          value={userInput}
          onChange={handleInputChange}
          maxLength={6}
          style={{ textAlign: 'left', direction: 'ltr' }}
        />
        {touched && error && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 