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

//     vehicle_verification: asyncHandler(async (req, res) => {
      
//         const { is_verified } = req.body; // Admin sends verification status in the request body
//         const { vehicleId } = req.params;
//         try {
//           // Update the driver's verification status
//           const vehicle = await Vehicle.findById(vehicleId).select('vehicle_image');
//           console.log('Vehicle ID:', vehicleId);
//           console.log('vehicle found:', vehicle);
//           console.log('vehicle image:', vehicle ? vehicle.vehicle_image : 'No vehicle');
//           console.log('is_verified:', is_verified);
    
//         if (!vehicle || !vehicle.vehicle_image) {
//           return res.status(404).json(new ApiResponse(404, {}, 'Vehicle or vehicle_image not found.'));
//       }
    

//       // Update the vehicle's verification status
//       vehicle.is_vehicle_verified= is_verified;
//       await vehicle.save();



//     res.status(200).json(new ApiResponse(20 0, { vehicle }, 'Vehicle verification status updated successfully'))
//     } catch (error) {
//         console.error('Error updating verification:', error);
//         res.status(500).json(new ApiResponse(500, {}, 'Failed to update vehicle verification status'));
//     }
// }),
       

vehicle_verification: asyncHandler(async (req, res) => {
  const { is_verified } = req.body; // Admin sends verification status in the request body
  const { vehicleId } = req.params;
  try {
    console.log('Vehicle ID:', vehicleId);
    console.log('is_verified:', is_verified);

    // Fetch the vehicle using the provided ID
    const vehicle = await Vehicle.findById(vehicleId).select('vehicle_image');
    console.log('Vehicle found:', vehicle);
    console.log('Vehicle image:', vehicle ? vehicle.vehicle_image : 'No vehicle');

    if (!vehicle || !vehicle.vehicle_image) {
      return res.status(404).json(new ApiResponse(404, {}, 'Vehicle or vehicle_image not found.'));
    }

    // Update the vehicle's verification status
    vehicle.is_vehicle_verified = is_verified;
    await vehicle.save();

    res.status(200).json(new ApiResponse(200, { vehicle }, 'Vehicle verification status updated successfully'));
  } catch (error) {
    console.error('Error updating verification:', error);
    res.status(500).json(new ApiResponse(500, {}, 'Failed to update vehicle verification status'));
  }
}),
is_nearestVehicle: asyncHandler(async (req, res) => {
  try {
    const { passengerLocation, requestedTime } = req.body;

    // Validate input
    if (!passengerLocation || !requestedTime) {
      return res.status(400).json({ message: 'Passenger location and requested time are required.' });
    }

    // Construct the requested date with the time
    const currentDate = new Date();
    const dateString = currentDate.toDateString(); // Format: 'Sat Aug 24 2024'
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
          near: {
            type: 'Point',
            coordinates: [passengerLocation.longitude, passengerLocation.latitude],
          },
          distanceField: 'distance',
          maxDistance: 5000, // 5 km
          spherical: true,
          key: 'pickup_location',
        },
      },
      {
        $match: {
          starttime: { $gte: timeBefore, $lte: timeAfter },
          status: 'active', // Only include active rides
          availableSeats: { $gte: 1 }, // Ensure there are seats available
        },
      },
      {
        $lookup: {
          from: 'vehicles', // Assuming the vehicle collection is named 'vehicles'
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicleDetails',
        },
      },
      {
        $unwind: '$vehicleDetails', // Unwind vehicle details if needed
      },
      {
        $lookup: {
          from: 'users', // Assuming the user collection is named 'users'
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverDetails',
        },
      },
      {
        $unwind: '$driverDetails', // Unwind driver details if needed
      },
      {
        $project: {
          driverId: 1,
          pickup_location: 1,
          dropLocation: 1,
          date: 1,
          starttime: 1,
          endtime: 1,
          availableSeats: 1, // Include availableSeats in the result
          pricePerSeat: 1,
          status: 1,
          distance: 1,
          'vehicleDetails.vehicle_model': 1,
          'vehicleDetails.vehicle_color': 1,
          'vehicleDetails.vehicle_plate_number': 1,
          'vehicleDetails.number_of_seats': 1,
          'vehicleDetails.vehicle_image': 1,
          'driverDetails.name': 1,
          'driverDetails.phone': 1,
        },
      },
    ]);

    // Respond with nearby rides or an error if none found
    if (nearbyRides.length === 0) {
      return res.status(404).json({ message: 'No rides found nearby' });
    }

    res.json({ rides: nearbyRides });
  } catch (error) {
    console.error('Error finding nearby rides:', error);
    res.status(500).json({ error: 'Failed to find nearby rides' });
  }
}),
publish_ride: asyncHandler(async (req, res) => {
        const { pickup_location, dropLocation, date, starttime, endtime, numSeats, pricePerSeat} = req.body;
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
          status: 'active',
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
        const { driverId, passengerId } = req.body;
      
        try {
          // Find an active ride by driverId
          const ride = await PublishRide.findOne({ driverId: driverId, status: 'active' });
  
          // Check if an active ride was found and if seats are available
          if (!ride) {
              return res.status(404).json(new ApiResponse(404, {}, 'No active ride found for this driver.'));
          }
          if (ride.availableSeats === 0) {
              return res.status(400).json(new ApiResponse(400, {}, 'No seats available for this ride.'));
          }
  
          // Add passenger to the ride's bookedPassengers array
          ride.bookedPassengers.push(passengerId);
          ride.availableSeats -= 1;
  
          // If seats are full, mark the ride as completed
          if (ride.availableSeats === 0) {
              ride.status = 'completed';
          }
  
          await ride.save();
  
          return res.status(200).json(new ApiResponse(200, { ride }, 'Passenger added to ride successfully.'));
      } catch (error) {
          return res.status(500).json(new ApiResponse(500, {}, 'Error booking ride', error.message));
      }
      }),
// Fetch ride requests for a specific driver
fetch_ride_requests: asyncHandler(async (req, res) => {
  const { driverId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    return res.status(400).json({ message: 'Invalid driverId' });
  }

  const rides = await PublishRide.find({ driverId: driverId, status: 'requested' })
    .populate('passengerId', 'name') // Assuming `passengerId` references User model
    .populate('driverId', 'name');   // Assuming `driverId` references User model

  if (!rides.length) {
    return res.status(404).json({ message: 'No requests found' });
  }

  return res.status(200).json(rides);
}),
acceptAndBookRide: asyncHandler(async (req, res) => {
  try {
      let { rideId, passengerId } = req.body;

      console.log('Received rideId:', rideId);
      console.log('Received passengerId:', passengerId);

      // Find the ride by its ID
      const ride = await PublishRide.findById(rideId);
      if (!ride) {
          console.log('Ride not found in the database');
          return res.status(404).json({ message: 'Ride not found' });
      }

      console.log('Found ride:', ride);

      // Check available seats
      if (ride.numSeats <= 0) {
          return res.status(400).json({ message: 'No available seats' });
      }

      // Find passenger details
      const passenger = await User.findById(passengerId);
      if (!passenger) {
          return res.status(404).json({ message: 'Passenger not found' });
      }

      // Update ride with passenger details and decrease the number of seats
      ride.bookedPassengers.push({
          passengerId: passenger._id,
          passengerDetails: {
              id: passenger._id,
              name: passenger.full_name,
              gender: passenger.gender,
          },
      });
      ride.numSeats -= 1; // Decrease the number of available seats

      // Apply 20% discount for each additional passenger
      const totalSeats = ride.initialNumSeats; // Assuming `initialNumSeats` stores the total seats at the start
      const bookedSeats = totalSeats - ride.numSeats;

      if (bookedSeats > 1) {
          // Apply discount: 20% for each additional passenger
          const discountMultiplier = Math.min(0.2 * (bookedSeats - 1), 0.8); // Max discount is 80%
          ride.pricePerSeat = ride.initialPricePerSeat * (1 - discountMultiplier);
      }

      ride.status = 'accepted';
      await ride.save();

      return res.status(200).json({ message: 'Passenger accepted and booked', ride });
  } catch (error) {
      console.error('Error occurred:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
}),
// Controller function for fetching booked passengers
getBookedPassengers: asyncHandler(async (req, res) => {
  const rideId = req.params.rideId;

  try {
      const ride = await PublishRide.findById(rideId);
      if (!ride) {
          return res.status(404).json({ message: "Ride not found" });
      }

      // Continue processing if ride is found
      const bookedPassengers = ride.bookedPassengers; // Array of booked passengers
      res.status(200).json({ bookedPassengers });
  } catch (error) {
      res.status(500).json({ message: "Server Error" });
  }
}),
bookRide: asyncHandler(async (req, res) => {
  const { passengerId, driverId, pickupLocation, requestedDate, requestedTime } = req.body;

  try {
      // Validate driverId and passengerId
      if (!mongoose.Types.ObjectId.isValid(driverId) || !mongoose.Types.ObjectId.isValid(passengerId)) {
          return res.status(400).json(new ApiResponse(400, {}, 'Invalid driverId or passengerId.'));
      }

      // Find driver and passenger
      const driver = await User.findById(driverId);
      const passenger = await User.findById(passengerId);

      if (!driver) {
          return res.status(404).json(new ApiResponse(404, {}, 'Driver not found.'));
      }
      if (!passenger) {
          return res.status(404).json(new ApiResponse(404, {}, 'Passenger not found.'));
      }

      // Validate date and time
      const dateObj = new Date(requestedDate);
      if (isNaN(dateObj.getTime())) {
          return res.status(400).json(new ApiResponse(400, {}, 'Invalid date format. Use a valid date.'));
      }

      const timeRegex = /^(\d{1,2}:\d{2})(\s?[APap][Mm])?$/;
      if (!timeRegex.test(requestedTime)) {
          return res.status(400).json(new ApiResponse(400, {}, 'Invalid time format. Use HH:MM AM/PM.'));
      }

      const requestedDateTimeString = `${requestedDate} ${requestedTime}`;
      const requestedDateTimeObj = new Date(requestedDateTimeString);
      if (isNaN(requestedDateTimeObj.getTime())) {
          return res.status(400).json(new ApiResponse(400, {}, 'Invalid requested time.'));
      }

      // Find an active ride by driverId
      const ride = await PublishRide.findOne({ driverId: driverId, status: 'active' });

      if (!ride) {
          return res.status(404).json(new ApiResponse(404, {}, 'No active ride found for this driver.'));
      }
      if (ride.availableSeats === 0) {
          return res.status(400).json(new ApiResponse(400, {}, 'No seats available for this ride.'));
      }

      // Calculate the discounted price
      const totalSeats = ride.numSeats;
      const remainingSeats = ride.availableSeats;
      const discountPercentage = 0.2; // 20%
      const discountedPrice = ride.pricePerSeat * Math.pow(1 - discountPercentage, totalSeats - remainingSeats);

      // Update ride details
      ride.bookedPassengers.push({ passengerId }); // Add passengerId as an object
      ride.availableSeats -= 1;
      ride.pickupLocation = pickupLocation;
      ride.requestedDate = dateObj;
      ride.requestedTime = requestedDateTimeObj;
      ride.pricePerSeat = discountedPrice.toFixed(2); // Update pricePerSeat with discounted price

      // If seats are full, mark the ride as completed
      if (ride.availableSeats === 0) {
          ride.status = 'completed';
      }

      // Save the ride
      await ride.save();

      // Populate passenger details (including gender) for the booked passengers
      const populatedRide = await PublishRide.findById(ride._id).populate({
          path: 'bookedPassengers.passengerId', // Populate passengerId within bookedPassengers
          select: 'gender', // Select gender field from the User schema
      });

      return res.status(200).json(new ApiResponse(200, { populatedRide }, 'Passenger added to ride successfully.'));
  } catch (error) {
      return res.status(500).json(new ApiResponse(500, {}, 'Error booking ride', error.message));
  }
}),

acceptPassenger: asyncHandler(async (req, res) => {
  const { driverId, passengerId } = req.body;

  try {
      // Check if there is an active ride by the driver with the requested passenger
      const ride = await PublishRide.findOne({ 
          driverId: driverId, 
          status: 'active', 
          bookedPassengers: { $elemMatch: { _id: passengerId } } // Adjust query for object IDs
      });

      if (!ride) {
          return res.status(404).json(new ApiResponse(404, {}, 'Ride not found or already completed, or passenger not in booking list.'));
      }

      // Confirm acceptance (if additional logic is needed, handle it here)
      // Example: Update any status of the passenger if necessary

      await ride.save(); // Save if any changes were made

      return res.status(200).json(new ApiResponse(200, { ride }, 'Passenger request accepted.'));
  } catch (error) {
      console.error('Error accepting passenger:', error); // Log the error for debugging
      return res.status(500).json(new ApiResponse(500, {}, 'Error accepting passenger', error.message));
  }
}),



}