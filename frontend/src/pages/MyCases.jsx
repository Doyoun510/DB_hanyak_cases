import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import Header from '../components/Header';
import { categoryClass } from '../constants/categories';

export default function MyCases() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/cases?authorId=${user.id}`)
      .then(setCases)
      .catch(console.error);
  }, [user]);

  return (
    <>
    <Header />
    <div style={{ maxWidth: 960, margin: '32px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>내가 쓴 치험례 ({cases.length})</h2>
        <button onClick={() => navigate('/')} className="btn-ghost">← 목록</button>
      </div>

      {cases.length === 0 ? (
        <div className="card-static" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px' }}>
          아직 작성한 치험례가 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cases.map((c) => (
            <div
              key={c.id}
              className="card"
              onClick={() => navigate(`/prescriptions/${c.prescription.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <strong style={{ fontSize: 15 }}>{c.title}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={categoryClass(c.prescription.category)}>{c.prescription.category}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.prescription.name}</span>
                </div>
              </div>
              {c.content && (
                <p style={{ margin: '8px 0 4px', color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontSize: 13 }}>
                  {c.content.length > 80 ? c.content.slice(0, 80) + '...' : c.content}
                </p>
              )}
              <span style={{ fontSize: 12, color: '#9aa6a2' }}>
                {new Date(c.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
