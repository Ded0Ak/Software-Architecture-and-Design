export type CreateServiceRequest = {
  name: string;
  price: number;
  type: "Regular" | "Turnkey";
};

export type UpdateServiceRequest = {
  name: string;
  price: number;
  type: "Regular" | "Turnkey";
};

export type ServiceResponse = {
  id: number;
  name: string;
  price: number;
  type: string;
};