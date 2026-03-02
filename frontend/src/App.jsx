import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import api from './utils/api';
import { ToastProvider, useToast } from './components/Toast';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AssessmentInterface from './components/AssessmentInterface';
import LessonCreate from './components/LessonCreate';
import Library from './components/Library';
import CoachingPage from './components/CoachingPage';
import LandingPage from './components/LandingPage';
import ProfileSettings from './components/ProfileSettings';
import PlacementTest from './components/PlacementTest';
import UserManagement from './components/UserManagement';
import Reports from './components/Reports';
import PaymentGateway from './components/PaymentGateway';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import UniversalStudyArea from './components/UniversalStudyArea/UniversalStudyArea';

// ── Auth Helpers ──────────────────────────────────────────────────────────
function getStoredUser() {
  try {
    const saved = localStorage.getItem('simplish_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// ── Protected App Shell ──────────────────────────────────────────────────
function AppShell() {
  const [user, setUser] = useState(() => getStoredUser());
  const [selectedLesson, setSelectedLesson] = useState(() => {
    try {
      const saved = localStorage.getItem('simplish_active_lesson');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const showToast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthSuccess = (userData, token) => {
    const normalized = { ...userData, role: userData?.role?.toLowerCase() };
    const userWithAuth = { ...normalized, isLoggedIn: true, token };
    localStorage.setItem('simplish_user', JSON.stringify(userWithAuth));
    localStorage.setItem('simplish_token', token);
    setUser(userWithAuth);

    if (!userWithAuth.onboarding_completed) {
      navigate('/placement');
    } else {
      navigate('/');
    }
  };

  // ── Sync Profile on Load ────────────────────────────────────────────────
  React.useEffect(() => {
    const syncProfile = async () => {
      // Even if no user in localStorage, we check backend because HTTP-only cookie might exist
      try {
        const res = await api.get('/auth/profile');
        if (res.data?.user) {
          const updatedUser = { ...res.data.user, isLoggedIn: true };
          localStorage.setItem('simplish_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (err) {
        console.log('No active session found via cookies.');
        // If we had a user but fetch failed, session might be expired
        if (user) {
          localStorage.removeItem('simplish_user');
          localStorage.removeItem('simplish_token');
          localStorage.removeItem('simplish_active_lesson');
          setUser(null);
          setSelectedLesson(null);
        }
      }
    };
    syncProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('simplish_user');
    localStorage.removeItem('simplish_token');
    localStorage.removeItem('simplish_active_lesson');
    setUser(null);
    setSelectedLesson(null);
    navigate('/');
  };

  const handleNavigate = async (view) => {
    setIsMobileMenuOpen(false); // Close menu on navigation
    const role = user?.role?.toLowerCase();
    if ((view === 'admin' || view === 'edit_lesson') && role !== 'moderator' && role !== 'admin' && role !== 'super_admin') {
      showToast('Access Denied: Admin access required', 'error');
      return;
    }
    if (view === 'users' && role !== 'super_admin') {
      showToast('Access Denied: Super Admin Only', 'error');
      return;
    }

    if (view === 'study_area' && !selectedLesson) {
      // Try to find the most recent lesson if none is selected
      try {
        const res = await api.get('/lessons/me/progress');
        const lessons = Array.isArray(res.data) ? res.data : (res.data.lessons || []);
        const lastLesson = lessons.find(l => l.status === 'started') || lessons[0];

        if (lastLesson) {
          startLesson(lastLesson);
          return;
        } else {
          showToast('Please select a lesson from Library first', 'info');
          navigate('/library');
          return;
        }
      } catch (err) {
        navigate('/library');
        return;
      }
    }

    navigate(`/${view}`);
  };

  const startLesson = (lesson) => {
    setSelectedLesson(lesson);
    localStorage.setItem('simplish_active_lesson', JSON.stringify(lesson));
    navigate('/study_area');
  };

  if (!user) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Onboarding Guard: If logged in but not onboarded, FORCE to placement page
  // (except if already on the placement page, or if the user is a moderator/super_admin)
  const isPrivilegedRole = ['moderator', 'admin', 'super_admin'].includes(user?.role?.toLowerCase());
  if (!user.onboarding_completed && !isPrivilegedRole && location.pathname !== '/placement') {
    return <Navigate to="/placement" replace />;
  }

  const currentView = location.pathname.replace('/', '') || 'dashboard';

  return (
    <div className="app-container">
      <div
        className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <Sidebar
        onNavigate={handleNavigate}
        currentView={currentView}
        user={user}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="main-content" style={{ padding: 0 }}>
        <Navbar toggleMobileMenu={() => setIsMobileMenuOpen(true)} />
        <div style={{ padding: '0 1.5rem 2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/placement" element={
              (isPrivilegedRole || user.onboarding_completed)
                ? <Navigate to="/" replace />
                : <PlacementTest onComplete={(result) => {
                  const updatedUser = {
                    ...user,
                    onboarding_completed: true,
                    current_level: result?.assignedLevel || user.current_level,
                    scorePercentage: result?.scorePercentage // For immediate UI update if needed
                  };
                  localStorage.setItem('simplish_user', JSON.stringify(updatedUser));
                  setUser(updatedUser);
                  showToast('ಕಲಿಕೆಗೆ ಸುಸ್ವಾಗತ! (Welcome to your learning journey!)', 'success');
                  navigate('/');
                }} />
            } />

            <Route path="/" element={
              <Dashboard user={user} onStartLesson={startLesson} />
            } />

            <Route path="/library" element={
              <Library
                user={user}
                onSelectLesson={startLesson}
                onEditLesson={(lesson) => {
                  const role = user.role?.toLowerCase();
                  if (role !== 'moderator' && role !== 'admin' && role !== 'super_admin') {
                    showToast('Access Denied: Admin access required', 'error');
                    return;
                  }
                  setSelectedLesson(lesson);
                  navigate('/edit_lesson');
                }}
                onAddLesson={() => {
                  const role = user.role?.toLowerCase();
                  if (role !== 'moderator' && role !== 'admin' && role !== 'super_admin') {
                    showToast('Access Denied: Admin access required', 'error');
                    return;
                  }
                  setSelectedLesson(null);
                  navigate('/admin');
                }}
              />
            } />

            <Route path="/coaching" element={
              selectedLesson
                ? <CoachingPage lesson={selectedLesson} onComplete={() => navigate('/assessment')} onBack={() => navigate('/library')} />
                : <Navigate to="/library" replace />
            } />

            <Route path="/study_area" element={
              selectedLesson
                ? <UniversalStudyArea user={user} lesson={selectedLesson} onBack={() => navigate('/library')} />
                : <Navigate to="/library" replace />
            } />

            <Route path="/assessment" element={
              selectedLesson ? (
                <div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                      className="btn"
                      style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                      onClick={() => navigate('/coaching')}
                    >
                      ← Back to coaching
                    </button>
                  </div>
                  <AssessmentInterface
                    lessonId={selectedLesson.id}
                    onNextLesson={startLesson}
                  />
                </div>
              ) : (
                <Navigate to="/library" replace />
              )
            } />

            <Route path="/admin" element={
              (user.role?.toLowerCase() === 'moderator' || user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'super_admin')
                ? <LessonCreate lesson={null} onBack={() => navigate('/library')} />
                : <Navigate to="/" replace />
            } />

            <Route path="/edit_lesson" element={
              (user.role?.toLowerCase() === 'moderator' || user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'super_admin')
                ? <LessonCreate lesson={selectedLesson} onBack={() => navigate('/library')} />
                : <Navigate to="/" replace />
            } />

            <Route path="/users" element={
              user.role?.toLowerCase() === 'super_admin'
                ? <UserManagement />
                : <Navigate to="/" replace />
            } />

            <Route path="/reports" element={
              (user.role?.toLowerCase() === 'moderator' || user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'super_admin')
                ? <Reports />
                : <Navigate to="/" replace />
            } />

            <Route path="/payment" element={<PaymentGateway user={user} />} />

            <Route path="/profile" element={
              <ProfileSettings
                user={user}
                onBack={() => navigate('/')}
                onUpdate={(updatedUser) => {
                  const token = localStorage.getItem('simplish_token');
                  const normalized = {
                    ...updatedUser,
                    role: updatedUser.role?.toLowerCase() || user?.role,
                    isLoggedIn: true,
                    token: token
                  };
                  localStorage.setItem('simplish_user', JSON.stringify(normalized));
                  setUser(normalized);
                  showToast('Profile updated successfully!', 'success');
                }}
              />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      <BottomNav onNavigate={handleNavigate} currentView={currentView} user={user} />
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
