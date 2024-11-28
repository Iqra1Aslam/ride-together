import { User } from "../models/user.models.js";
import { ApiResponse } from "../services/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Driver } from "../models/driver.models.js";
import {PublishRide} from '../models/publishRide.models.js'
import { Vehicle } from "../models/driver.models.js";
export const admin = {
 
   setAdminRole : asyncHandler(async (req, res) => {
    
    const { userId } = req.body; 
    
    if (!userId) {
        return res.status(400).json(new ApiResponse(400, {}, 'User ID not provided'));
    }

    const existingAdmin = await User.findOne({ role: 'admin', is_admin: true });
    if (existingAdmin) {
        return res.status(400).json(new ApiResponse(400, {}, 'An admin already exists. Only one admin is allowed.'));
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, {}, 'User not found.'));
    }

    user.role = 'admin';
    user.is_admin = true;
    await user.save();

    return res.status(200).json(new ApiResponse(200, { user }, 'User has been successfully set as admin.'));
}),
// Get all passengers
getAllPassengers: asyncHandler(async (req, res) => {
  const passengers = await User.find({ role: 'passenger' });
  if (passengers.length === 0) {
      return res.status(404).json(new ApiResponse(404, {}, 'No passengers found'));
  }
  res.status(200).json(new ApiResponse(200, { passengers }, 'All passengers retrieved successfully'));
}),

// Delete a passenger
 deletePassenger : asyncHandler(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json(new ApiResponse(200, {}, 'Passenger deleted successfully'));
}),

// Update passenger details
 updatePassenger: asyncHandler(async (req, res) => {

    const { id } = req.params;
    const updatedData = req.body;
    const updatedPassenger = await User.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json(new ApiResponse(200, updatedPassenger, 'Passenger details updated successfully'));
}),
getAllDrivers: asyncHandler(async (req, res) => {
    const drivers = await Driver.find();
    if (drivers.length === 0) {
        return res.status(404).json(new ApiResponse(404, {}, 'No drivers found'));
    }
    res.status(200).json(new ApiResponse(200, { drivers }, 'All drivers retrieved successfully'));
  }),
  deleteDriver : asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Driver.findByIdAndDelete(id);
    res.status(200).json(new ApiResponse(200, {}, 'Driver deleted successfully'));
}),

updateDriver: asyncHandler(async (req, res) => {

    const { id } = req.params;
    const updatedData = req.body;
    const updatedDriver = await Driver.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json(new ApiResponse(200, updatedDriver, 'Driver details updated successfully'));
}), 
}