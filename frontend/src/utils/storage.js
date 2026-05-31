// localStorage / sessionStorage 통합 헬퍼

const RECENT_KEY = 'recentPrescriptions';
const FAV_KEY = 'favoritePrescriptions';
const HISTORY_KEY = 'searchHistory';
const DRAFT_PREFIX = 'caseDraft:';

const MAX_RECENT = 5;
const MAX_HISTORY = 10;

const readArr = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const writeArr = (key, arr) => {
  localStorage.setItem(key, JSON.stringify(arr));
};

// 최근 본 처방 — 객체 배열 {id, name, category}
export const getRecent = () => readArr(RECENT_KEY);

export const pushRecent = (p) => {
  const list = readArr(RECENT_KEY).filter((x) => x.id !== p.id);
  list.unshift({ id: p.id, name: p.name, category: p.category });
  writeArr(RECENT_KEY, list.slice(0, MAX_RECENT));
};

// 즐겨찾기 — id 배열
export const getFavorites = () => readArr(FAV_KEY);

export const isFavorite = (id) => readArr(FAV_KEY).includes(id);

export const toggleFavorite = (id) => {
  const list = readArr(FAV_KEY);
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  writeArr(FAV_KEY, next);
  return next.includes(id);
};

// 검색 히스토리 — 문자열 배열
export const getSearchHistory = () => readArr(HISTORY_KEY);

export const pushSearchHistory = (keyword) => {
  const k = keyword.trim();
  if (!k) return;
  const list = readArr(HISTORY_KEY).filter((x) => x !== k);
  list.unshift(k);
  writeArr(HISTORY_KEY, list.slice(0, MAX_HISTORY));
};

export const clearSearchHistory = () => writeArr(HISTORY_KEY, []);

// 치험례 작성 임시저장 (sessionStorage) — 처방 id별로 저장
const draftKey = (prescriptionId) => `${DRAFT_PREFIX}${prescriptionId}`;

export const getCaseDraft = (prescriptionId) => {
  try {
    return JSON.parse(sessionStorage.getItem(draftKey(prescriptionId))) || null;
  } catch {
    return null;
  }
};

export const saveCaseDraft = (prescriptionId, draft) => {
  sessionStorage.setItem(draftKey(prescriptionId), JSON.stringify(draft));
};

export const clearCaseDraft = (prescriptionId) => {
  sessionStorage.removeItem(draftKey(prescriptionId));
};
