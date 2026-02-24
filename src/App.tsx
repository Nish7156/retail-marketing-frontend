import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";

function AppContent() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-sm text-muted-foreground">Loading…</span>
        </motion.div>
      </div>
    );
  if (!user) return <Login />;
  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
