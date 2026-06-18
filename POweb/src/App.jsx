import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import './App.css'

const DEFAULT_USERS = {
  '0900000000': { password: 'admin123', role: 'admin' },
}

const ORDERS_STORAGE_KEY = 'poweb-orders'
const USERS_STORAGE_KEY = 'poweb-users'

function formatDateKey(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}${month}${year}`
}

function exportExcel(entries) {
  const worksheet = XLSX.utils.json_to_sheet(
    entries.map((entry) => ({
      'Mã nhập': entry.entryCode,
      'Mã đơn hàng': entry.orderId,
      'Tên món': entry.itemName,
      'Số lượng': entry.quantity,
      'Giá tiền': entry.unitPrice,
      'Thành tiền': entry.quantity * entry.unitPrice,
      'Người tạo': entry.createdBy,
      'Ngày tạo': entry.createdAt,
    }))
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sach don hang')
  XLSX.writeFile(workbook, 'don-hang.xlsx')
}

function App() {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_USERS
  })
  const [currentUser, setCurrentUser] = useState(null)
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })
  const [form, setForm] = useState({
    orderId: '',
    itemName: '',
    quantity: 1,
    unitPrice: 0,
  })
  const [authForm, setAuthForm] = useState({ phone: '0900000000', password: 'admin123' })
  const [registerForm, setRegisterForm] = useState({ phone: '', password: '', confirmPassword: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const todayKey = useMemo(() => formatDateKey(new Date()), [])
  const nextEntryCode = `${todayKey}/T${entries.filter((entry) => entry.entryCode.startsWith(`${todayKey}/T`)).length + 1}`

  const hasUsedOneTimeSlot = currentUser?.role === 'user' && entries.some((entry) => entry.createdBy === currentUser.phone)

  const handleLogin = (event) => {
    event.preventDefault()

    const user = users[authForm.phone]
    if (!user || user.password !== authForm.password) {
      setMessage('Số điện thoại hoặc mật khẩu không đúng.')
      return
    }

    setCurrentUser({ phone: authForm.phone, role: user.role })
    setMessage(`Đăng nhập thành công với vai trò ${user.role === 'admin' ? 'Admin' : 'User thường'}.`)
  }

  const handleRegister = (event) => {
    event.preventDefault()

    const phone = registerForm.phone.trim()
    const password = registerForm.password
    const confirmPassword = registerForm.confirmPassword

    if (!phone || !password || !confirmPassword) {
      setMessage('Vui lòng điền đầy đủ số điện thoại và mật khẩu.')
      return
    }

    if (!/^\d{9,12}$/.test(phone)) {
      setMessage('Số điện thoại phải là dãy số 9-12 chữ số.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Mật khẩu và xác nhận mật khẩu phải trùng nhau.')
      return
    }

    if (users[phone]) {
      setMessage('Số điện thoại này đã được đăng ký.')
      return
    }

    setUsers((prev) => ({ ...prev, [phone]: { password, role: 'user' } }))
    setRegisterForm({ phone: '', password: '', confirmPassword: '' })
    setMessage('Đăng ký thành công. Vui lòng dùng số điện thoại và mật khẩu để đăng nhập.')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setMessage('Đã đăng xuất.')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!currentUser) {
      setMessage('Vui lòng đăng nhập trước khi tạo mã nhập.')
      return
    }

    if (currentUser.role === 'user' && hasUsedOneTimeSlot) {
      setMessage('Tài khoản user thường chỉ được tạo đúng 1 mã nhập duy nhất.')
      return
    }

    if (!form.orderId.trim() || !form.itemName.trim()) {
      setMessage('Vui lòng nhập mã đơn hàng và tên món hàng.')
      return
    }

    const newEntry = {
      id: crypto.randomUUID(),
      entryCode: nextEntryCode,
      orderId: form.orderId.trim(),
      itemName: form.itemName.trim(),
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
      createdBy: currentUser.phone,
      createdAt: new Date().toLocaleString('vi-VN'),
    }

    setEntries((prev) => [...prev, newEntry])
    setForm({ orderId: '', itemName: '', quantity: 1, unitPrice: 0 })
    setMessage(`Đã tạo mã nhập ${nextEntryCode}. Tệp Excel sẽ được tải xuống ngay.`)
    exportExcel([...entries, newEntry])
  }

  return (
    <main className="app-shell">
      <section className="panel hero-panel">
        <p className="eyebrow">Hệ thống quản lý đơn hàng</p>
        <h1>Quản lý mã nhập hàng và tải tệp Excel</h1>
        <p className="lead">
          Mỗi mã nhập được tạo theo định dạng DDMMYYYY/TX, tăng dần T1, T2, T3… và được lưu vào file Excel để tải xuống.
        </p>
      </section>

      <section className="panel grid-layout">
        <article className="card">
          <h2>Đăng ký tài khoản</h2>
          <form className="stack" onSubmit={handleRegister}>
            <label>
              Số điện thoại
              <input
                value={registerForm.phone}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="0901234567"
              />
            </label>
            <label>
              Mật khẩu
              <input
                type="password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </label>
            <label>
              Xác nhận mật khẩu
              <input
                type="password"
                value={registerForm.confirmPassword}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              />
            </label>
            <button type="submit" className="primary-btn">Đăng ký user thường</button>
          </form>
        </article>

        <article className="card">
          <h2>Đăng nhập</h2>
          {!currentUser ? (
            <form className="stack" onSubmit={handleLogin}>
              <label>
                Số điện thoại
                <input
                  value={authForm.phone}
                  onChange={(event) => setAuthForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="0901234567"
                />
              </label>
              <label>
                Mật khẩu
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
                />
              </label>
              <button type="submit" className="primary-btn">Đăng nhập</button>
            </form>
          ) : (
            <div className="stack">
              <p className="badge">Đang đăng nhập: <strong>{currentUser.phone}</strong> ({currentUser.role})</p>
              <button type="button" className="secondary-btn" onClick={handleLogout}>Đăng xuất</button>
            </div>
          )}

          <div className="note-box">
            <p><strong>Admin mẫu:</strong> 0900000000 / admin123</p>
            <p><strong>Người dùng:</strong> đăng ký bằng số điện thoại để tạo 1 lần duy nhất.</p>
          </div>
        </article>
      </section>

      <section className="panel grid-layout">
        <article className="card">
          <h2>Tạo mã nhập hàng</h2>
          <p className="hint">Mã nhập được tạo tự động: <strong>{nextEntryCode}</strong></p>
          <form className="stack" onSubmit={handleSubmit}>
            <label>
              Mã đơn hàng
              <input value={form.orderId} onChange={(event) => setForm((prev) => ({ ...prev, orderId: event.target.value }))} placeholder="ORD-001" />
            </label>
            <label>
              Tên món hàng
              <input value={form.itemName} onChange={(event) => setForm((prev) => ({ ...prev, itemName: event.target.value }))} placeholder="Gạo, mì, nước ngọt" />
            </label>
            <label>
              Số lượng
              <input type="number" min="1" value={form.quantity} onChange={(event) => setForm((prev) => ({ ...prev, quantity: Number(event.target.value) || 1 }))} />
            </label>
            <label>
              Giá tiền mỗi món
              <input type="number" min="0" step="1000" value={form.unitPrice} onChange={(event) => setForm((prev) => ({ ...prev, unitPrice: Number(event.target.value) || 0 }))} />
            </label>
            <button type="submit" className="primary-btn" disabled={currentUser?.role === 'user' && hasUsedOneTimeSlot}>
              {currentUser?.role === 'user' && hasUsedOneTimeSlot ? 'Đã dùng tối đa 1 lần' : 'Tạo mã nhập và tải Excel'}
            </button>
          </form>
          <button type="button" className="secondary-btn" onClick={() => exportExcel(entries)} disabled={entries.length === 0}>Tải sheet Excel hiện tại</button>
        </article>

        <article className="card">
          <h2>Trạng thái</h2>
          <p className="message">{message || 'Đăng ký và đăng nhập bằng số điện thoại để tạo mã nhập hàng.'}</p>
          <p className="hint">Tài khoản user thường chỉ được tạo 1 lần duy nhất. Admin có thể tạo nhiều lần và tải lại Excel bất kỳ lúc nào.</p>
        </article>
      </section>

      <section className="panel card">
        <h2>Danh sách mã nhập đã tạo</h2>
        {entries.length === 0 ? (
          <p className="empty-state">Chưa có dữ liệu nhập hàng.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã nhập</th>
                <th>Mã đơn hàng</th>
                <th>Tên món</th>
                <th>SL</th>
                <th>Giá</th>
                <th>Thành tiền</th>
                <th>Người tạo</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.entryCode}</td>
                  <td>{entry.orderId}</td>
                  <td>{entry.itemName}</td>
                  <td>{entry.quantity}</td>
                  <td>{entry.unitPrice.toLocaleString('vi-VN')}đ</td>
                  <td>{(entry.quantity * entry.unitPrice).toLocaleString('vi-VN')}đ</td>
                  <td>{entry.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}

export default App
