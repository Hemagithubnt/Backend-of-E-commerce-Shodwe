import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, updateCartItemQtyController } from "../controllers/cart.controller.js";

const cartRouter = Router();

// Add product to cart
cartRouter.post("/add", auth, addToCartItemController);

//  Protect the get route with auth
cartRouter.get("/get", auth, getCartItemController);

cartRouter.put("/update-qty", auth, updateCartItemQtyController);
cartRouter.delete("/delete-cart-item/:id", auth, deleteCartItemQtyController);

export default cartRouter;
