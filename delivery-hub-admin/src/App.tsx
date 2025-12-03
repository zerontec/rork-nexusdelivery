import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Estadisticas from "./pages/Estadisticas";
import Comisiones from "./pages/Comisiones";
import Promociones from "./pages/Promociones";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { BusinessLayout } from "@/components/BusinessLayout";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessMenu from "./pages/BusinessMenu";
import BusinessOrders from "./pages/BusinessOrders";
import BusinessFinance from "./pages/BusinessFinance";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'business' }) => {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        // 1. Check metadata first (faster)
        const metadataRole = session.user.user_metadata?.role;

        // 2. Check profile (source of truth)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setUserRole(profile?.role || metadataRole || 'client');
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkAuth();
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center">Cargando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Role-based redirection
  if (userRole === 'business' && requiredRole === 'admin') {
    return <Navigate to="/business/dashboard" replace />;
  }

  if (userRole !== 'business' && requiredRole === 'business') {
    if (userRole === 'admin') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

import { NotificationsProvider } from "@/contexts/NotificationsContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NotificationsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route path="/" element={
                <ProtectedRoute requiredRole="admin">
                  <DashboardLayout><Dashboard /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/usuarios" element={
                <ProtectedRoute requiredRole="admin">
                  <DashboardLayout><Usuarios /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/estadisticas" element={
                <ProtectedRoute requiredRole="admin">
                  <DashboardLayout><Estadisticas /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/comisiones" element={
                <ProtectedRoute requiredRole="admin">
                  <DashboardLayout><Comisiones /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/promociones" element={
                <ProtectedRoute requiredRole="admin">
                  <DashboardLayout><Promociones /></DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Business Routes */}
              <Route path="/business/dashboard" element={
                <ProtectedRoute requiredRole="business">
                  <BusinessLayout><BusinessDashboard /></BusinessLayout>
                </ProtectedRoute>
              } />
              <Route path="/business/menu" element={
                <ProtectedRoute requiredRole="business">
                  <BusinessLayout><BusinessMenu /></BusinessLayout>
                </ProtectedRoute>
              } />
              <Route path="/business/orders" element={
                <ProtectedRoute requiredRole="business">
                  <BusinessLayout><BusinessOrders /></BusinessLayout>
                </ProtectedRoute>
              } />
              <Route path="/business/finance" element={
                <ProtectedRoute requiredRole="business">
                  <BusinessLayout><BusinessFinance /></BusinessLayout>
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationsProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
