import { Router } from "express";
import auth from "../middlewares/auth.js";
import { createOrderController, getOrderDetailsController, totalSalesController, totalUsersController, updateOrderStatus } from "../controllers/order.controller.js";


const orderRouter = Router();


orderRouter.post("/create", auth, createOrderController);
orderRouter.get("/Order-list", auth, getOrderDetailsController);
orderRouter.put("/Order-status/:id", auth, updateOrderStatus );
orderRouter.get("/sales", auth, totalSalesController );
orderRouter.get("/users", auth, totalUsersController );


export default orderRouter;