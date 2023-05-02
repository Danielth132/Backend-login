import { Router } from "express";

import CartService from "../services/db/controllers/carts.service.js";
import ProductService from "../services/db/controllers/products.service.js";

const router = Router();

const cartService = new CartService();
const productService = new ProductService();

router.get("/", async (req, res) => {
  res.render("home", {});
});

/***  Obtiene Todos los productos y los muestra por navegador  ***/
router.get("/products", async (req, res) => {
  let limit = req.query.limit;
  let page = req.query.page;
  let sort = req.query.sort;
  let query = req.query.query;
  
  let prod = await productService.getProducts(limit, page, sort, query);
  console.log(prod)
  prod.prevLink = prod.hasPrevPage
    ? `http://localhost:8080/products?page=${prod.prevPage}`
    : "";
  prod.nextLink = prod.hasNextPage
    ? `http://localhost:8080/products?page=${prod.nextPage}`
    : "";
  prod.isValid = !(page <= 0 || page > prod.totalPages);
  
  res.render("products", prod);
});

/***  Obtiene Todos los productos del Carrito indicado y los muestra por navegador  ***/
router.get("/carts/:cid", async (req, res) => {
  let carts = await cartService.getCartById(req.params.cid);

  res.render("productsByCart", carts);
});

export default router;
