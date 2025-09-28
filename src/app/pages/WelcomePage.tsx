import React from 'react';

const WelcomePage: React.FC = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100" dir="rtl" style={{ fontFamily: 'sans' }}>
      <div className="text-center">
        <h1 className="text-dark fw-bold mb-5">به سامانه نوآوری خوش آمدید</h1>
        <p className="text-gray-600 fs-4">لطفاً از منوی سمت راست برای دسترسی به بخش‌های مختلف استفاده کنید</p>
      </div>
    </div>
  );
};

export default WelcomePage; 