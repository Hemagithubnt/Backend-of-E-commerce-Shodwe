import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addAddressController, deleteAddressController, EditAddress, getAddressController, getSingleAddressController } from "../controllers/address.controller.js";


const addressRouter = Router();

addressRouter.post("/addAddress", auth, addAddressController);
addressRouter.get("/get", auth, getAddressController);
addressRouter.get("/get/:id", auth, getSingleAddressController);
addressRouter.delete("/delete/:addressId", auth , deleteAddressController);
addressRouter.put("/:id", auth , EditAddress);

export default addressRouter;