import {  Vehicle } from "../../models/driver.models.js";
import {PublishRide} from "../../models/publishRide.models.js"
import mongoose from 'mongoose';
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
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

    const { error } = vehicle_validationSchema.validate(req.body);
    if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message));

    const vehicle = await Vehicle.create({
        driver,
        car_type,
        vehicle_model,
        vehicle_plate_number,
        number_of_seats,
        vehicle_color,
       
    });

    return res.status(201).json(new ApiResponse(201, { vehicle }, 'Vehicle details added successfully'));
}),

is_nearestVehicle: asyncHandler(async (req, res) => {
  try {
    const { passengerLocation, requestedTime } = req.body;

    if (!passengerLocation || !requestedTime) {
      return res.status(400).json({ message: 'Passenger location and requested time are required.' });
    }

    const currentDate = new Date();
    const dateString = currentDate.toDateString(); 
    const requestedDateString = `${dateString} ${requestedTime}`;
    const requestedDate = new Date(requestedDateString);
    const timeBefore = new Date(requestedDate);
    timeBefore.setMinutes(requestedDate.getMinutes() - 15);
    const timeAfter = new Date(requestedDate);
    timeAfter.setMinutes(requestedDate.getMinutes() + 15);

    const nearbyRides = await PublishRide.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [passengerLocation.longitude, passengerLocation.latitude],
          },
          distanceField: 'distance',
          maxDistance: 5000, 
          spherical: true,
          key: 'pickup_location',
        },
      },
      {
        $match: {
          starttime: { $gte: timeBefore, $lte: timeAfter },
          status: 'active', 
        },
      },
      {

                $lookup: {
                  from: 'vehicles', 
                  localField: 'vehicleId',
                  foreignField: '_id',
                  as: 'vehicleDetails',
                },
              },
              {
                $unwind: '$vehicleDetails', 
              },
      {
            $lookup: {
              from: 'drivers', 
              localField: 'driverId',
              foreignField: '_id',
              as: 'driverDetails',
            },
          },
          {
            $unwind: '$driverDetails', 
          },
         
          {
            $project: {
              driverId: 1,
              pickup_location: 1,
              dropLocation: 1,
              date: 1,
              starttime: 1,
              endtime: 1,
              pricePerSeat: 1,
              status: 1,
              distance: 1,
              availableSeats:1,
              discountedPrice:1,
              'rideDetails.availableSeats': 1, 
              'rideDetails.discountedPrice': 1, 
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
        const driverId = req.user_id; 
        if (!pickup_location || !dropLocation || !date || !starttime || !endtime || !numSeats || !pricePerSeat) {
          return res.status(400).json(new ApiResponse(400, 'All fields are required'));
        }
        const dateObj = new Date(date);
        
    
        if (isNaN(dateObj.getTime())) {
          return res.status(400).json(new ApiResponse(400, 'Invalid date format. Use "Sat Aug 24 2024".'));
        }
      
        const timeRegex = /^(\d{1,2}:\d{1,2})(\s?[APap][Mm])?$/;
        if (!timeRegex.test(starttime) || !timeRegex.test(endtime)) {
          return res.status(400).json(new ApiResponse(400, 'Invalid time format. Use HH:MM AM/PM.'));
        }
      
        const startTimeString = `${date} ${starttime}`;
        const endTimeString = `${date} ${endtime}`;
        const startTimeObj = new Date(startTimeString);
        const endTimeObj = new Date(endTimeString);
       
        if (isNaN(startTimeObj.getTime()) || isNaN(endTimeObj.getTime())) {
          return res.status(400).json(new ApiResponse(400, 'Invalid start or end time.'));
        }
      
        const vehicle = await Vehicle.findOne({ driver: driverId });
        if (!vehicle) {
          return res.status(404).json(new ApiResponse(404, 'No vehicle found for this driver.'));
        }
        const ride = new PublishRide({
          pickup_location,
          dropLocation,
          date: dateObj,
          starttime: startTimeObj,
          endtime: endTimeObj,
          numSeats,
          availableSeats:numSeats,
          pricePerSeat,
           status: 'active',
          driverId: driverId,
          vehicleId: vehicle._id,
        });
      
        await ride.save();
      
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
    // Fetch ride requests for a specific driver
    fetch_ride_requests: asyncHandler(async (req, res) => {
      const { driverId } = req.params;
    
      if (!mongoose.Types.ObjectId.isValid(driverId)) {
        return res.status(400).json({ message: 'Invalid driverId' });
      }

        const rides = await PublishRide.find({
            driverId,
           
            status: { $in: ['active','completed'] } 
        }).populate({
            path: 'bookedPassengers.passengerId',
            select: 'full_name gender city', // Include necessary fields from passengers
          })
          .select('pickupLocation drop_location status bookedPassengers');
        
    
    
      if (!rides.length) {
        return res.status(404).json({ message: 'No requests found' });
      }
    
      return res.status(200).json(rides);
    }),
    
// accept api 
acceptAndBookRide: asyncHandler(async (req, res) => {
  const { rideId, passengerId } = req.body;
  try {
      
      if (!mongoose.Types.ObjectId.isValid(rideId) || !mongoose.Types.ObjectId.isValid(passengerId)) {
          return res.status(400).json(new ApiResponse(400, {}, 'Invalid rideId or passengerId.'));
      }

      const ride = await PublishRide.findById(rideId);
      if (!ride) {
          return res.status(404).json(new ApiResponse(404, {}, 'Ride not found.'));
      }

      // Check if the passenger is already in bookedPassengers
      const passengerIndex = ride.bookedPassengers.findIndex(
          (booking) => booking.passengerId.toString() === passengerId.toString()
      );

      if (passengerIndex === -1) {
          return res.status(400).json(new ApiResponse(400, {}, 'Passenger has not requested this ride.'));
      }

     
      ride.bookedPassengers[passengerIndex].status = 'accepted';
      if (ride.availableSeats === 0) {
          ride.status = 'completed';
      }

      // Save the updated ride
      await ride.save();

      // Return the updated ride with populated passenger details
      const updatedRide = await PublishRide.findById(ride._id).populate({
          path: 'bookedPassengers.passengerId',
          select: 'full_name gender city', 
      });

      return res.status(200).json(new ApiResponse(200, { updatedRide }, 'Passenger booking accepted successfully.'));
  } catch (error) {
      console.error('Error accepting and booking the ride:', error);
      return res.status(500).json(new ApiResponse(500, {}, 'Error accepting the ride.', error.message));
  }
}),

getBookedPassengers: asyncHandler(async (req, res) => {
  try {
    const { rideId } = req.params;

    // Find the ride by its ID and populate passenger details
    const ride = await PublishRide.findById(rideId).populate(
      'bookedPassengers.passengerId',
      'full_name gender city'
    );

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const acceptedPassengers = ride.bookedPassengers.filter(
      (booking) => booking.status === 'accepted'
    );

    if (acceptedPassengers.length === 0) {
      return res.status(200).json({ message: 'No accepted passengers for this ride' });
    }

    // Respond with the list of accepted passengers
    res.status(200).json({
      rideId: ride._id,
      acceptedPassengers,
    });
  } catch (error) {
    console.error('Error fetching booked passengers:', error);
    res.status(500).json({ message: 'Server error' });
  }
}),
//  send request
bookRide: asyncHandler(async (req, res) => {
  const { passengerId, driverId, pickupLocation, dropLocation, requestedDate, requestedTime } = req.body;

  try {
    
    if (!mongoose.Types.ObjectId.isValid(driverId) || !mongoose.Types.ObjectId.isValid(passengerId)) {
      return res.status(400).json(new ApiResponse(400, {}, "Invalid driverId or passengerId."));
    }

    const driver = await User.findById(driverId);
    const passenger = await User.findById(passengerId);
    const ride = await PublishRide.findOne({ driverId: driverId, status: "active" });

    if (!ride) return res.status(404).json(new ApiResponse(404, {}, "No active ride found for this driver."));
    if (ride.availableSeats === 0) return res.status(400).json(new ApiResponse(400, {}, "No seats available for this ride."));

    // Update ride details
    ride.bookedPassengers.push({ passengerId, status: "requested" });
    ride.availableSeats -= 1;
    ride.pickupLocation =pickupLocation;
    ride.drop_location=dropLocation;
      // / Calculate the discounted pricefare
      const totalSeats = ride.numSeats;
      const remainingSeats = ride.availableSeats;
      const discountPercentage = 0.2; // 20%
      const discountedPrice = ride.pricePerSeat * Math.pow(1 - discountPercentage, totalSeats - remainingSeats);
      ride.discountedPrice=discountedPrice;
     
    if (ride.availableSeats === 0) ride.status = "completed";
await ride.save();


    const updatedRide = await PublishRide.findById(ride._id).populate({
      path: "bookedPassengers.passengerId",
      select: "gender full_name",
    });

    // Send response with updated data
    return res
      .status(200)
      .json(new ApiResponse(200, { ride: updatedRide }, "Passenger request added to ride successfully."));
  } catch (error) {
    console.error("Error booking ride:", error.message);
    return res.status(500).json(new ApiResponse(500, {}, "Error booking ride request", error.message));
  }
}),




}