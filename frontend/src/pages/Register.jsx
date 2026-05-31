import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'USER',
  });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      setDone(true);
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1 style={{ textAlign: 'center', color: 'var(--primary-dark)', fontSize: 24, marginBottom: 24, letterSpacing: '-0.5px' }}>
        한약 치험례 아카이브
      </h1>
      <div className="card-static">
      <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>회원가입</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <input
          name="email"
          type="email"
          placeholder="이메일"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          name="name"
          type="text"
          placeholder="이름"
          value={form.name}
          onChange={handleChange}
          required
        />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="USER">일반사용자</option>
          <option value="PHARMACIST">한약사</option>
        </select>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        {done && <p style={{ color: 'green', margin: 0 }}>가입 완료! 로그인 페이지로 이동합니다.</p>}
        <button type="submit" className="btn-primary">가입하기</button>
        <Link to="/login" style={{ textAlign: 'center', fontSize: 13 }}>
          이미 계정이 있나요? 로그인
        </Link>
      </form>
      </div>
    </div>
  );
}
