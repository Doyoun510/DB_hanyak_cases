// 배포 시: VITE_API_URL 환경변수 (예: https://xxx.onrender.com/api)
// 로컬 개발: Vite proxy로 '/api' → http://backend:4000
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const request = async (path, options = {}) => {
  const token = sessionStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) =>
    request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
