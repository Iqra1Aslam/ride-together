import { Driver, Vehicle } from "../../models/driver.models.js";

import {PublishRide} from "../../models/publishRide.models.js"
import mongoose from 'mongoose';

import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { upload_single_on_cloudinary, upload_multiple_on_cloudinary } from "../../utils/cloudinary.js";

import Joi from 'joi'
import { User } from "../../models/user.models.js";

export const vehicle = {
  vehicle_details_add: asyncHandler(async (req, res) => {
    const { car_type, vehicle_model, vehicle_plate_number, number_of_seats, vehicle_color } = req.body;
    const driver = req.user_id;

    // Validation schema
    const vehicle_validationSchema = Joi.object({
        car_type: Joi.string().required(),
        vehicle_model: Joi.string().required(),
        vehicle_plate_number: Joi.string().required(),
        number_of_seats: Joi.number().integer().min(1).required(),
        
        vehicle_color: Joi.string().required()
    });

    // Validate the request body
    const { error } = vehicle_validationSchema.validate(req.body);
    if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message));

   

    // Create a new vehicle entry
    const vehicle = await Vehicle.create({
        driver,
        car_type,
        vehicle_model,
        vehicle_plate_number,
        number_of_seats,
        vehicle_color,
       
    });

    // Send response
    return res.status(201).json(new ApiResponse(201, { vehicle }, 'Vehicle details added successfully'));
}),
    vehicle_images_upload: asyncHandler(async (req, res) => {
        const { vehicle_image, vehicle_dox_image } = req.files
        const user_id = req.user_id

        const images = [
            vehicle_image[0].path,
            vehicle_dox_image[0].path
        ]
        const uploaded_images = await upload_multiple_on_cloudinary(images)
        console.log(`uploaded_images: ${uploaded_images}`)
        const vehicle = await Vehicle.findByIdAndUpdate(user_id, { vehicle_image: uploaded_images[0].url, vehicle_dox_image: uploaded_images[1].url }, { new: true })

        res.status(201).json(new ApiResponse(201, vehicle, 'vehicle info added successfully', true))
    }),

    vehicle_verification: asyncHandler(async (req, res) => {
        const { is_verified } = req.body;
        const { vehicleId } = req.params;

        const vehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            { is_verified: is_verified },
            { new: true }
        );

        if (!vehicle) {
            return res.status(404).json(new ApiResponse(404, {}, 'Vehicle not found.'));
        }

        res.status(200).json(new ApiResponse(200, { vehicle }, 'Vehicle verification status updated successfully'));
    }),

    //     try {
    //         const { passengerLocation, requestedTime } = req.body;
    
    //         // Validate input
    //         if (!passengerLocation || !requestedTime) {
    //             return res.status(400).json({ message: 'Passenger location and requested time are required.' });
    //         }
    
    //         // Get the current date and construct the requested date with the time
    //         const currentDate = new Date();
    //         const dateString = currentDate.toDateString(); // e.g., "Sat Aug 24 2024"
    //         const requestedDateString = `${dateString} ${requestedTime}`;
    //         const requestedDate = new Date(requestedDateString);
    
    //         // Define the time range: 15 minutes before and after the requested time
    //         const timeBefore = new Date(requestedDate);
    //         timeBefore.setMinutes(requestedDate.getMinutes() - 15);
    
    //         const timeAfter = new Date(requestedDate);
    //         timeAfter.setMinutes(requestedDate.getMinutes() + 15);
    
    //         // Debugging information
    //         console.log('Passenger Location:', passengerLocation);
    //         console.log('Requested Time:', requestedTime);
    //         console.log('Time Before:', timeBefore.toISOString());
    //         console.log('Time After:', timeAfter.toISOString());
    
    //         // Use $geoNear to find nearby rides within 5km and the specified time range
    //         const nearbyRides = await PublishRide.aggregate([
    //             {
    //                 $geoNear: {
    //                     near: passengerLocation, // The passenger's location as a GeoJSON point
    //                     distanceField: 'distance', // The field in the results that contains the calculated distance
    //                     maxDistance: 5000, // Distance in meters (5km)
    //                     spherical: true, // Enable spherical calculations for geospatial data
    //                     key: 'pickup_location', // The field in the collection that stores location data
    //                 },
    //             },
    //             {
    //  
    //         }
    
    //         res.json(nearbyRides);
    //     } catch (err) {
    //         console.error('Error finding nearby rides:', err);
    //         res.status(500).json({ error: 'Failed to find nearby rides' });
    //     }
    // }),
    
      
    is_nearestVehicle: asyncHandler(async (req, res) => {
      try {
        const { passengerLocation, requestedTime } = req.body;
    
        // Validate input
        if (!passengerLocation || !requestedTime) {
          return res.status(400).json({ message: 'Passenger location and requested time are required.' });
        }
    
        // Construct the requested date with the time
        const currentDate = new Date();
        const dateString = currentDate.toDateString();
        const requestedDateString = `${dateString} ${requestedTime}`;
        const requestedDate = new Date(requestedDateString);
    
        // Define the time range: 15 minutes before and after the requested time
        const timeBefore = new Date(requestedDate);
        timeBefore.setMinutes(requestedDate.getMinutes() - 15);
    
        const timeAfter = new Date(requestedDate);
        timeAfter.setMinutes(requestedDate.getMinutes() + 15);
    
        // Use $geoNear to find nearby rides within 5km and the specified time range
        const nearbyRides = await PublishRide.aggregate([
          {
            $geoNear: {
              near: passengerLocation,
              distanceField: 'distance',
              maxDistance: 5000,
              spherical: true,
              key: 'pickup_location',
            },
          },
          {
            $match: {
              starttime: {
                $gte: timeBefore,
                $lte: timeAfter,
              },
              status: 'waiting',
            },
          },
          // Lookup vehicle details
          {
            $lookup: {
              from: 'vehicles',
              localField: 'driverId',
              foreignField: 'driver',
              as: 'vehicleDetails',
            },
          },
          {
            $unwind: {
              path: '$vehicleDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          // Lookup driver details
          {
            $lookup: {
              from: 'users', // Collection name is 'drivers'
              localField: 'driverId', // Referencing the driverId from PublishRide
              foreignField: 'drivers', // Matching with the _id of the drivers collection
              as: 'driverDetails', // Output array field to store joined data
            },
          },
          {
            $unwind: {
              path: '$driverDetails',
              preserveNullAndEmptyArrays: true, // Allow rides without driver details
            },
          },
          {
            $project: {
              driverId: 1,
              pickup_location: 1,
              dropLocation: 1,
              date: 1,
              starttime: 1,
              endtime: 1,
              numSeats: 1,
              pricePerSeat: 1,
              status: 1,
              distance: 1,
              'vehicleDetails.vehicle_model': 1,
              'vehicleDetails.vehicle_color': 1,
              'vehicleDetails.vehicle_plate_number': 1,
              'vehicleDetails.number_of_seats': 1,
              'vehicleDetails.vehicle_image': 1,
              'driverDetails.name': 1, // Include the driver's name
              'driverDetails.phone': 1, // Include the driver's phone
            },
          },
        ]);
    
        // Log nearby rides found
        console.log('Nearby Rides:', nearbyRides);
    
        // Respond with nearby rides or an error if none found
        if (nearbyRides.length === 0) {
          return res.status(404).json({ message: 'No rides found nearby' });
        }
    
        res.json(nearbyRides);
      } catch (err) {
        console.error('Error finding nearby rides:', err);
        res.status(500).json({ error: 'Failed to find nearby rides' });
      }
    }),
    
    
    
    
    

    
    
 
      publish_ride: asyncHandler(async (req, res) => {
        const { pickup_location, dropLocation, date, starttime, endtime, numSeats, pricePerSeat } = req.body;
        const driverId = req.user_id; // Assuming user ID is stored in req.user_id
      
        // Validate the input
        if (!pickup_location || !dropLocation || !date || !starttime || !endtime || !numSeats || !pricePerSeat) {
          return res.status(400).json(new ApiResponse(400, 'All fields are required'));
        }
      
        // Validate date format (Sat Aug 24 2024)
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          return res.status(400).json(new ApiResponse(400, 'Invalid date format. Use "Sat Aug 24 2024".'));
        }
      
        // Validate time format (HH:MM AM/PM)
        const timeRegex = /^(\d{1,2}:\d{2})(\s?[APap][Mm])?$/;
        if (!timeRegex.test(starttime) || !timeRegex.test(endtime)) {
          return res.status(400).json(new ApiResponse(400, 'Invalid time format. Use HH:MM AM/PM.'));
        }
      
        // Combine the date and time into Date objects
        const startTimeString = `${date} ${starttime}`;
        const endTimeString = `${date} ${endtime}`;
        const startTimeObj = new Date(startTimeString);
        const endTimeObj = new Date(endTimeString);
      
        // Validate the parsed Date objects
        if (isNaN(startTimeObj.getTime()) || isNaN(endTimeObj.getTime())) {
          return res.status(400).json(new ApiResponse(400, 'Invalid start or end time.'));
        }
      
        // Fetch the vehicle associated with the driver
        const vehicle = await Vehicle.findOne({ driver: driverId });
        if (!vehicle) {
          return res.status(404).json(new ApiResponse(404, 'No vehicle found for this driver.'));
        }
      
        // Create a new ride offer using the PublishRide model
        const ride = new PublishRide({
          pickup_location,
          dropLocation,
          date: dateObj,
          starttime: startTimeObj,
          endtime: endTimeObj,
          numSeats,
          pricePerSeat,
          status: 'waiting',
          driverId: driverId,
          vehicleId: vehicle._id, // Link the vehicle's ID
        });
      
        // Save the ride to the database
        await ride.save();
      
        // Format date and time for the response
        const formattedDate = dateObj.toDateString(); // Sat Aug 24 2024
        const formattedStartTime = startTimeObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        });
        const formattedEndTime = endTimeObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        });
      
        return res.status(201).json(new ApiResponse(201, {
          ride: {
            ...ride.toObject(),
            date: formattedDate,
            starttime: formattedStartTime,
            endtime: formattedEndTime,
          },
        }, 'Ride created successfully'));
      }),
      
      send_request: asyncHandler(async (req, res) => {
        const { driverId, passengerId, pickupLocation, requestedDate, requestedTime } = req.body;
    
        if (!mongoose.Types.ObjectId.isValid(driverId) || !mongoose.Types.ObjectId.isValid(passengerId)) {
            return res.status(400).json({ message: 'Invalid driverId or passengerId' });
        }
    
        const driver = await User.findById(driverId);
        const passenger = await User.findById(passengerId);
    
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
    
        if (!passenger) {
            return res.status(404).json({ message: 'Passenger not found' });
        }
    
        const dateObj = new Date(requestedDate);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ message: 'Invalid date format. Use a valid date.' });
        }
    
        const timeRegex = /^(\d{1,2}:\d{2})(\s?[APap][Mm])?$/;
        if (!timeRegex.test(requestedTime)) {
            return res.status(400).json({ message: 'Invalid time format. Use HH:MM AM/PM.' });
        }
    
        const requestedDateTimeString = `${requestedDate} ${requestedTime}`;
        const requestedDateTimeObj = new Date(requestedDateTimeString);
        if (isNaN(requestedDateTimeObj.getTime())) {
            return res.status(400).json({ message: 'Invalid requested time.' });
        }
    
        const ride = await PublishRide.findOne({
            driverId: driverId,
            status: 'waiting',
        });
    
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }
    
        ride.status = 'requested';
        ride.passengerId = passengerId;
        ride.pickupLocation = pickupLocation;
        ride.requestedDate = dateObj;
        ride.requestedTime = requestedDateTimeObj;
    
        await ride.save();
    
        return res.status(200).json({ message: 'Request sent successfully', ride });
    }),
    


    

fetch_ride: asyncHandler(async (req, res) => {
    
    const passengers = await publishRide.find({ status: 'waiting' });
    res.json(passengers);
  }),
  //select ride
  select_ride: asyncHandler(async (req, res) => {
  
    const rider_id = req.body
    const userId=req.body

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(rider_id)) {
      return res.status(400).json({ message: 'Invalid passengerId or driverId' });
    }

    // Find the passenger's ride by ID
    const ride = await publishRide.findById(passengerId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the ride status is 'waiting'
    if (ride.status !== 'waiting') {
      return res.status(400).json({ message: 'Passenger already matched or completed' });
    }

    // Update the ride status to 'matched'
    ride.status = 'matched';
    ride.rider_id = mongoose.Types.ObjectId(rider_id); // Assign the driverId
    await ride.save();

    return res.status(200).json({ message: 'Ride matched successfully', ride });
  })
  

    

}