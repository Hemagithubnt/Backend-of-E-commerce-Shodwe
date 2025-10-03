import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";

export async function addAddressController(request, response) {
  try {
    const {
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      status,
      selected,
    } = request.body;
    const userId = request.userId;
    if (
      !address_line1 ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !mobile ||
      !status
    ) {
      return response.status(400).json({
        message: "All fields are required",
        error: true,
        success: false,
      });
    }
    const address = new AddressModel({
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      status,
      userId,
      selected,
    });
    const savedAddress = await address.save();

    const updateAddress = await UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          address_details: savedAddress._id,
        },
      }
    );

    return response.status(200).json({
      message: "Address added successfully",
      data: savedAddress,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAddressController(request, response) {
  try {
    const address = await AddressModel.find({ userId: request?.query?.userId });
    if (!address) {
      return response.status(404).json({
        message: "No address found",
        error: true,
        success: false,
      });
    } else {
      const updateUser = await UserModel.updateOne(
        { _id: request?.query?.userId },
        {
          $push: {
            address: address?._id,
          },
        }
      );
    }

    return response.status(200).json({
      message: "Address fetched successfully",
      data: address,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// export async function selectAddressController(request, response) {
//   try {
//     const userId = request.userid; //auth middleware
//     const address = await AddressModel.find({
//       _id: request.params.id,
//       userId: userId,
//     });

//       const updateAddress = await AddressModel.find(
//         request.params.id,
//         {
//           selected: request?.body?.selected,
//         },
//         { new: true }
//       );

//     if (!address) {
//       return response.status(404).json({
//         message: "No address found",
//         error: true,
//         success: false,
//       });
//     } else {
//       const updateAddress = await AddressModel.findByIdAndUpdate(
//         request.params.id,
//         {
//           selected: request?.body?.selected,
//         },
//         { new: true }
//       );
//       return response.status(200).json({
//         error: false,
//         success: true,
//         address: updateAddress,
//       });
//     }
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || "Error uploading avatar",
//       error: true,
//       success: false,
//     });
//   }
// }
