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

interface Shop {
  id: string;
  name: string;
  _count?: { branches: number; users: number };
}

interface Branch {
  id: string;
  name: string;
  location: string;
  shopId: string;
  shop?: { id: string; name: string };
}

interface Offer {
  id: string;
  title: string;
  description: string | null;
  branchId: string;
  branch?: { id: string; name: string; location: string };
}

interface ShopOwner {
  id: string;
  email: string | null;
  phone: string;
  shops: { id: string; name: string }[];
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
  const [shops, setShops] = useState<Shop[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shopOwners, setShopOwners] = useState<ShopOwner[]>([]);
  const [shopName, setShopName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchLocation, setBranchLocation] = useState("");
  const [branchShopId, setBranchShopId] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerBranchId, setOfferBranchId] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerShopId, setOwnerShopId] = useState("");
  const [addOwnerShopId, setAddOwnerShopId] = useState("");
  const [addOwnerPhone, setAddOwnerPhone] = useState("");
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

  const loadOffers = () => {
    if (isSuperAdmin || isStoreAdmin)
      api.get<Offer[]>("/offers").then(setOffers).catch(() => setOffers([]));
  };

  const loadShopOwners = () => {
    if (!isSuperAdmin) return;
    api.get<ShopOwner[]>("/auth/store-owners").then(setShopOwners).catch(() => setShopOwners([]));
  };

  useEffect(() => {
    loadShops();
    loadShopOwners();
  }, [isSuperAdmin]);

  useEffect(() => {
    loadBranches();
    loadOffers();
  }, [isSuperAdmin, isStoreAdmin]);

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

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await api.post("/offers", {
        branchId: offerBranchId,
        title: offerTitle,
        description: offerDescription || undefined,
      });
      setOfferTitle("");
      setOfferDescription("");
      setOfferBranchId("");
      setMessage("Offer created.");
      loadOffers();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create offer");
    } finally {
      setLoading(false);
    }
  };

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
      loadShopOwners();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to create shop owner"
      );
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
      loadShopOwners();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to add owner to shop"
      );
    } finally {
      setLoading(false);
    }
  };

  const displayUser = user?.phone ?? user?.email ?? "—";

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
            Logged in as {displayUser} · {user?.role}
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
              <Card>
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

              <Card>
                <CardHeader>
                  <CardTitle>Create Shop Owner</CardTitle>
                  <CardDescription>
                    Register a new shop owner (email/password) and optionally assign a shop.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateShopOwner} className="space-y-4">
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
                      <Select
                        value={ownerShopId || "__none__"}
                        onValueChange={(v) =>
                          setOwnerShopId(v === "__none__" ? "" : v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No shop" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">No shop</SelectItem>
                          {shops.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
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
            </motion.section>

            <motion.section variants={listItemVariants} custom={3}>
              <Card>
                <CardHeader>
                  <CardTitle>Shops</CardTitle>
                  <CardDescription>All shops. One user (same phone) can be owner of multiple shops.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border rounded-md border">
                    {shops.length === 0 ? (
                      <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No shops yet.
                      </li>
                    ) : (
                      shops.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between px-4 py-3 text-sm"
                        >
                          <span className="font-medium">{s.name}</span>
                          <span className="text-muted-foreground">
                            {s._count?.branches ?? 0} branches · {s._count?.users ?? 0} owners
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>
            </motion.section>

            <motion.section variants={listItemVariants} custom={34}>
              <Card>
                <CardHeader>
                  <CardTitle>Add owner to shop</CardTitle>
                  <CardDescription>
                    Add an existing user (by phone) to another shop. Same phone can be owner of Street A and Street B.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddOwnerToShop} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Shop</Label>
                      <Select
                        value={addOwnerShopId}
                        onValueChange={setAddOwnerShopId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select shop" />
                        </SelectTrigger>
                        <SelectContent>
                          {shops.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
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
            </motion.section>

            <motion.section variants={listItemVariants} custom={4}>
              <Card>
                <CardHeader>
                  <CardTitle>Shop Owners</CardTitle>
                  <CardDescription>All registered shop owners.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border rounded-md border">
                    {shopOwners.length === 0 ? (
                      <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No shop owners yet.
                      </li>
                    ) : (
                      shopOwners.map((o) => (
                        <li
                          key={o.id}
                          className="flex items-center justify-between px-4 py-3 text-sm"
                        >
                          <span className="font-medium">{o.email ?? o.phone}</span>
                          <span className="text-muted-foreground">
                            {o.shops?.length
                              ? o.shops.map((s) => s.name).join(", ")
                              : "No shops"}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>
            </motion.section>
          </>
        )}

        {(isSuperAdmin || isStoreAdmin) && (
          <>
            <Separator className="my-6" />
            <motion.section variants={listItemVariants} custom={5}>
              <Card>
                <CardHeader>
                  <CardTitle>Create Branch</CardTitle>
                  <CardDescription>
                    Add a branch (name + location) to a shop.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateBranch} className="space-y-4">
                    {isSuperAdmin && (
                      <div className="space-y-2">
                        <Label>Shop</Label>
                        <Select
                          value={branchShopId}
                          onValueChange={setBranchShopId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shop" />
                          </SelectTrigger>
                          <SelectContent>
                            {shops.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
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
            </motion.section>

            <motion.section variants={listItemVariants} custom={6}>
              <Card>
                <CardHeader>
                  <CardTitle>Branches</CardTitle>
                  <CardDescription>Branches (name, location).</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border rounded-md border">
                    {branches.length === 0 ? (
                      <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No branches yet.
                      </li>
                    ) : (
                      branches.map((b) => (
                        <li
                          key={b.id}
                          className="flex items-center justify-between px-4 py-3 text-sm"
                        >
                          <span className="font-medium">{b.name}</span>
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
            </motion.section>

            <motion.section variants={listItemVariants} custom={7}>
              <Card>
                <CardHeader>
                  <CardTitle>Create Offer</CardTitle>
                  <CardDescription>
                    Create an offer for a branch.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateOffer} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Branch</Label>
                      <Select
                        value={offerBranchId}
                        onValueChange={setOfferBranchId}
                      >
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
                      <Label htmlFor="offer-title">Title</Label>
                      <Input
                        id="offer-title"
                        placeholder="Offer title"
                        value={offerTitle}
                        onChange={(e) => setOfferTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="offer-desc">Description (optional)</Label>
                      <Input
                        id="offer-desc"
                        placeholder="Description"
                        value={offerDescription}
                        onChange={(e) => setOfferDescription(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating…" : "Create Offer"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.section>

            <motion.section variants={listItemVariants} custom={8}>
              <Card>
                <CardHeader>
                  <CardTitle>Offers</CardTitle>
                  <CardDescription>Offers by branch.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border rounded-md border">
                    {offers.length === 0 ? (
                      <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No offers yet.
                      </li>
                    ) : (
                      offers.map((o) => (
                        <li
                          key={o.id}
                          className="flex flex-col gap-1 px-4 py-3 text-sm"
                        >
                          <span className="font-medium">{o.title}</span>
                          <span className="text-muted-foreground">
                            {o.branch?.name ?? o.branchId}
                            {o.description && ` · ${o.description}`}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>
            </motion.section>
          </>
        )}

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
      </motion.div>
    </DashboardLayout>
  );
}
