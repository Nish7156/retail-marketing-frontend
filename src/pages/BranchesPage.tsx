import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

export function BranchesPage() {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchName, setBranchName] = useState("");
  const [branchLocation, setBranchLocation] = useState("");
  const [branchShopId, setBranchShopId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
  useEffect(() => {
    loadBranches();
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
      loadBranches();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create branch");
    } finally {
      setLoading(false);
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
