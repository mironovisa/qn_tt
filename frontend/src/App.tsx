import { useState } from 'react';
import { AuthProvider, useAuth } from './useAuth';
import { Login } from './Login';
import { Dashboard } from './Dashboard';
import './styles.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <Login
        isRegister={isRegister}
        onToggleMode={() => setIsRegister(!isRegister)}
      />
    );
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
