/**
 * 簡單的按鈕元件範例
 *
 * 這個檔案包含基本的硬編碼中文文字，用於測試 i18n MCP 翻譯器
 */

import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, variant = 'primary' }: ButtonProps) {
  return (
    <div className="button-container">
      <button
        className={`btn btn-${variant}`}
        onClick={onClick}
      >
        儲存變更
      </button>
      <button
        className="btn btn-secondary"
        onClick={onClick}
      >
        取消
      </button>
      <button
        className="btn btn-danger"
        onClick={onClick}
      >
        刪除
      </button>
    </div>
  );
}

export function ConfirmButton({ onConfirm }: { onConfirm: () => void }) {
  const handleClick = () => {
    if (window.confirm('確定要執行此操作嗎？')) {
      onConfirm();
    }
  };

  return (
    <button onClick={handleClick}>
      確認送出
    </button>
  );
}
