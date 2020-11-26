import 'source-map-support/register';
import { getProducts } from './handlers/getProducts';
import { getProductById } from './handlers/getProductById';
import { postProduct } from './handlers/postProduct';
import { catalogBatchProcess } from './handlers/catalogBatchProcess';

export {
  getProducts,
  getProductById,
  postProduct,
  catalogBatchProcess,
}