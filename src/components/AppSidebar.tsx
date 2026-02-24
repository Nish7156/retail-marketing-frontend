import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Shops", icon: Store },
  { label: "Shop Owners", icon: Users },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function AppSidebar({ onClose, isMobile = false }: AppSidebarProps) {
  const { user, logout } = useAuth();

  const content = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <motion.div
          className="flex items-center gap-2"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">Retail Marketing</span>
        </motion.div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item, i) => (
          <motion.button
            key={item.label}
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            )}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            onClick={isMobile ? onClose : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </motion.button>
        ))}
      </nav>
      <Separator />
      <div className="p-3">
        <motion.div
          className="mb-2 rounded-lg px-3 py-2 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="truncate font-medium text-foreground">{user?.phone ?? user?.email ?? "—"}</p>
          <p className="truncate">{user?.role}</p>
        </motion.div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return content;
  }

  return (
    <motion.aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-sidebar md:flex md:w-56"
      )}
      initial={false}
    >
      {content}
    </motion.aside>
  );
}

interface SidebarTriggerProps {
  onClick: () => void;
  className?: string;
}

export function SidebarTrigger({ onClick, className }: SidebarTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("md:hidden", className)}
      onClick={onClick}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
