import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addAddressController, getAddressController } from "../controllers/address.controller.js";


const addressRouter = Router();

addressRouter.post("/addAddress", auth, addAddressController);
addressRouter.get("/get", auth, getAddressController);
// addressRouter.put("/selectAddress/:id", auth, selectAddressController);

export default addressRouter;