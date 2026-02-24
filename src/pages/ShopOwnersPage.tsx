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
import type { ShopOwner } from "@/types/shop";

export function ShopOwnersPage() {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopOwners, setShopOwners] = useState<ShopOwner[]>([]);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerShopId, setOwnerShopId] = useState("");
  const [addOwnerShopId, setAddOwnerShopId] = useState("");
  const [addOwnerPhone, setAddOwnerPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = user?.role === "SUPERADMIN";

  const loadShops = () => {
    if (!isSuperAdmin) return;
    api.get<Shop[]>("/shops").then(setShops).catch(() => setShops([]));
  };
  const loadShopOwners = () => {
    if (!isSuperAdmin) return;
    api.get<ShopOwner[]>("/auth/store-owners").then(setShopOwners).catch(() => setShopOwners([]));
  };

  useEffect(() => {
    loadShops();
    loadShopOwners();
  }, [isSuperAdmin]);

  const handleCreateShopOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/store-owners", {
        email: ownerEmail,
        password: ownerPassword,
        shopId: ownerShopId || undefined,
      });
      setOwnerEmail("");
      setOwnerPassword("");
      setOwnerShopId("");
      setMessage("Shop owner created.");
      toast.success("Shop owner created.");
      loadShopOwners();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create shop owner";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOwnerToShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await api.post(`/shops/${addOwnerShopId}/owners`, { phone: addOwnerPhone });
      setAddOwnerPhone("");
      setAddOwnerShopId("");
      setMessage("Owner added to shop.");
      toast.success("Owner added to shop.");
      loadShopOwners();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add owner to shop";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div>
        <h1 className="page-title">Shop Owners</h1>
        <p className="page-desc">Only super admins can manage shop owners.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <h1 className="page-title">Shop Owners</h1>
        <p className="page-desc">Create owners and add existing users to shops.</p>
      </div>

      <div className="card-grid">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Create Shop Owner</CardTitle>
            <CardDescription>Register with email/password and optionally assign a shop.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateShopOwner} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="owner-email">Email</Label>
                <Input
                  id="owner-email"
                  type="email"
                  placeholder="Email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-password">Password</Label>
                <Input
                  id="owner-password"
                  type="password"
                  placeholder="Password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Shop (optional)</Label>
                <Select value={ownerShopId || "__none__"} onValueChange={(v) => setOwnerShopId(v === "__none__" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No shop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No shop</SelectItem>
                    {shops.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create Shop Owner"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="card-hover flex flex-col">
          <CardHeader>
            <CardTitle>Add Owner to Shop</CardTitle>
            <CardDescription>Add an existing user (by phone) to a shop.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOwnerToShop} className="space-y-5">
              <div className="space-y-2">
                <Label>Shop</Label>
                <Select value={addOwnerShopId} onValueChange={setAddOwnerShopId}>
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
              <div className="space-y-2">
                <Label htmlFor="add-owner-phone">Phone</Label>
                <Input
                  id="add-owner-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={addOwnerPhone}
                  onChange={(e) => setAddOwnerPhone(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding…" : "Add owner to shop"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>All Shop Owners</CardTitle>
          <CardDescription>Registered shop owners and their shops.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="list-card">
            {shopOwners.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">No shop owners yet.</li>
            ) : (
              shopOwners.map((o) => (
                <li key={o.id} className="text-sm">
                  <span className="font-medium text-foreground">{o.email ?? o.phone}</span>
                  <span className="text-muted-foreground">
                    {o.shops?.length ? o.shops.map((s) => s.name).join(", ") : "No shops"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

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
