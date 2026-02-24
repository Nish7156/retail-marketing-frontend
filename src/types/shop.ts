export interface Shop {
  id: string;
  name: string;
  _count?: { branches: number; users: number };
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  shopId: string;
  shop?: { id: string; name: string };
}

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  branchId: string;
  branch?: { id: string; name: string; location: string };
}

export interface ShopOwner {
  id: string;
  email: string | null;
  phone: string;
  shops: { id: string; name: string }[];
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  branchId: string;
  branch?: { id: string; name: string; location: string };
  createdAt: string;
}
