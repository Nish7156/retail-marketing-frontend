import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  Users,
  MapPin,
  Tag,
  LogOut,
  Menu,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Shops", icon: Store, path: "/shops" },
  { label: "Shop Owners", icon: Users, path: "/shop-owners" },
  { label: "Branches", icon: MapPin, path: "/branches" },
  { label: "Offers", icon: Tag, path: "/offers" },
];

const branchStaffNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Customers", icon: UserPlus, path: "/customers" },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function AppSidebar({ onClose, isMobile = false }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const navItems = user?.role === "BRANCH_STAFF" ? branchStaffNavItems : adminNavItems;

  const content = (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="relative flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-primary-foreground shadow-lg shadow-primary/30">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold tracking-tight text-white">Retail</span>
          <span className="ml-1.5 text-xs font-medium text-white/60">Marketing</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
      </div>
      <nav className="flex-1 min-h-0 overflow-y-auto space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              cn(
                "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "hover:bg-white/10 hover:text-white",
                isActive ? "text-primary" : "text-sidebar-foreground/80"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-pill"
                    className="absolute inset-0 rounded-xl bg-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <item.icon className={cn("relative z-10 h-4 w-4 shrink-0", isActive && "text-primary")} />
                <span className="relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="mb-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs">
          <p className="truncate font-medium text-white/90">{user?.phone ?? user?.email ?? "—"}</p>
          <p className="truncate text-white/50">{user?.role}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 rounded-xl text-white/70 hover:bg-red-500/15 hover:text-red-400"
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
    <aside className="flex h-screen flex-col border-r border-white/5 bg-sidebar shadow-xl shadow-black/20">
      {content}
    </aside>
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
      className={cn("md:hidden rounded-xl hover:bg-primary/10 hover:text-primary", className)}
      onClick={onClick}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
