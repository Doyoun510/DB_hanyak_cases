import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

import { CATEGORIES } from '../constants/categories';
import Header from '../components/Header';

export default function PrescriptionNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    category: CATEGORIES[0],
    ingredients: '',
    efficacy: '',
    description: '',
  });
  const [error, setError] = useState('');

  if (user?.role !== 'PHARMACIST') {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 16px' }}>
        <p>한약사만 처방을 등록할 수 있습니다.</p>
        <button onClick={() => navigate('/')}>목록으로</button>
      </div>
    );
  }

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const created = await api.post('/prescriptions', form);
      navigate(`/prescriptions/${created.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
    <Header />
    <div style={{ maxWidth: 640, margin: '32px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>처방 등록</h2>
        <button onClick={() => navigate('/')} className="btn-ghost">← 목록</button>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}
      >
        <label>
          처방명
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }}
          />
        </label>
        <label>
          분류
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          대표 약재 (콤마로 구분)
          <input
            name="ingredients"
            value={form.ingredients}
            onChange={handleChange}
            placeholder="예: 황기, 인삼, 백출, 감초"
            style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }}
          />
        </label>
        <label>
          효능
          <textarea
            name="efficacy"
            value={form.efficacy}
            onChange={handleChange}
            placeholder="예: 비위 기허로 인한 피로·식욕부진 개선"
            rows={3}
            style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }}
          />
        </label>
        <label>
          출전·기타 설명 (선택)
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }}
          />
        </label>
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <button type="submit" className="btn-primary">등록</button>
      </form>
    </div>
    </>
  );
}
