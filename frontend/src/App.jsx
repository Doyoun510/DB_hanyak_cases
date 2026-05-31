import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Prescription from './pages/Prescription';
import PrescriptionNew from './pages/PrescriptionNew';
import MyCases from './pages/MyCases';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/my"
        element={
          <PrivateRoute>
            <MyCases />
          </PrivateRoute>
        }
      />
      <Route
        path="/prescriptions/new"
        element={
          <PrivateRoute>
            <PrescriptionNew />
          </PrivateRoute>
        }
      />
      <Route
        path="/prescriptions/:id"
        element={
          <PrivateRoute>
            <Prescription />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
