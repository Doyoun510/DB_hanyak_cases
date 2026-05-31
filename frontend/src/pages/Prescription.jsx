import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { pushRecent, getCaseDraft, saveCaseDraft, clearCaseDraft } from '../utils/storage';
import Header from '../components/Header';
import { categoryClass } from '../constants/categories';

export default function Prescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [prescription, setPrescription] = useState(null);
  const [cases, setCases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const emptyCaseForm = {
    title: '',
    patientAge: '',
    patientGender: '남',
    patientWeight: '',
    chiefComplaint: '',
    diagnosis: '',
    treatment: '',
    progress: '',
    content: '',
  };
  const [form, setForm] = useState(emptyCaseForm);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editPx, setEditPx] = useState(false);
  const [pxForm, setPxForm] = useState({ name: '', category: '', ingredients: '', efficacy: '', description: '' });

  useEffect(() => {
    api.get(`/prescriptions/${id}`).then((p) => {
      setPrescription(p);
      pushRecent(p); // 최근 본 처방 기록
    }).catch(console.error);
    api.get(`/cases?prescriptionId=${id}`).then(setCases).catch(console.error);

    // 작성 중이던 임시저장 복원
    const draft = getCaseDraft(id);
    if (draft) {
      setForm(draft);
      setShowForm(true);
    }
  }, [id]);

  // form 변경 시 임시저장 (작성 폼이 열려있고 내용이 있을 때만)
  useEffect(() => {
    if (showForm && (form.title || form.content)) {
      saveCaseDraft(id, form);
    }
  }, [form, showForm, id]);

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const newCase = await api.post('/cases', { ...form, prescriptionId: id });
      setCases((prev) => [newCase, ...prev]);
      setForm(emptyCaseForm);
      setShowForm(false);
      clearCaseDraft(id);
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditPx = () => {
    setPxForm({
      name: prescription.name,
      category: prescription.category,
      ingredients: prescription.ingredients || '',
      efficacy: prescription.efficacy || '',
      description: prescription.description || '',
    });
    setEditPx(true);
  };

  const handlePxEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.put(`/prescriptions/${id}`, pxForm);
      setPrescription(updated);
      setEditPx(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePxDelete = async () => {
    if (!window.confirm('이 처방과 관련 치험례를 모두 삭제합니다. 계속하시겠습니까?')) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditForm({
      title: c.title || '',
      patientAge: c.patientAge ?? '',
      patientGender: c.patientGender || '남',
      patientWeight: c.patientWeight ?? '',
      chiefComplaint: c.chiefComplaint || '',
      diagnosis: c.diagnosis || '',
      treatment: c.treatment || '',
      progress: c.progress || '',
      content: c.content || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.put(`/cases/${editingId}`, editForm);
      setCases((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...updated } : c))
      );
      cancelEdit();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (caseId) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await api.delete(`/cases/${caseId}`);
      setCases((prev) => prev.filter((c) => c.id !== caseId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!prescription) return <p style={{ padding: 40 }}>불러오는 중...</p>;

  const isPharmacist = user?.role === 'PHARMACIST';

  return (
    <>
    <Header />
    <div style={{ maxWidth: 960, margin: '32px auto', padding: '0 20px' }}>
      <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 16 }}>
        ← 뒤로
      </button>

      {/* 처방 상세 */}
      <section style={{ marginBottom: 32 }}>
        {editPx ? (
          <form onSubmit={handlePxEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              value={pxForm.name}
              onChange={(e) => setPxForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="처방명"
              required
            />
            <input
              value={pxForm.category}
              onChange={(e) => setPxForm((p) => ({ ...p, category: e.target.value }))}
              placeholder="분류"
              required
            />
            <input
              value={pxForm.ingredients}
              onChange={(e) => setPxForm((p) => ({ ...p, ingredients: e.target.value }))}
              placeholder="대표 약재 (콤마로 구분)"
            />
            <textarea
              value={pxForm.efficacy}
              onChange={(e) => setPxForm((p) => ({ ...p, efficacy: e.target.value }))}
              placeholder="효능"
              rows={3}
              style={{ resize: 'vertical' }}
            />
            <textarea
              value={pxForm.description}
              onChange={(e) => setPxForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="출전·기타 설명"
              rows={3}
              style={{ resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit">저장</button>
              <button type="button" onClick={() => setEditPx(false)}>취소</button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ margin: '0 0 4px' }}>{prescription.name}</h2>
              {isPharmacist && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={startEditPx} className="btn-ghost">처방 수정</button>
                  <button onClick={handlePxDelete} className="btn-danger">처방 삭제</button>
                </div>
              )}
            </div>
            <span className={categoryClass(prescription.category)} style={{ marginBottom: 12 }}>
              {prescription.category}
            </span>
            {prescription.ingredients && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>대표 약재</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {prescription.ingredients.split(',').map((h) => (
                    <span key={h} style={{ padding: '3px 10px', borderRadius: 12, background: '#eef4ff', color: '#2563eb', fontSize: 13 }}>
                      {h.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {prescription.efficacy && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>효능</div>
                <p style={{ margin: 0, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{prescription.efficacy}</p>
              </div>
            )}
            {prescription.description && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>출전·설명</div>
                <p style={{ margin: 0, color: '#666', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{prescription.description}</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* 치험례 목록 */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>치험례 ({cases.length})</h3>
          {isPharmacist && (
            <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
              {showForm ? '취소' : '+ 치험례 등록'}
            </button>
          )}
        </div>

        {/* 등록 폼 */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: 20,
              padding: 16,
              border: '1px solid #ddd',
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 12, color: '#888' }}>
              작성 내용은 자동으로 임시저장됩니다 (브라우저 탭 유지 시)
            </span>
            <input
              name="title"
              placeholder="치험례 제목"
              value={form.title}
              onChange={handleFormChange}
              required
            />

            <fieldset style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12 }}>
              <legend style={{ fontSize: 13, color: '#666' }}>환자 정보</legend>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <input name="patientAge" type="number" placeholder="나이" value={form.patientAge} onChange={handleFormChange} />
                <select name="patientGender" value={form.patientGender} onChange={handleFormChange}>
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
                <input name="patientWeight" type="number" step="0.1" placeholder="몸무게(kg)" value={form.patientWeight} onChange={handleFormChange} />
              </div>
              <input
                name="chiefComplaint"
                placeholder="주소(主訴) - 환자가 호소하는 증상"
                value={form.chiefComplaint}
                onChange={handleFormChange}
                style={{ width: '100%', marginTop: 8, boxSizing: 'border-box' }}
              />
              <input
                name="diagnosis"
                placeholder="질환 / 변증"
                value={form.diagnosis}
                onChange={handleFormChange}
                style={{ width: '100%', marginTop: 8, boxSizing: 'border-box' }}
              />
            </fieldset>

            <textarea
              name="treatment"
              placeholder="처방 내용 (구성·용량·복용법)"
              value={form.treatment}
              onChange={handleFormChange}
              rows={3}
              style={{ resize: 'vertical' }}
            />
            <textarea
              name="progress"
              placeholder="경과별 변화 (날짜순 기재)&#10;예: 1주차: ...&#10;     2주차: ..."
              value={form.progress}
              onChange={handleFormChange}
              rows={5}
              style={{ resize: 'vertical' }}
            />
            <textarea
              name="content"
              placeholder="요약·메모 (선택)"
              value={form.content}
              onChange={handleFormChange}
              rows={2}
              style={{ resize: 'vertical' }}
            />
            {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
            <button type="submit" className="btn-primary">등록</button>
          </form>
        )}

        {cases.length === 0 ? (
          <p style={{ color: '#888' }}>등록된 치험례가 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {cases.map((c) => (
              <li
                key={c.id}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #eee',
                }}
              >
                {editingId === c.id && editForm ? (
                  <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="치험례 제목"
                      required
                    />
                    <fieldset style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12 }}>
                      <legend style={{ fontSize: 13, color: '#666' }}>환자 정보</legend>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <input type="number" placeholder="나이" value={editForm.patientAge} onChange={(e) => setEditForm((p) => ({ ...p, patientAge: e.target.value }))} />
                        <select value={editForm.patientGender} onChange={(e) => setEditForm((p) => ({ ...p, patientGender: e.target.value }))}>
                          <option value="남">남</option>
                          <option value="여">여</option>
                        </select>
                        <input type="number" step="0.1" placeholder="몸무게(kg)" value={editForm.patientWeight} onChange={(e) => setEditForm((p) => ({ ...p, patientWeight: e.target.value }))} />
                      </div>
                      <input placeholder="주소(主訴)" value={editForm.chiefComplaint} onChange={(e) => setEditForm((p) => ({ ...p, chiefComplaint: e.target.value }))} style={{ width: '100%', marginTop: 8, boxSizing: 'border-box' }} />
                      <input placeholder="질환 / 변증" value={editForm.diagnosis} onChange={(e) => setEditForm((p) => ({ ...p, diagnosis: e.target.value }))} style={{ width: '100%', marginTop: 8, boxSizing: 'border-box' }} />
                    </fieldset>
                    <textarea placeholder="처방 내용" value={editForm.treatment} onChange={(e) => setEditForm((p) => ({ ...p, treatment: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
                    <textarea placeholder="경과별 변화" value={editForm.progress} onChange={(e) => setEditForm((p) => ({ ...p, progress: e.target.value }))} rows={5} style={{ resize: 'vertical' }} />
                    <textarea placeholder="요약·메모" value={editForm.content} onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))} rows={2} style={{ resize: 'vertical' }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit">저장</button>
                      <button type="button" onClick={cancelEdit}>취소</button>
                    </div>
                  </form>
                ) : (
                <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong>{c.title}</strong>
                  {isPharmacist && c.author?.id === user?.id && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => startEdit(c)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0066cc' }}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
                {/* 환자 요약 칩 */}
                {(c.patientAge || c.patientGender || c.patientWeight) && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
                    {c.patientAge != null && (
                      <span style={{ padding: '2px 8px', borderRadius: 10, background: '#f0f4f8', fontSize: 12, color: '#475569' }}>{c.patientAge}세</span>
                    )}
                    {c.patientGender && (
                      <span style={{ padding: '2px 8px', borderRadius: 10, background: '#f0f4f8', fontSize: 12, color: '#475569' }}>{c.patientGender}</span>
                    )}
                    {c.patientWeight != null && (
                      <span style={{ padding: '2px 8px', borderRadius: 10, background: '#f0f4f8', fontSize: 12, color: '#475569' }}>{c.patientWeight}kg</span>
                    )}
                    {c.diagnosis && (
                      <span style={{ padding: '2px 8px', borderRadius: 10, background: '#fef3c7', fontSize: 12, color: '#92400e' }}>{c.diagnosis}</span>
                    )}
                  </div>
                )}

                {c.chiefComplaint && (
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: '#888' }}>주소: </span>
                    <span style={{ fontSize: 14, color: '#333' }}>{c.chiefComplaint}</span>
                  </div>
                )}
                {c.treatment && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>처방</div>
                    <p style={{ margin: 0, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.treatment}</p>
                  </div>
                )}
                {c.progress && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>경과</div>
                    <p style={{ margin: 0, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.progress}</p>
                  </div>
                )}
                {c.content && (
                  <p style={{ margin: '8px 0 4px', color: '#666', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontSize: 13 }}>
                    {c.content}
                  </p>
                )}
                <span style={{ fontSize: 12, color: '#aaa', display: 'block', marginTop: 8 }}>
                  {c.author?.name} · {new Date(c.createdAt).toLocaleDateString('ko-KR')}
                </span>
                </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
    </>
  );
}
