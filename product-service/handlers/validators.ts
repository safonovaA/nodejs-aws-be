import { Product } from "../constants/product";

export function validateRequiredFieldsPayload(payload: Product) {
  const {
    title, price,
    author, published,
    count,
  } = payload;

  return title && price && author && published && count;
}