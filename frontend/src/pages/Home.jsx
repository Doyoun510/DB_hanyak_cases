import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import Header from '../components/Header';
import { categoryClass } from '../constants/categories';
import {
  getRecent,
  getFavorites,
  toggleFavorite,
  getSearchHistory,
  pushSearchHistory,
  clearSearchHistory,
} from '../utils/storage';

import { CATEGORIES_WITH_ALL as CATEGORIES } from '../constants/categories';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [category, setCategory] = useState('전체');
  const [sortAZ, setSortAZ] = useState(false);
  const [showOnlyFav, setShowOnlyFav] = useState(false);

  const [recent, setRecent] = useState(getRecent());
  const [favorites, setFavorites] = useState(getFavorites());
  const [history, setHistory] = useState(getSearchHistory());
  const [showHistory, setShowHistory] = useState(false);

  // 백엔드 검색: submittedKeyword가 변할 때만 fetch
  useEffect(() => {
    const qs = submittedKeyword
      ? `?keyword=${encodeURIComponent(submittedKeyword)}`
      : '';
    api.get(`/prescriptions${qs}`).then(setPrescriptions).catch(console.error);
  }, [submittedKeyword]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const k = search.trim();
    setSubmittedKeyword(k);
    if (k) {
      pushSearchHistory(k);
      setHistory(getSearchHistory());
    }
    setShowHistory(false);
  };

  const applyHistory = (k) => {
    setSearch(k);
    setSubmittedKeyword(k);
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  const handleToggleFav = (e, id) => {
    e.stopPropagation();
    toggleFavorite(id);
    setFavorites(getFavorites());
  };

  const filtered = useMemo(() => {
    let list = prescriptions;
    if (category !== '전체') list = list.filter((p) => p.category === category);
    if (showOnlyFav) list = list.filter((p) => favorites.includes(p.id));
    if (sortAZ) list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    return list;
  }, [prescriptions, category, sortAZ, showOnlyFav, favorites]);

  return (
    <>
    <Header />
    <div style={{ maxWidth: 960, margin: '32px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.5px' }}>처방 목록</h2>
        {user?.role === 'PHARMACIST' && (
          <button onClick={() => navigate('/prescriptions/new')} className="btn-primary">+ 처방 등록</button>
        )}
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: 12 }}>
        <input
          type="text"
          placeholder="처방명 검색 후 엔터..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 150)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
        {showHistory && history.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 4,
              zIndex: 10,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontSize: 12, color: '#888', borderBottom: '1px solid #eee' }}>
              <span>최근 검색어</span>
              <button type="button" onClick={handleClearHistory} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>전체 삭제</button>
            </div>
            {history.map((k) => (
              <div
                key={k}
                onMouseDown={() => applyHistory(k)}
                style={{ padding: '8px 10px', cursor: 'pointer' }}
              >
                {k}
              </div>
            ))}
          </div>
        )}
      </form>

      {/* 최근 본 처방 */}
      {recent.length > 0 && !submittedKeyword && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>최근 본 처방</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {recent.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/prescriptions/${r.id}`)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 14,
                  border: '1px solid #ddd',
                  background: '#fafafa',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 카테고리 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              border: '1px solid #ccc',
              background: category === cat ? '#333' : '#fff',
              color: category === cat ? '#fff' : '#333',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setShowOnlyFav((v) => !v)}
          style={{
            padding: '4px 12px',
            borderRadius: 20,
            border: '1px solid #ccc',
            background: showOnlyFav ? '#f5a623' : '#fff',
            color: showOnlyFav ? '#fff' : '#333',
            cursor: 'pointer',
          }}
        >
          ★ 즐겨찾기
        </button>
        <button
          onClick={() => setSortAZ((v) => !v)}
          style={{
            marginLeft: 'auto',
            padding: '4px 12px',
            borderRadius: 20,
            border: '1px solid #ccc',
            background: sortAZ ? '#333' : '#fff',
            color: sortAZ ? '#fff' : '#333',
            cursor: 'pointer',
          }}
        >
          가나다순
        </button>
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="card-static" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px' }}>
          처방이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {filtered.map((p) => {
            const fav = favorites.includes(p.id);
            return (
              <div
                key={p.id}
                className="card"
                onClick={() => navigate(`/prescriptions/${p.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{p.name}</div>
                    <span className={categoryClass(p.category)}>{p.category}</span>
                  </div>
                  <button
                    onClick={(e) => handleToggleFav(e, p.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: fav ? '#f5a623' : '#ccc',
                      padding: 0,
                    }}
                    title={fav ? '즐겨찾기 해제' : '즐겨찾기'}
                  >
                    ★
                  </button>
                </div>
                {p.efficacy && (
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.efficacy}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
