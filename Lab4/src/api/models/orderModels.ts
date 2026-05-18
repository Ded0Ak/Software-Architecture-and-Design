export interface CreateOrderFromCatalogRequest {
  clientName: string;
  serviceIds: number[];
}

export interface CreateTurnkeyOrderRequest {
  clientName: string;
  totalPrice: number;
}

export interface UpdateOrderRequest {
  clientName: string;
  orderType: "FromCatalog" | "Turnkey";
  serviceIds?: number[];
  totalPrice?: number;
}

export interface OrderResponse {
  id: number;
  clientName: string;
  orderType: "FromCatalog" | "Turnkey";
  serviceIds: number[];
  totalPrice: number;
  completed: boolean;
}