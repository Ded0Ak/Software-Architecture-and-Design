export type CreatePortfolioRequest = {
  title: string;
  description: string;
};

export type PortfolioResponse = {
  id: number;
  title: string;
  description: string;
};