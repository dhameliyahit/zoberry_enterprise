export type Address = {
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  isActive: boolean;
  addresses: Address[];
  createdAt: string;
};
