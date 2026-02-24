import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Store, Users, MapPin, Tag, ArrowRight, UserPlus } from "lucide-react";

const navCards = [
  { label: "Shops", desc: "Create and manage shops", icon: Store, path: "/shops", role: "SUPERADMIN" as const },
  { label: "Shop Owners", desc: "Manage owners and assign to shops", icon: Users, path: "/shop-owners", role: "SUPERADMIN" as const },
  { label: "Branches", desc: "Add branches (name + location)", icon: MapPin, path: "/branches", role: "STORE_ADMIN" as const },
  { label: "Offers", desc: "Create offers for branches", icon: Tag, path: "/offers", role: "STORE_ADMIN" as const },
  { label: "Customers", desc: "Add and manage customers for your branch", icon: UserPlus, path: "/customers", role: "BRANCH_STAFF" as const },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const { user } = useAuth();
  const displayUser = user?.phone ?? user?.email ?? "—";
  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isStoreAdmin = user?.role === "STORE_ADMIN";
  const isBranchStaff = user?.role === "BRANCH_STAFF";

  const visibleCards = navCards.filter(
    (c) =>
      (c.role === "SUPERADMIN" && isSuperAdmin) ||
      (c.role === "STORE_ADMIN" && (isSuperAdmin || isStoreAdmin)) ||
      (c.role === "BRANCH_STAFF" && isBranchStaff)
  );

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="page-title">Dashboard</h1>
        <p className="page-desc">
          Logged in as <span className="font-medium text-foreground">{displayUser}</span>
          {" · "}
          <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {user?.role}
          </span>
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {visibleCards.map((card) => (
          <motion.div key={card.path} variants={item}>
            <Link to={card.path} className="block h-full group">
              <div className="card-hover flex h-full min-h-[200px] flex-col justify-between gap-5 rounded-2xl border border-border/80 bg-card p-7 shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner">
                    <card.icon className="h-7 w-7 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-base font-semibold leading-tight text-foreground">{card.label}</p>
                  <p className="text-sm leading-snug text-muted-foreground">{card.desc}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {!isSuperAdmin && !isStoreAdmin && !isBranchStaff && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/80 bg-card p-8 shadow-sm"
        >
          <p className="text-muted-foreground">You are logged in. Contact an admin for shop access.</p>
        </motion.div>
      )}
    </div>
  );
}
