import { Router } from "express";

import CartService from "../services/db/controllers/carts.service.js";
import ProductService from "../services/db/controllers/products.service.js";

const router = Router();

const cartService = new CartService();
const productService = new ProductService();

function auth(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    return (
      res.render("sinAcceso", {})
    );
  }
}

router.get("/", async (req, res) => {
  res.render("home", {});
});

/***  Obtiene Todos los productos y los muestra por navegador  ***/
router.get("/products", auth, async (req, res) => {
  let limit = req.query.limit;
  let page = req.query.page;
  let sort = req.query.sort;
  let query = req.query.query;
  
  let usr = req.session.user;
  let prod = await productService.getProducts(limit, page, sort, query);
  prod.prevLink = prod.hasPrevPage
    ? `http://localhost:8080/products?page=${prod.prevPage}`
    : "";
  prod.nextLink = prod.hasNextPage
    ? `http://localhost:8080/products?page=${prod.nextPage}`
    : "";
  prod.isValid = !(page <= 0 || page > prod.totalPages);
  
  res.render("products", { ...prod, usr });
});

/***  Obtiene Todos los productos del Carrito indicado y los muestra por navegador  ***/
router.get("/carts/:cid", auth, async (req, res) => {
  let usr = req.session.user;
  let carts = await cartService.getCartById(req.params.cid);

  res.render("productsByCart", { ...carts, usr });
});

export default router;
