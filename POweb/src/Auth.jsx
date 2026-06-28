import { useEffect, useState } from 'react';
import './Auth.css';

const API_URL = '/api/auth';

function getViewFromHash() {
  return window.location.hash === '#register' ? 'register' : 'login';
}

function setViewHash(view) {
  window.location.hash = view === 'register' ? '#register' : '#login';
}

function AuthForm({ mode, onSwitch }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const title = mode === 'register' ? '📝 Đăng ký tài khoản' : '🔐 Đăng nhập';
  const submitLabel = mode === 'register' ? 'Đăng ký' : 'Đăng nhập';
  const switchText = mode === 'register' ? 'Đã có tài khoản?' : 'Chưa có tài khoản?';
  const switchLabel = mode === 'register' ? 'Đăng nhập ngay' : 'Đăng ký ngay';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'register' ? `${API_URL}/register` : `${API_URL}/login`;
      const payload = { phoneNumber, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        localStorage.setItem('user', JSON.stringify(data.data));
        window.location.reload();
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối tới server. Hãy kiểm tra backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>{title}</h1>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              id="phone"
              type="tel"
              placeholder="0912345678"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              required
              pattern="[0-9]{10,11}"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength="6"
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength="6"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Đang xử lý...' : submitLabel}
          </button>
        </form>

        <div className="toggle-auth">
          <p>
            {switchText}{' '}
            <button type="button" onClick={() => onSwitch(mode === 'register' ? 'login' : 'register')} className="link-btn">
              {switchLabel}
            </button>
          </p>
        </div>

        <div className="info-box">
          <h3>ℹ️ Thông tin bảo mật</h3>
          <ul>
            <li>✅ Mật khẩu được mã hóa với bcrypt</li>
            <li>✅ Không lưu mật khẩu dạng plaintext</li>
            <li>✅ Số điện thoại được xác thực</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  const [view, setView] = useState(() => getViewFromHash());
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const handleHashChange = () => setView(getViewFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSwitch = (nextView) => {
    setView(nextView);
    setViewHash(nextView);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
    setViewHash('login');
  };

  if (user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>✅ Đăng nhập thành công</h2>
          <div className="user-info">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Số điện thoại:</strong> {user.phoneNumber}</p>
            {user.createdAt && <p><strong>Ngày tạo:</strong> {new Date(user.createdAt).toLocaleString('vi-VN')}</p>}
          </div>
          <button onClick={handleLogout} className="btn btn-logout">Đăng xuất</button>
        </div>
      </div>
    );
  }

  return <AuthForm mode={view} onSwitch={handleSwitch} />;
}
