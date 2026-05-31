import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleLabel = user?.role === 'PHARMACIST' ? '한약사' : '일반';

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button className="app-brand" onClick={() => navigate('/')}>
          한약 치험례 아카이브
        </button>
        <nav className="app-nav">
          {user && (
            <>
              <span className="app-user">
                {user.name}
                <span className="app-user-role">{roleLabel}</span>
              </span>
              {user.role === 'PHARMACIST' && (
                <button className="btn-ghost" onClick={() => navigate('/my')}>
                  내 글
                </button>
              )}
              <button className="btn-ghost" onClick={logout}>
                로그아웃
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
