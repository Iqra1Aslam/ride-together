import { User } from "../models/user.models.js";
import { ApiResponse } from "../services/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Driver } from "../models/driver.models.js";
import {PublishRide} from '../models/publishRide.models.js'
import { Vehicle } from "../models/driver.models.js";
export const admin = {
 
   setAdminRole : asyncHandler(async (req, res) => {
    console.log("Request body:", req.body); // Log the incoming request body
    const { userId } = req.body; // The ID of the user to be made admin

    // Check if userId is provided
    if (!userId) {
        return res.status(400).json(new ApiResponse(400, {}, 'User ID not provided'));
    }

    // Existing admin check
    const existingAdmin = await User.findOne({ role: 'admin', is_admin: true });
    if (existingAdmin) {
        return res.status(400).json(new ApiResponse(400, {}, 'An admin already exists. Only one admin is allowed.'));
    }

    // Find the user to be updated
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, {}, 'User not found.'));
    }

    // Set the user's role to 'admin' and update is_admin field
    user.role = 'admin';
    user.is_admin = true;
    await user.save();

    return res.status(200).json(new ApiResponse(200, { user }, 'User has been successfully set as admin.'));
}),
updateAdmin: asyncHandler(async (req, res) => {

  const { id } = req.params;
  const updatedData = req.body;
  const updatedAdmin = await User.findByIdAndUpdate(id, updatedData, { new: true });
  res.status(200).json(new ApiResponse(200, updatedAdmin, 'Passenger details updated successfully'));
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
getAllVehicles: asyncHandler(async (req, res) => {
  try {
      // Fetch all vehicles from the database
      const vehicles = await Vehicle.find();

      res.status(200).json(new ApiResponse(200, { vehicles }, 'All vehicles fetched successfully'));
  } catch (error) {
      console.error('Error fetching vehicles:', error.message);
      res.status(500).json(new ApiResponse(500, {}, 'Failed to fetch vehicles'));
  }
}),
 rides : asyncHandler(async (req, res) => {
    try {
      const rides = await PublishRide.find(); // Fetches all rides from the database
      res.status(200).json(new ApiResponse(200, { rides }, 'All rides retrieved successfully'));
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error', error });
    }
  })
  
  
}