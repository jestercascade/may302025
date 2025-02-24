import { cache } from "react";
import { getProducts } from "@/actions/get/products";

type GetProductsOptionsType = {
  ids?: string[];
  fields?: string[];
  visibility?: VisibilityType;
  category?: string;
};

export const getCachedProducts = cache(
  async (options: GetProductsOptionsType) => {
    return await getProducts(options);
  }
);
