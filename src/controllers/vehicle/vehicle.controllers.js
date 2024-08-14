import { Vehicle } from "../../models/driver.models.js";
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
      try {
          const { passengerCoordinates } = req.body;
          const nearestVehicles = [];
  
          for (const coordinates of passengerCoordinates) {
              const locations = await Vehicle.aggregate([
                  {
                      $geoNear: {
                          near: {
                              type: "Point",
                              coordinates: [parseFloat(coordinates.latitude), parseFloat(coordinates.longitude)]
                          },
                          distanceField: "distance",
                          maxDistance: 5000, // 5km radius
                          spherical: true,
                          key: "location"
                      }
                  },
                  {
                      $project: {
                          vehicle_model: 1,
                          driver_name: 1,
                          seats_available: 1,
                          price_per_person: 1,
                          distance: 1
                      }
                  }
              ]);
              nearestVehicles.push(locations);
          }
  
          const allEmpty = nearestVehicles.every(array => array.length === 0);
  
          if (allEmpty) {
              return res.status(404).json({ message: 'No vehicles found nearby' });
          }
          res.json(nearestVehicles);
      } catch (err) {
          console.error('Error finding nearest vehicles:', err);
          res.status(500).json({ error: 'Error finding nearest vehicles' });
      }
  })

    

}