import CartProductModel from "../models/cart.model.js";


export async function addToCartItemController(request, response) {
  try {
    const userId = request.userId;
    const { productTitle,image,rating,price,quantity,subTotal,productId,countInStock,brand,size,weight,ram,
      oldPrice,discount } = request.body;

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
      productTitle: productTitle,
      image: image,
      rating: rating,
      price:price,
      quantity:quantity,
      subTotal:subTotal,
      productId:productId,
      countInStock:countInStock,
      userId:userId,
      brand:brand,
      size:size,
      weight:weight,
      ram:ram,
      oldPrice:oldPrice,
      discount:discount,
      
    });

    const save = await cartItem.save();

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

    const cartItems = await CartProductModel.find({
      userId: userId,
    });

    return response.json({
      data: cartItems,
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
    const { _id, qty, subTotal, size, weight, ram } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "provide _id",
      });
    }

    // Build update object dynamically
    const updateFields = {};
    
    if (qty !== undefined) updateFields.quantity = qty;
    if (subTotal !== undefined) updateFields.subTotal = subTotal;
    if (size !== undefined) updateFields.size = size;
    if (weight !== undefined) updateFields.weight = weight;
    if (ram !== undefined) updateFields.ram = ram;

    const updateCartitem = await CartProductModel.updateOne(
      {
        _id: _id,
        userId: userId,
      },
      updateFields,
      { new: true }
    );

    return response.json({
      message: "Update cart",
      success: true,
      error: false,
      data: updateCartitem,
    });
  } catch (error) {
    console.error("Error in updateCartItemQtyController:", error);
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
    const { id } = request.params;

    if (!id) {
      return response.status(400).json({
        message: "provide _id",
        error: true,
        success: false,
      });
    }

    const deleteCartItem = await CartProductModel.deleteOne({
      _id: id,
      userId: userId,
    });

    if (deleteCartItem.deletedCount === 0) {
      return response.status(400).json({
        message: "The product in the cart is not found",
        error: true,
        success: false,
      });
    }

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
