import { Vehicle } from "../../models/driver.models.js";

import { publishRide } from "../../models/publishRide.models.js";
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { upload_single_on_cloudinary, upload_multiple_on_cloudinary } from "../../utils/cloudinary.js";

import Joi from 'joi'

export const vehicle = {
  vehicle_details_add: asyncHandler(async (req, res) => {
    const { car_type, vehicle_model, vehicle_plate_number, number_of_seats, location, vehicle_color } = req.body;
    const driver = req.user_id;

    // Validation schema
    const vehicle_validationSchema = Joi.object({
        car_type: Joi.string().required(),
        vehicle_model: Joi.string().required(),
        vehicle_plate_number: Joi.string().required(),
        number_of_seats: Joi.number().integer().min(1).required(),
        location: Joi.object({
            type: Joi.string().valid('Point').required(),
            coordinates: Joi.array().items(
                Joi.number().min(-180).max(180), // Longitude
                Joi.number().min(-90).max(90)    // Latitude
            ).length(2).required()
        }).required(),
        vehicle_color: Joi.string().required()
    });

    // Validate the request body
    const { error } = vehicle_validationSchema.validate(req.body);
    if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message));

    // Extract coordinates
    const { coordinates } = location;

    // Create a new vehicle entry
    const vehicle = await Vehicle.create({
        driver,
        car_type,
        vehicle_model,
        vehicle_plate_number,
        number_of_seats,
        vehicle_color,
        location: {
            type: 'Point',
            coordinates: coordinates
        }
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
    is_nearestVehicle: asyncHandler(async (req, res) => {
    //   try {
    //       const { passengerCoordinates } = req.body;
    //       const nearestVehicles = [];
  
    //       for (const coordinates of passengerCoordinates) {
    //           const locations = await Vehicle.aggregate([
    //               {
    //                   $geoNear: {
    //                       near: {
    //                           type: "Point",
    //                           coordinates: [parseFloat(coordinates.latitude), parseFloat(coordinates.longitude)]
    //                       },
    //                       distanceField: "distance",
    //                       maxDistance: 5000, // 5km radius
    //                       spherical: true,
    //                       key: "location"
    //                   }
    //               },
    //               {
    //                   $project: {
    //                       vehicle_model: 1,
    //                       driver_name: 1,
    //                       seats_available: 1,
    //                       price_per_person: 1,
    //                       distance: 1
    //                   }
    //               }
    //           ]);
    //           nearestVehicles.push(locations);
    //       }
  
    //       const allEmpty = nearestVehicles.every(array => array.length === 0);
  
    //       if (allEmpty) {
    //           return res.status(404).json({ message: 'No vehicles found nearby' });
    //       }
    //       res.json(nearestVehicles);
    //   } catch (err) {
    //       console.error('Error finding nearest vehicles:', err);
    //       res.status(500).json({ error: 'Error finding nearest vehicles' });
    //   }
    //   updated code 
      try {
        const { passengerLocation, requestedTime } = req.body;
    
        // Convert requestedTime to a Date object
        const requestedDate = new Date(requestedTime);
    
        // Calculate the time range: 15 minutes before and after the requested time
        const timeBefore = new Date(requestedDate);
        timeBefore.setMinutes(requestedDate.getMinutes() - 15);
    
        const timeAfter = new Date(requestedDate);
        timeAfter.setMinutes(requestedDate.getMinutes() + 15);
    
        // Find nearby rides within 5km and within the specified time range
        const nearbyRides = await ride.aggregate([
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [parseFloat(passengerLocation.longitude), parseFloat(passengerLocation.latitude)],
              },
              distanceField: 'distance',
              maxDistance: 5000, // 5km radius
              spherical: true,
              key: 'pickup_location', // Geospatial index field
            },
          },
          {
            $match: {
              pickup_time: {
                $gte: timeBefore,
                $lte: timeAfter,
              },
            },
          },
        ]);
    
        if (nearbyRides.length === 0) {
          return res.status(404).json({ message: 'No rides found nearby' });
        }
    
        res.json(nearbyRides);
      } catch (err) {
        console.error('Error finding nearby rides:', err);
        res.status(500).json({ error: 'Failed to find nearby rides' });
      }
      
  }),
  publish_ride: asyncHandler(async (req,res)=>{
    const { pickupLocation, dropLocation, date,time,numSeats, pricePerSeat } = req.body
    const driverId = req.user_id;
    if (req.user.role !== 'driver') {
      return res.status(403).json(new ApiResponse(403, {}, 'Forbidden: Only drivers can publish rides'));
  }
  

    // Validate the input
    if (!pickupLocation || !dropLocation || !date || !time ||  !numSeats || !pricePerSeat) {
        return res.status(400).json(new ApiResponse(400, 'All fields are required'))
    }
    // Create a new ride offer
    const ride = new publishRide({
        pickupLocation,
        dropLocation,
        time,
        date,
        numSeats,
        pricePerSeat,
        status: 'waiting',
        driverId: driverId 
        
    });
     // Check if the ride status is 'waiting'
if (ride.status !== 'waiting') {
    return res.status(400).json({ message: 'Ride is already matched or completed' });
  }

  // Save the ride to the database
     await ride.save();

    return res.status(201).json(new ApiResponse(201,{ride},'Ride created successfully'))
    
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