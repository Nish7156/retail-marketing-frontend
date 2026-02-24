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
import type { Shop } from "@/types/shop";

export function ShopsPage() {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopName, setShopName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = user?.role === "SUPERADMIN";

  const loadShops = () => {
    if (!isSuperAdmin) return;
    api.get<Shop[]>("/shops").then(setShops).catch(() => setShops([]));
  };

  useEffect(() => {
    loadShops();
  }, [isSuperAdmin]);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await api.post("/shops", { name: shopName });
      setShopName("");
      setMessage("Shop created.");
      loadShops();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create shop");
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div>
        <h1 className="page-title">Shops</h1>
        <p className="page-desc">Only super admins can manage shops.</p>
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
        <h1 className="page-title">Shops</h1>
        <p className="page-desc">Create and manage shops.</p>
      </div>

      <div className="card-grid">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Create Shop</CardTitle>
            <CardDescription>Add a new shop to the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateShop} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop-name">Shop name</Label>
                <Input
                  id="shop-name"
                  placeholder="Shop name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                  />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create Shop"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="card-hover flex flex-col">
          <CardHeader>
            <CardTitle>All Shops</CardTitle>
            <CardDescription>One user can be owner of multiple shops.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            <ul className="list-card">
              {shops.length === 0 ? (
                <li className="py-8 text-center text-sm text-muted-foreground">
                  No shops yet.
                </li>
              ) : (
                shops.map((s) => (
                  <li key={s.id} className="text-sm">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="text-muted-foreground">
                      {s._count?.branches ?? 0} branches · {s._count?.users ?? 0} owners
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
