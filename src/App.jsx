import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ensureAdminUser } from '@/lib/seedAuth';
import { Toaster } from '@/components/ui/toaster';

// Layouts
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Pages
import HomePage from '@/pages/HomePage';
import PropertiesPage from '@/pages/PropertiesPage';
import ContactPage from '@/pages/ContactPage';
import CalculatorPage from '@/pages/CalculatorPage';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminProperties from '@/pages/AdminProperties';
import AdminContacts from '@/pages/AdminContacts';
import AdminSettings from '@/pages/AdminSettings';
import NotFoundPage from '@/pages/NotFoundPage';

// Admin Route Protection
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#030083]"></div>
        <p className="text-gray-600 font-medium">Verificando sesión...</p>
      </div>
    </div>
  );
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

const AppContent = () => {
  // Run auth seeder once on app load to ensure admin user exists for demo purposes
  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_SEED_ADMIN === 'true') {
      ensureAdminUser();
    }
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <>
          <Header />
          <HomePage />
          <Footer />
        </>
      } />
      <Route path="/propiedades" element={
        <>
          <Header />
          <PropertiesPage />
          <Footer />
        </>
      } />
      <Route path="/contacto" element={
        <>
          <Header />
          <ContactPage />
          <Footer />
        </>
      } />
      <Route path="/calculadora" element={
        <>
          <Header />
          <CalculatorPage />
          <Footer />
        </>
      } />

      {/* Admin Login - Public but specific to admin */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/propiedades" element={
        <ProtectedRoute>
          <AdminProperties />
        </ProtectedRoute>
      } />
      <Route path="/admin/contactos" element={
        <ProtectedRoute>
          <AdminContacts />
        </ProtectedRoute>
      } />
       <Route path="/admin/configuracion" element={
        <ProtectedRoute>
          <AdminSettings />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Helmet>
          <title>Rinova - Inversiones Inmobiliarias</title>
        </Helmet>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
