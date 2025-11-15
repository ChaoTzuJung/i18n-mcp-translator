/**
 * 儀表板元件範例
 *
 * 這個檔案包含複雜的 UI 結構，包括：
 * - 標題和描述
 * - 統計卡片
 * - 表格
 * - 通知訊息
 * - 操作按鈕
 *
 * 用於測試 i18n MCP 翻譯器處理大型、複雜元件的能力
 */

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendValue?: string;
}

function StatCard({ title, value, trend, trendValue }: StatCardProps) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <div className="value">{value}</div>
      {trend && trendValue && (
        <div className={`trend ${trend}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </div>
      )}
    </div>
  );
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export function Dashboard() {
  const users: User[] = [
    { id: 1, name: '王小明', email: 'wang@example.com', role: '管理員', status: 'active', lastLogin: '2024-01-15' },
    { id: 2, name: '李小華', email: 'lee@example.com', role: '編輯者', status: 'active', lastLogin: '2024-01-14' },
    { id: 3, name: '陳大文', email: 'chen@example.com', role: '檢視者', status: 'inactive', lastLogin: '2024-01-10' },
  ];

  const handleExport = () => {
    alert('開始匯出資料...');
  };

  const handleRefresh = () => {
    alert('重新整理資料...');
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>系統管理儀表板</h1>
          <p className="subtitle">歡迎回來！以下是您的系統概況</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleRefresh}>
            重新整理
          </button>
          <button className="btn-primary" onClick={handleExport}>
            匯出資料
          </button>
        </div>
      </header>

      {/* Statistics */}
      <section className="stats-section">
        <h2>統計資訊</h2>
        <div className="stats-grid">
          <StatCard
            title="總用戶數"
            value="1,234"
            trend="up"
            trendValue="12% 比上週"
          />
          <StatCard
            title="活躍用戶"
            value="856"
            trend="up"
            trendValue="8% 比上週"
          />
          <StatCard
            title="新註冊"
            value="45"
            trend="down"
            trendValue="3% 比上週"
          />
          <StatCard
            title="系統負載"
            value="65%"
            trend="down"
            trendValue="正常"
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="notifications-section">
        <div className="notification info">
          <strong>提示：</strong>系統將於明天凌晨 2:00 進行維護，預計需要 1 小時。
        </div>
        <div className="notification warning">
          <strong>警告：</strong>您有 3 個待處理的審核請求。
        </div>
        <div className="notification success">
          <strong>成功：</strong>資料備份已完成。
        </div>
      </section>

      {/* User Table */}
      <section className="users-section">
        <div className="section-header">
          <h2>使用者列表</h2>
          <div className="section-actions">
            <input
              type="search"
              placeholder="搜尋使用者..."
              className="search-input"
            />
            <button className="btn-primary">
              新增使用者
            </button>
          </div>
        </div>

        <table className="users-table">
          <thead>
            <tr>
              <th>編號</th>
              <th>姓名</th>
              <th>電子郵件</th>
              <th>角色</th>
              <th>狀態</th>
              <th>最後登入</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status ${user.status}`}>
                    {user.status === 'active' ? '啟用' : '停用'}
                  </span>
                </td>
                <td>{user.lastLogin}</td>
                <td>
                  <button className="btn-small">編輯</button>
                  <button className="btn-small btn-danger">刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <div className="pagination-info">
            顯示 1-3 筆，共 3 筆資料
          </div>
          <div className="pagination">
            <button disabled>上一頁</button>
            <button className="active">1</button>
            <button disabled>下一頁</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>最後更新時間：2024-01-15 14:30:00</p>
        <p>如有問題，請聯繫系統管理員</p>
      </footer>
    </div>
  );
}
