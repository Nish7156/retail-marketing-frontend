import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Shop } from "@/types/shop";
import type { Branch } from "@/types/shop";

interface BranchStaffItem {
  id: string;
  email: string | null;
  createdAt: string;
  branch: { id: string; name: string; location: string; shop?: { name: string } };
}

export function BranchesPage() {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchStaff, setBranchStaff] = useState<BranchStaffItem[]>([]);
  const [branchName, setBranchName] = useState("");
  const [branchLocation, setBranchLocation] = useState("");
  const [branchShopId, setBranchShopId] = useState("");
  const [staffBranchId, setStaffBranchId] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isStoreAdmin = user?.role === "STORE_ADMIN";

  const loadShops = () => {
    if (!isSuperAdmin) return;
    api.get<Shop[]>("/shops").then(setShops).catch(() => setShops([]));
  };
  const loadBranches = () => {
    if (isSuperAdmin || isStoreAdmin)
      api.get<Branch[]>("/branches").then(setBranches).catch(() => setBranches([]));
  };

  useEffect(() => {
    loadShops();
  }, [isSuperAdmin]);
  const loadBranchStaff = () => {
    if (!isSuperAdmin && !isStoreAdmin) return;
    api.get<BranchStaffItem[]>("/auth/branch-staff").then(setBranchStaff).catch(() => setBranchStaff([]));
  };

  useEffect(() => {
    loadBranches();
  }, [isSuperAdmin, isStoreAdmin]);
  useEffect(() => {
    loadBranchStaff();
  }, [isSuperAdmin, isStoreAdmin]);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const shopId = isSuperAdmin ? branchShopId : (user?.shopIds?.length ? user.shopIds[0] : null);
      if (!shopId) throw new Error("No shop selected");
      await api.post("/branches", { shopId, name: branchName, location: branchLocation });
      setBranchName("");
      setBranchLocation("");
      if (isSuperAdmin) setBranchShopId("");
      setMessage("Branch created.");
      toast.success("Branch created.");
      loadBranches();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create branch";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranchStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setStaffLoading(true);
    try {
      await api.post("/auth/branch-staff", {
        branchId: staffBranchId,
        email: staffEmail,
        password: staffPassword,
      });
      setStaffBranchId("");
      setStaffEmail("");
      setStaffPassword("");
      setMessage("Branch staff created. They can log in with email/password and manage customers for that branch.");
      toast.success("Branch staff created.");
      loadBranchStaff();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create branch staff";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setStaffLoading(false);
    }
  };

  const canManage = isSuperAdmin || isStoreAdmin;
  if (!canManage) {
    return (
      <div>
        <h1 className="page-title">Branches</h1>
        <p className="page-desc">You do not have access to branches.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <h1 className="page-title">Branches</h1>
        <p className="page-desc">Add and manage branches (name + location) for shops.</p>
      </div>

      <div className="card-grid">
        <Card className="card-hover">
        <CardHeader>
          <CardTitle>Create Branch</CardTitle>
          <CardDescription>Add a branch to a shop.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBranch} className="space-y-4">
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label>Shop</Label>
                <Select value={branchShopId} onValueChange={setBranchShopId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch name</Label>
              <Input
                id="branch-name"
                placeholder="e.g. FC Road"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-location">Location</Label>
              <Input
                id="branch-location"
                placeholder="Address or area"
                value={branchLocation}
                onChange={(e) => setBranchLocation(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create Branch"}
            </Button>
          </form>
        </CardContent>
      </Card>

        <Card className="card-hover flex flex-col">
          <CardHeader>
            <CardTitle>All Branches</CardTitle>
            <CardDescription>Branches with name and location.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            <ul className="list-card">
              {branches.length === 0 ? (
                <li className="py-8 text-center text-sm text-muted-foreground">No branches yet.</li>
              ) : (
                branches.map((b) => (
                  <li key={b.id} className="text-sm">
                    <span className="font-medium text-foreground">{b.name}</span>
                    <span className="text-muted-foreground">
                      {b.location}
                      {b.shop && ` · ${b.shop.name}`}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="card-grid">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Add Branch Staff</CardTitle>
            <CardDescription>Create a branch-level login. They can add customers for that branch only.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBranchStaff} className="space-y-4">
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select value={staffBranchId} onValueChange={setStaffBranchId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name} · {b.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="staff@example.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-password">Password</Label>
                <Input
                  id="staff-password"
                  type="password"
                  placeholder="••••••••"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={staffLoading || !staffBranchId}>
                {staffLoading ? "Creating…" : "Create Branch Staff"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="card-hover flex flex-col">
          <CardHeader>
            <CardTitle>Branch Staff</CardTitle>
            <CardDescription>Users who can log in and manage customers for a specific branch.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            <ul className="list-card">
              {branchStaff.length === 0 ? (
                <li className="py-8 text-center text-sm text-muted-foreground">No branch staff yet.</li>
              ) : (
                branchStaff.map((s) => (
                  <li key={s.id} className="text-sm">
                    <span className="font-medium text-foreground">{s.email ?? s.id}</span>
                    <span className="text-muted-foreground">
                      {s.branch?.name} · {s.branch?.location}
                      {s.branch?.shop && ` · ${s.branch.shop.name}`}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            message.startsWith("F")
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-primary/20 bg-primary/10 text-primary"
          }`}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}
