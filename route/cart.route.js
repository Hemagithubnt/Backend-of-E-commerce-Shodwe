import { Router } from "express";
import auth from "../middlewares/auth.js";
import { 
  addToCartItemController, 
  deleteCartItemQtyController, 
  emptyCartController, 
  getCartItemController, 
  updateCartItemQtyController 
} from "../controllers/cart.controller.js";

const cartRouter = Router();

cartRouter.post("/add", auth, addToCartItemController);
cartRouter.get("/get", auth, getCartItemController);

// Change PUT to POST to use editData
cartRouter.put("/update-cart-item", auth, updateCartItemQtyController);

cartRouter.delete("/delete-cart-item/:id", auth, deleteCartItemQtyController);
cartRouter.delete("/emptyCart/:id", auth, emptyCartController);

export default cartRouter;
