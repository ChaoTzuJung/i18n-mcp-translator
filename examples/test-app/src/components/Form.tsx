/**
 * 表單元件範例
 *
 * 這個檔案包含表單欄位、標籤、placeholder 等多種類型的中文文字
 * 用於測試 i18n MCP 翻譯器處理複雜表單的能力
 */

import React, { useState } from 'react';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.username) {
      newErrors.username = '請輸入使用者名稱';
    }

    if (!formData.email) {
      newErrors.email = '請輸入電子郵件';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '電子郵件格式不正確';
    }

    if (!formData.password) {
      newErrors.password = '請輸入密碼';
    } else if (formData.password.length < 8) {
      newErrors.password = '密碼長度至少需要 8 個字元';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '密碼不一致';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = '請同意服務條款';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('註冊成功！');
    }
  };

  return (
    <div className="registration-form">
      <h2>會員註冊</h2>
      <p className="subtitle">填寫以下資訊完成註冊</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">使用者名稱</label>
          <input
            id="username"
            type="text"
            placeholder="請輸入使用者名稱"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          {errors.username && <span className="error">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">電子郵件</label>
          <input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">密碼</label>
          <input
            id="password"
            type="password"
            placeholder="請輸入密碼（至少 8 個字元）"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">確認密碼</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="請再次輸入密碼"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
            />
            我同意服務條款與隱私權政策
          </label>
          {errors.agreeToTerms && <span className="error">{errors.agreeToTerms}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            立即註冊
          </button>
          <button type="button" className="btn-secondary">
            重設表單
          </button>
        </div>
      </form>

      <div className="form-footer">
        <p>已經有帳號了？<a href="/login">立即登入</a></p>
      </div>
    </div>
  );
}
