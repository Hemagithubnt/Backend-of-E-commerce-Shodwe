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
      landmark,
      addressType,
    } = request.body;
    const userId = request.userId;

    if (
      !address_line1 ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !mobile ||
      !landmark ||
      !addressType    
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
      landmark,
      addressType,
      userId,
    });

    const savedAddress = await address.save();

    // Update user with new address
    await UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          address_details: savedAddress,
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
    const userId = request?.query?.userId;

    if (!userId) {
      return response.status(400).json({
        message: "User ID is required",
        error: true,
        success: false,
      });
    }

    const addresses = await AddressModel.find({ userId });

    // REMOVED THE DATABASE WRITE OPERATION
    // No need to update user on every GET request
    // The address is already linked via userId in AddressModel

    return response.status(200).json({
      message: "Address fetched successfully",
      data: addresses,
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

export async function deleteAddressController(request, response) {
  try {
    const userId = request.userId;
    const _id = request.params.addressId;  // ✅ Match the route param name

    if (!_id) {
      return response.status(400).json({
        message: "provide _id",
        error: true,
        success: false,
      });
    }

    const deleteItem = await AddressModel.deleteOne({
      _id: _id,
      userId: userId,
    });

    if (deleteItem.deletedCount === 0) {  // ✅ Check deletedCount
      return response.status(400).json({ 
        message: "Address not found", 
        error: true,
        success: false 
      });
    }

    return response.json({
      message: "Address deleted",
      success: true,
      error: false,
      data: deleteItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

export async function getSingleAddressController(request, response) {
  try {
    const  Id  = request.params.id
    const  address = await AddressModel.findOne({ _id: Id });
    if (!address) {
      return response.status(404).json({
        message: "Address not found",
        success: false,
        error: true,
      });
    }
    return response.status(200).json({
      message: "Address fetched successfully",
      address: address,
      success: true,
      error: false,
    });
  }catch (error) {
    return response.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

export async function EditAddress(request, response) {
  try {
    const Addressid = request.params.id;
    if (!Addressid) {
      return response.status(400).json({
        message: "Address ID is required",
        error: true,
        success: false,
      })
    }

    const {
      address_line1,
      city,
      state,
      pincode,
      country,
      mobile,
      landmark,
      addressType,
    } = request.body;
    

    const address = await AddressModel.findByIdAndUpdate(
      Addressid,
      {
        address_line1: address_line1,
        city: city,
        state: state,
        pincode: pincode,
        country: country,
        mobile: mobile,
        landmark: landmark,
        addressType: addressType, 
      },
      { new: true }
    );

    return response.status(200).json({
      message: "Address Updated successfully",
      error: false,
      success: true,
      address: address,
    });
  }catch (error) {
    return response.status(500).json({
      message: error.message || "Error uploading avatar",
      error: true,
      success: false,
    });
  }
}
