
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";

// ============================================
// CREATE ORDER
// ============================================
export async function createOrderController(request, response) {
  try {
    // Create new order with all details
    let order = new OrderModel({
      userId: request.body.userId,
      products: request.body.products,
      paymentId: request.body.paymentId,
      payment_status: request.body.payment_status,
      delivery_address: request.body.delivery_address,
      totalAmt: request.body.totalAmt,
      date: request.body.date,
    });

    // Check if order creation failed
    if (!order) {
      return response.status(500).json({
        error: true,
        success: false,
        message: "Order Not Found",
      });
    }

    // Update product stock for each product in the order
    for (let i = 0; i < request.body.products.length; i++) {
      await ProductModel.findByIdAndUpdate(
        request.body.products[i].productId,
        {
          countInStock: parseInt(
            request.body.products[i].countInStock -
              request.body.products[i].quantity
          ),
        },
        { new: true }
      );
    }

    // Save order to database
    order = await order.save();

    return response.status(200).json({
      error: false,
      success: true,
      message: "Order Placed",
      order: order,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error creating order",
      success: false,
      error: true,
    });
  }
}

// ============================================
// GET ALL ORDERS WITH PAGINATION AND SEARCH
// ============================================
export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId;

    // Get pagination parameters
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Simple filter - just get user's orders
    let filter = { userId: userId };

    // Count total orders
    const totalOrders = await OrderModel.countDocuments(filter);

    // Get orders with pagination
    // Populate userId and delivery_address to get full details
    const orderlist = await OrderModel.find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .populate("delivery_address") // Get address details
      .populate("userId") // Get user details (name, email, mobile)
      .skip(skip)
      .limit(limit);

    return response.status(200).json({
      error: false,
      success: true,
      message: "Order list",
      orderlist: orderlist,
      pagination: {
        totalOrders: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
        limit: limit,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error fetching orders",
      success: false,
      error: true,
    });
  }
}

// ============================================
// UPDATE ORDER STATUS
// ============================================
export async function updateOrderStatus(request, response) {
  try {
    // Get order ID from URL parameters
    const { id } = request.params;

    // Get new status from request body
    const { order_status } = request.body;

    // Find order by ID and update its status
    const updateOrder = await OrderModel.findByIdAndUpdate(
      id,
      { order_status: order_status },
      { new: true } // Return updated document
    );

    // Check if order was found
    if (!updateOrder) {
      return response.status(404).json({
        message: "Order not found",
        success: false,
        error: true,
      });
    }

    // Send success response
    return response.json({
      message: "Status Updated",
      success: true,
      error: false,
      data: updateOrder,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error updating order status",
      success: false,
      error: true,
    });
  }
}

// ============================================
// TOTAL SALES CONTROLLER
// ============================================
export async function totalSalesController(request, response) {
  try {
    const currentYear = new Date().getFullYear();
    const ordersList = await OrderModel.find();

    let totalSales = 0;
    let monthlySales = [
      {
        name: "JAN",
        totalSales: 0,
      },
      {
        name: "FEB",
        totalSales: 0,
      },
      {
        name: "MAR",
        totalSales: 0,
      },
      {
        name: "APR",
        totalSales: 0,
      },
      {
        name: "MAY",
        totalSales: 0,
      },
      {
        name: "JUN",
        totalSales: 0,
      },
      {
        name: "JUL",
        totalSales: 0,
      },
      {
        name: "AUG",
        totalSales: 0,
      },
      {
        name: "SEP",
        totalSales: 0,
      },
      {
        name: "OCT",
        totalSales: 0,
      },
      {
        name: "NOV",
        totalSales: 0,
      },
      {
        name: "DEC",
        totalSales: 0,
      },
    ];

    for (let i = 0; i < ordersList.length; i++) {
      totalSales = totalSales + parseInt(ordersList[i].totalAmt);
      const str = JSON.stringify(ordersList[i]?.createdAt);
      const year = str.substr(1, 4);
      const monthStr = str.substr(6, 8);
      const month = parseInt(monthStr.substr(0, 2));

      if (currentYear == year) {
        if (month === 1) {
          monthlySales[0] = {
            name: "JAN",
            totalSales: (monthlySales[0].totalSales =
              parseInt(monthlySales[0].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
        if (month === 2) {
          monthlySales[1] = {
            name: "FEB",
            totalSales: (monthlySales[1].totalSales =
              parseInt(monthlySales[1].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
        if (month === 3) {
          monthlySales[2] = {
            name: "MAR",
            totalSales: (monthlySales[2].totalSales =
              parseInt(monthlySales[2].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
        if (month === 4) {
          monthlySales[3] = {
            name: "APR",
            totalSales: (monthlySales[3].totalSales =
              parseInt(monthlySales[3].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
        if (month === 5) {
          monthlySales[4] = {
            name: "MAY",
            totalSales: (monthlySales[4].totalSales =
              parseInt(monthlySales[4].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
        if (month === 6) {
          monthlySales[5] = {
            name: "JUN",
            totalSales: (monthlySales[5].totalSales =
              parseInt(monthlySales[5].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
        if (month === 7) {
          monthlySales[6] = {
            name: "JUL",
            totalSales: (monthlySales[6].totalSales =
              parseInt(monthlySales[6].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
        if (month === 8) {
          monthlySales[7] = {
            name: "AUG",
            totalSales: (monthlySales[7].totalSales =
              parseInt(monthlySales[7].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
        if (month === 9) {
          monthlySales[8] = {
            name: "SEP",
            totalSales: (monthlySales[8].totalSales =
              parseInt(monthlySales[8].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
        if (month === 10) {
          monthlySales[9] = {
            name: "OCT",
            totalSales: (monthlySales[9].totalSales =
              parseInt(monthlySales[9].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
        if (month === 11) {
          monthlySales[10] = {
            name: "NOV",
            totalSales: (monthlySales[10].totalSales =
              parseInt(monthlySales[10].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
        if (month === 12) {
          monthlySales[11] = {
            name: "DEC",
            totalSales: (monthlySales[11].totalSales =
              parseInt(monthlySales[11].totalSales) +
              parseInt(ordersList[i].totalAmt)),
          };
        }
      }
    }

    return response.status(200).json({
      success: true,
      error: false,
      totalSales: totalSales,
      monthlySales: monthlySales,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error updating order status",
      success: false,
      error: true,
    });
  }
}

//TotalUsersController
export async function totalUsersController(request, response) {
  try {
    const users = await UserModel.aggregate([
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {"_id.year": 1, "_id.month":1},
      }
    ]);

     let monthlyUsers = [
      {
        name: "JAN",
        totalSales: 0,
      },
      {
        name: "FEB",
        totalSales: 0,
      },
      {
        name: "MAR",
        totalSales: 0,
      },
      {
        name: "APR",
        totalSales: 0,
      },
      {
        name: "MAY",
        totalSales: 0,
      },
      {
        name: "JUN",
        totalSales: 0,
      },
      {
        name: "JUL",
        totalSales: 0,
      },
      {
        name: "AUG",
        totalSales: 0,
      },
      {
        name: "SEP",
        totalSales: 0,
      },
      {
        name: "OCT",
        totalSales: 0,
      },
      {
        name: "NOV",
        totalSales: 0,
      },
      {
        name: "DEC",
        totalSales: 0,
      },
    ];

    for(let i = 0; i< users.length; i++){
      if(users[i]?._id?.month === 1){
        monthlyUsers[0]= {
          name: 'JAN',
          TotalUsers: users[i].count
        }
      }
       if(users[i]?._id?.month === 2){
        monthlyUsers[2]= {
          name: 'FEB',
          TotalUsers: users[i].count
        }
      }
       if(users[i]?._id?.month === 3){
        monthlyUsers[2]= {
          name: 'MAR',
          TotalUsers: users[i].count
        }
      }
       if(users[i]?._id?.month === 4){
        monthlyUsers[3]= {
          name: 'APR',
          TotalUsers: users[i].count
        }
      }
       if(users[i]?._id?.month === 5){
        monthlyUsers[4]= {
          name: 'MAY',
          TotalUsers: users[i].count
        }
      }
       if(users[i]?._id?.month === 6){
        monthlyUsers[5]= {
          name: 'JUN',
          TotalUsers: users[i].count
        }
      }
       if(users[i]?._id?.month === 7){
        monthlyUsers[6]= {
          name: 'JUL',
          TotalUsers: users[i].count
        }
      }
       if(users[i]?._id?.month === 8){
        monthlyUsers[7]= {
          name: 'AUG',
          TotalUsers: users[i].count
        }
      }
       if(users[i]?._id?.month === 9){
        monthlyUsers[8]= {
          name: 'SEP',
          TotalUsers: users[i].count
        }
      }
       if(users[i]?._id?.month === 10){
        monthlyUsers[9]= {
          name: 'OCT',
          TotalUsers: users[i].count
        }
      }
       if(users[i]?._id?.month === 11){
        monthlyUsers[10]= {
          name: 'NOV',
          TotalUsers: users[i].count
        }
      }
       if(users[i]?._id?.month === 12){
        monthlyUsers[11]= {
          name: 'DEC',
          TotalUsers: users[i].count
        }
      }
    }
      return response.status(200).json({
      TotalUsers: monthlyUsers,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Error updating order status",
      success: false,
      error: true,
    });
  }
}
