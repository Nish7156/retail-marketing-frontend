import { motion } from "framer-motion";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Login } from "@/pages/Login";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Dashboard } from "@/pages/Dashboard";
import { ShopsPage } from "@/pages/ShopsPage";
import { ShopOwnersPage } from "@/pages/ShopOwnersPage";
import { BranchesPage } from "@/pages/BranchesPage";
import { OffersPage } from "@/pages/OffersPage";

function AppContent() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-sm font-medium text-muted-foreground">Loading…</span>
        </motion.div>
      </div>
    );
  if (!user) return <Login />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="shop-owners" element={<ShopOwnersPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
