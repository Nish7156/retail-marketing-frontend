import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getPhoneForApi, PHONE_DEFAULT, phoneErrorMessage } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Shop } from "@/types/shop";
import type { ShopOwner } from "@/types/shop";

export function ShopOwnersPage() {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopOwners, setShopOwners] = useState<ShopOwner[]>([]);
  const [ownerPhone, setOwnerPhone] = useState(PHONE_DEFAULT);
  const [ownerShopId, setOwnerShopId] = useState("");
  const [addOwnerShopId, setAddOwnerShopId] = useState("");
  const [addOwnerPhone, setAddOwnerPhone] = useState(PHONE_DEFAULT);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<{ title: string; description: string; onConfirm: () => Promise<void> } | null>(null);

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

  const doCreateShopOwner = async () => {
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/store-owners", {
        phone: getPhoneForApi(ownerPhone),
        shopId: ownerShopId || undefined,
      });
      setOwnerPhone(PHONE_DEFAULT);
      setOwnerShopId("");
      setMessage("Shop owner created. They can sign in with this phone number (OTP).");
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

  const handleCreateShopOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneErr = phoneErrorMessage(ownerPhone);
    if (phoneErr) {
      setMessage(phoneErr);
      toast.error(phoneErr);
      return;
    }
    setConfirmPayload({
      title: "Create shop owner?",
      description: "Are you sure you want to create this shop owner?",
      onConfirm: doCreateShopOwner,
    });
    setConfirmOpen(true);
  };

  const doAddOwnerToShop = async () => {
    setMessage("");
    setLoading(true);
    try {
      await api.post(`/shops/${addOwnerShopId}/owners`, { phone: getPhoneForApi(addOwnerPhone) });
      setAddOwnerPhone(PHONE_DEFAULT);
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

  const handleAddOwnerToShop = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneErr = phoneErrorMessage(addOwnerPhone);
    if (phoneErr) {
      setMessage(phoneErr);
      toast.error(phoneErr);
      return;
    }
    setConfirmPayload({
      title: "Add owner to shop?",
      description: "Are you sure you want to add this owner to the shop?",
      onConfirm: doAddOwnerToShop,
    });
    setConfirmOpen(true);
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
        <p className="page-desc">Create owners by phone number and add existing users (by phone) to shops. Phone is used for login and everywhere.</p>
      </div>

      <div className="card-grid">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Create Shop Owner</CardTitle>
            <CardDescription>Create an owner by phone number. They sign in with this phone (OTP) and use it everywhere.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateShopOwner} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="owner-phone">Phone number</Label>
                <PhoneInput
                  id="owner-phone"
                  value={ownerPhone}
                  onChange={setOwnerPhone}
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
            <CardDescription>Add an existing user by phone number to a shop. They sign in with that phone (OTP).</CardDescription>
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
                <PhoneInput
                  id="add-owner-phone"
                  value={addOwnerPhone}
                  onChange={setAddOwnerPhone}
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
                  <span className="font-medium text-foreground">{o.phone}{o.email ? ` · ${o.email}` : ""}</span>
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setConfirmPayload(null);
        }}
        title={confirmPayload?.title ?? ""}
        description={confirmPayload?.description}
        confirmLabel="Confirm"
        onConfirm={confirmPayload?.onConfirm ?? (async () => {})}
        loading={loading}
      />
    </motion.div>
  );
}
