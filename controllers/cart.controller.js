import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";

export async function addToCartItemController(request, response) {
  try {
    const userId = request.userId;
    const { productId } = request.body;

    if (!productId) {
      return response.status(402).json({
        message: "Provide ProductId",
        success: false,
        error: true,
      });
    }

    const CheckItemCart = await CartProductModel.findOne({
      userId: userId,
      productId: productId,
    });

    if (CheckItemCart) {
      return response.status(400).json({
        message: "Item already in Cart",
      });
    }

    const cartItem = new CartProductModel({
      quantity: qty,
      userId: userId,
      productId: productId,
    });

    const save = await cartItem.save();

    const updateCartUser = await UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          shopping_cart: productId,
        },
      }
    );

    return response.status(200).json({
      data: save,
      message: "Item add successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

export async function getCartItemController(request, response) {
  try {
    const userId = request.userId;

    const cartItem = await CartProductModel.find({
      userId: userId,
    }).populate("productId");

    return response.json({
      data: cartItem,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

export async function updateCartItemQtyController(request, response) {
  try {
    const userId = request.userId;
    const { _id, qty } = request.body;

    if (!_id || !qty) {
      return response.status(400).json({
        message: "provide _id , qty",
      });
    }

    const updateCartitem = await CartProductModel.updateOne(
      {
        _id: _id,
        userId: userId,
      },
      {
        quantity: qty,
      }
    );

    return response.json({
      message: "Update cart",
      success: true,
      error: false,
      data: updateCartitem,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

export async function deleteCartItemQtyController(request, response) {
  try {
    const userId = request.userId;
    const { _id, productId } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "provide _id",
        error: true,
        success: false,
      });
    }

    const deleteCartItem = await CartProductModel.deleteOne({
      _id: _id,
      userId: userId,
    });

    if (!deleteCartItem) {
      return response.status(400).json({
        message: "The product in the cart is not found",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({
      _id: userId,
    });

    const cartItems = user?.shopping_cart;

    const updatedUserCart = [
      ...cartItems.slice(0, cartItems.indexOf(productId)),
      ...cartItems.slice(cartItems.indexOf(productId) + 1),
    ];

    user.shopping_cart = updatedUserCart;

    await user.save();

    return response.json({
      message: "Item remove",
      success: true,
      error: false,
      data: deleteCartItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}
