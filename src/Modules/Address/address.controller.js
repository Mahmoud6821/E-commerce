import { ErrorClass } from "../../Utils/index.js";
import { Address } from "../../../DB/Models/index.js";
import axios from "axios";

/**
 * @POST "/addresss/Add address"  create new address
 */

export const addAddress = async (req, res, next) => {
  const userId = req.authUser._id;
  const {
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    setAsDefault,
  } = req.body;

  const newAddress = new Address({
    userId,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    isDefault: [true, false].includes(setAsDefault) ? setAsDefault : false,
  });

  const cities = await axios.get(
    "https://api.api-ninjas.com/v1/city?country=EG&limit=30",
    {
      headers: {
        "X-API-KEY": process.env.CITY_API_KEY,
      },
    }
  );
  const doesCityExist = cities.data.find((c) => c.name === city);
  if(!doesCityExist){
    return next(new ErrorClass("City not found",404,"City not found"));
  }

  if (newAddress.isDefault) {
    await Address.updateOne({ userId, isDefault: true }, { isDefault: false });
  }

  const address = await newAddress.save();
  res
    .status(201)
    .json({ status: "success", message: "address created", data: address });
};

/**
 * @PUT "/addresss/:addressId"  update address
 */
export const updateAddress = async (req, res, next) => {
  const { addressId } = req.params;
  const userId = req.authUser._id;
  const {
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    setAsDefault,
  } = req.body;

  const address = await Address.findOne({
    _id: addressId,
    userId,
    isMarkedAsDeleted: false,
  });
  if (!address) {
    return next(new ErrorClass("address not found", 404, "address not found"));
  }

  if (country) address.country = country;
  if (city) address.city = city;
  if (postalCode) address.postalCode = postalCode;
  if (buildingNumber) address.buildingNumber = buildingNumber;
  if (floorNumber) address.floorNumber = floorNumber;
  if (addressLabel) address.addressLabel = addressLabel;
  if ([true, false].includes(setAsDefault)) {
    address.isDefault = setAsDefault;
    await Address.updateOne({ userId, isDefault: true }, { isDefault: false });
  }

  await address.save();

  res
    .status(200)
    .json({ status: "success", message: "address updated", data: address });
};

/**
 * @DELETE "/addresss/:addressId"  soft delete address
 */
export const softDeletaAddress = async (req, res, next) => {
  const { addressId } = req.params;
  const userId = req.authUser._id;
  const deletedAddress = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    { isMarkedAsDeleted: true, isDefault: false },
    { new: true }
  );

  if (!deletedAddress) {
    return next(new ErrorClass("address not found", 404, "address not found"));
  }
  res.status(200).json({
    status: "success",
    message: "address will be permanently deleted in 30 days",
    data: deletedAddress,
  });
};

export const getAllAddresses = async (req, res, next) => {
  const userId = req.authUser._id;
  const addresses = await Address.find({ userId, isMarkedAsDeleted: false });
  res.status(200).json({
    status: "success",
    message: "addresses found",
    data: addresses,
  });
};
