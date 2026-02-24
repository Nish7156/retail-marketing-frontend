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
import type { Branch } from "@/types/shop";
import type { Offer } from "@/types/shop";

export function OffersPage() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerBranchId, setOfferBranchId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = user?.role === "SUPERADMIN";
  const isStoreAdmin = user?.role === "STORE_ADMIN";

  const loadBranches = () => {
    if (isSuperAdmin || isStoreAdmin)
      api.get<Branch[]>("/branches").then(setBranches).catch(() => setBranches([]));
  };
  const loadOffers = () => {
    if (isSuperAdmin || isStoreAdmin)
      api.get<Offer[]>("/offers").then(setOffers).catch(() => setOffers([]));
  };

  useEffect(() => {
    loadBranches();
    loadOffers();
  }, [isSuperAdmin, isStoreAdmin]);

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
      toast.success("Offer created.");
      loadOffers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create offer";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const canManage = isSuperAdmin || isStoreAdmin;
  if (!canManage) {
    return (
      <div>
        <h1 className="page-title">Offers</h1>
        <p className="page-desc">You do not have access to offers.</p>
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
        <h1 className="page-title">Offers</h1>
        <p className="page-desc">Create and manage offers by branch.</p>
      </div>

      <div className="card-grid">
        <Card className="card-hover">
        <CardHeader>
          <CardTitle>Create Offer</CardTitle>
          <CardDescription>Create an offer for a branch.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOffer} className="space-y-5">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={offerBranchId} onValueChange={setOfferBranchId}>
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

        <Card className="card-hover flex flex-col">
          <CardHeader>
            <CardTitle>All Offers</CardTitle>
            <CardDescription>Offers by branch.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            <ul className="list-card">
              {offers.length === 0 ? (
                <li className="py-8 text-center text-sm text-muted-foreground">No offers yet.</li>
              ) : (
                offers.map((o) => (
                  <li key={o.id} className="flex flex-col gap-0.5 text-sm">
                    <span className="font-medium text-foreground">{o.title}</span>
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
