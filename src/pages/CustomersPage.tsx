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
import type { Customer } from "@/types/shop";
import type { Branch } from "@/types/shop";

export function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [branchId, setBranchId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterBranchId, setFilterBranchId] = useState<string>("");

  const isBranchStaff = user?.role === "BRANCH_STAFF";
  const isStoreAdmin = user?.role === "STORE_ADMIN";
  const isSuperAdmin = user?.role === "SUPERADMIN";
  const canManage = isBranchStaff || isStoreAdmin || isSuperAdmin;

  const effectiveBranchId = isBranchStaff ? (user?.branchId ?? "") : branchId;

  const loadCustomers = () => {
    if (!canManage) return;
    const query = filterBranchId ? `?branchId=${filterBranchId}` : "";
    api.get<Customer[]>(`/customers${query}`).then(setCustomers).catch(() => setCustomers([]));
  };

  const loadBranches = () => {
    if (!isSuperAdmin && !isStoreAdmin) return;
    api.get<Branch[]>("/branches").then(setBranches).catch(() => setBranches([]));
  };

  useEffect(() => {
    loadCustomers();
  }, [canManage, filterBranchId]);
  useEffect(() => {
    loadBranches();
  }, [isSuperAdmin, isStoreAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await api.post("/customers", {
        branchId: effectiveBranchId,
        name,
        phone,
        email: email || undefined,
      });
      setName("");
      setPhone("");
      setEmail("");
      if (!isBranchStaff) setBranchId("");
      setMessage("Customer added.");
      toast.success("Customer added.");
      loadCustomers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add customer";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!canManage) {
    return (
      <div>
        <h1 className="page-title">Customers</h1>
        <p className="page-desc">Branch staff and above can manage customers for their branch.</p>
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
        <h1 className="page-title">Customers</h1>
        <p className="page-desc">
          {isBranchStaff && user?.branch
            ? `Add end users (name + phone) for your branch ${user.branch.name}. Relation: Store → Branch → Customers.`
            : "Add end users (name + phone) by branch. Relation: Store → Branch → Customers."}
        </p>
      </div>

      <div className="card-grid">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Add Customer</CardTitle>
            <CardDescription>
              {isBranchStaff ? "Add an end user (name + phone) to your branch." : "Select a branch and add an end user (name + phone)."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-5">
              {!isBranchStaff && (
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select value={branchId} onValueChange={setBranchId} required={!isBranchStaff}>
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
              )}
              <div className="space-y-2">
                <Label htmlFor="cust-name">Name</Label>
                <Input
                  id="cust-name"
                  placeholder="Customer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cust-phone">Phone</Label>
                <Input
                  id="cust-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cust-email">Email (optional)</Label>
                <Input
                  id="cust-email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading || (!isBranchStaff && !branchId)}>
                {loading ? "Adding…" : "Add Customer"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="card-hover flex flex-col">
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
            <CardDescription>
              {isBranchStaff ? "End users (name + phone) at your branch." : "Filter by branch below. Store → Branch → Customers."}
            </CardDescription>
            {!isBranchStaff && branches.length > 0 && (
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground">Filter by branch</Label>
                <Select value={filterBranchId || "__all__"} onValueChange={(v) => setFilterBranchId(v === "__all__" ? "" : v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All branches</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name} · {b.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            <ul className="list-card">
              {customers.length === 0 ? (
                <li className="py-8 text-center text-sm text-muted-foreground">No customers yet.</li>
              ) : (
                customers.map((c) => (
                  <li key={c.id} className="text-sm">
                    <span className="font-medium text-foreground">{c.name}</span>
                    <span className="text-muted-foreground">
                      {c.phone}
                      {c.email && ` · ${c.email}`}
                      {c.branch && !isBranchStaff && ` · ${c.branch.name}`}
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
