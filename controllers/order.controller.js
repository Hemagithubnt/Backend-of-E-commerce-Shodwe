import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";


export async function createOrderController(request, response) {
 try {
    let order = new OrderModel({
          userId: request.body.userId,
          products: request.body.products,
          paymentId: request.body.paymentId,
          payment_status:request.body.payment_status,
          delivery_address: request.body.delivery_address,
          totalAmt: request.body.totalAmt,
          date: request.body.date,
    });

    if(!order){
        response.status(500).json({
            error: true,
            success: false,
            message: "Order Not Found"
        })
    }

    for (let i = 0; i < request.body.products.length; i++){
        await ProductModel.findByIdAndUpdate(
            request.body.products[i].productId,
            {
                countInStock: parseInt(request.body.products[i].countInStock - request.body.products[i].quantity),
            },
            {new: true}
        );
    }

    order = await order.save();

    return response.status(200).json({
            error: false,
            success: true,
            message: "Order Placed",
            order: order
        })
    
 } catch (error) {
    console.error("Error in createProduct:", error);
    return response.status(500).json({
      message: error.message || "Error creating/updating product",
      success: false,
      error: true,
    });
  }
}

export async function getOrderDetailsController(request, response) {
try {
    const userId = request.userId;
    const orderlist = await OrderModel.find({userId: userId}).sort({createdAt: -1}).
    populate('delivery_address userId')

       return response.status(200).json({
            error: false,
            success: true,
            message: "Order list",
            orderlist: orderlist
        })

} catch (error) {
    console.error("Error in createProduct:", error);
    return response.status(500).json({
      message: error.message || "Error creating/updating product",
      success: false,
      error: true,
    });
  }
}