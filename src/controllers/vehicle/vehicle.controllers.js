import { Vehicle } from "../../models/driver.models.js";

import {PublishRide} from "../../models/publishRide.models.js"
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { upload_single_on_cloudinary, upload_multiple_on_cloudinary } from "../../utils/cloudinary.js";

import Joi from 'joi'

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
    //                 $match: {
    //                     starttime: {
    //                         $gte: timeBefore,
    //                         $lte: timeAfter,
    //                     },
    //                     status: "waiting", // Match only rides with the status "waiting"
    //                 },
    //             },
    //             {
    //                 $project: {
    //                     _id: 0,
    //                     vehicle_model: 1,
    //                     driver_name: 1,
    //                     seats_available: 1,
    //                     price_per_person: 1,
    //                     distance: 1,
    //                 },
    //             },
    //         ]);
    
    //         // Log nearby rides found
    //         console.log('Nearby Rides:', nearbyRides);
    
    //         // Respond with nearby rides or an error if none found
    //         if (nearbyRides.length === 0) {
    //             return res.status(404).json({ message: 'No rides found nearby' });
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
    
            // Get the current date and construct the requested date with the time
            const currentDate = new Date();
            const dateString = currentDate.toDateString(); // e.g., "Sat Aug 24 2024"
            const requestedDateString =`${dateString} ${requestedTime}`;
            const requestedDate = new Date(requestedDateString);
    
            // Define the time range: 15 minutes before and after the requested time
            const timeBefore = new Date(requestedDate);
            timeBefore.setMinutes(requestedDate.getMinutes() - 15);
    
            const timeAfter = new Date(requestedDate);
            timeAfter.setMinutes(requestedDate.getMinutes() + 15);
    
            // Debugging information
            console.log('Passenger Location:', passengerLocation);
            console.log('Requested Time:', requestedTime);
            console.log('Time Before:', timeBefore.toISOString());
            console.log('Time After:', timeAfter.toISOString());
    
            // Use $geoNear to find nearby rides within 5km and the specified time range
            const nearbyRides = await PublishRide.aggregate([
                {
                    $geoNear: {
                        near: passengerLocation, // The passenger's location as a GeoJSON point
                        distanceField: 'distance', // The field in the results that contains the calculated distance
                        maxDistance: 5000, // Distance in meters (5km)
                        spherical: true, // Enable spherical calculations for geospatial data
                        key: 'pickup_location', // The field in the collection that stores location data
                    },
                },
                {
                    $match: {
                        starttime: {
                            $gte: timeBefore,
                            $lte: timeAfter,
                        },
                        status: "waiting", // Match only rides with the status "waiting"
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
      
    // other functions...

  

//   const { pickup_location, dropLocation, date, starttime, endtime, numSeats, pricePerSeat } = req.body;
// const driverId = req.user_id;

// // Validate the input
// if (!pickup_location || !dropLocation || !date || !starttime || !endtime || !numSeats || !pricePerSeat) {
//     return res.status(400).json(new ApiResponse(400, 'All fields are required'));
// }

// // Create a new ride offer
// const ride = new Ride({


    

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