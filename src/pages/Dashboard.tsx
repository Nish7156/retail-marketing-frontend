import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
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
import { Separator } from "@/components/ui/separator";

interface Store {
  id: string;
  name: string;
}

interface StoreOwner {
  id: string;
  email: string;
  storeId: string | null;
  createdAt: string;
}

const listItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.25 },
  }),
};

export function Dashboard() {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [storeOwners, setStoreOwners] = useState<StoreOwner[]>([]);
  const [storeName, setStoreName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerStoreId, setOwnerStoreId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = user?.role === "SUPERADMIN";

  const loadStores = () => {
    if (!isSuperAdmin) return;
    api.get<Store[]>("/stores").then(setStores).catch(() => setStores([]));
  };

  const loadStoreOwners = () => {
    if (!isSuperAdmin) return;
    api
      .get<StoreOwner[]>("/auth/store-owners")
      .then(setStoreOwners)
      .catch(() => setStoreOwners([]));
  };

  useEffect(() => {
    loadStores();
    loadStoreOwners();
  }, [isSuperAdmin]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await api.post("/stores", { name: storeName });
      setStoreName("");
      setMessage("Store created.");
      loadStores();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStoreOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/store-owners", {
        email: ownerEmail,
        password: ownerPassword,
        storeId: ownerStoreId || undefined,
      });
      setOwnerEmail("");
      setOwnerPassword("");
      setOwnerStoreId("");
      setMessage("Store owner created.");
      loadStoreOwners();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to create store owner"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        <div>
          <motion.h1
            className="text-2xl font-bold tracking-tight md:text-3xl"
            variants={listItemVariants}
            custom={0}
          >
            Dashboard
          </motion.h1>
          <motion.p
            className="text-muted-foreground mt-1 text-sm md:text-base"
            variants={listItemVariants}
            custom={1}
          >
            Logged in as {user?.email} · {user?.role}
          </motion.p>
        </div>

        {isSuperAdmin && (
          <>
            <Separator className="my-6" />

            <motion.section
              className="grid gap-6 md:grid-cols-2"
              variants={listItemVariants}
              custom={2}
            >
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Create Store</CardTitle>
                  <CardDescription>Add a new store to the system.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateStore} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="store-name">Store name</Label>
                      <Input
                        id="store-name"
                        placeholder="Store name"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating…" : "Create Store"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Create Store Owner</CardTitle>
                  <CardDescription>
                    Register a new store owner and optionally assign a store.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateStoreOwner} className="space-y-4">
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
                      <Label>Store (optional)</Label>
                      <Select
                        value={ownerStoreId || "__none__"}
                        onValueChange={(v) =>
                          setOwnerStoreId(v === "__none__" ? "" : v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No store" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">No store</SelectItem>
                          {stores.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating…" : "Create Store Owner"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.section>

            <AnimatePresence mode="wait">
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-lg px-4 py-2 text-sm ${
                    message.startsWith("F")
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.section variants={listItemVariants} custom={3}>
              <Card>
                <CardHeader>
                  <CardTitle>Store Owners</CardTitle>
                  <CardDescription>All registered store owners.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border rounded-md border">
                    <AnimatePresence mode="popLayout">
                      {storeOwners.length === 0 ? (
                        <motion.li
                          key="empty"
                          className="px-4 py-6 text-center text-sm text-muted-foreground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          No store owners yet.
                        </motion.li>
                      ) : (
                        storeOwners.map((o, i) => (
                          <motion.li
                            key={o.id}
                            className="flex items-center justify-between px-4 py-3 text-sm"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            exit={{ opacity: 0, x: 8 }}
                          >
                            <span className="font-medium">{o.email}</span>
                            <span className="text-muted-foreground">
                              {o.storeId
                                ? stores.find((s) => s.id === o.storeId)?.name ??
                                  o.storeId
                                : "No store"}
                            </span>
                          </motion.li>
                        ))
                      )}
                    </AnimatePresence>
                  </ul>
                </CardContent>
              </Card>
            </motion.section>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
