import { Vehicle } from "../../../models/rider.models.js";
import { ApiResponse } from "../../../services/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { upload_single_on_cloudinary, upload_multiple_on_cloudinary } from "../../../utils/cloudinary.js";

import Joi from 'joi'

export const vehicle = {
    vehicle_details_add: asyncHandler(async (req, res) => {
        // Get data from the request body
        const { car_type, vehicle_model, vehicle_plate_number, number_of_seats, vehicle_color } = req.body;
        const rider = req.user_id;

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
        const vehicle = new Vehicle.create(
            { rider, car_type, vehicle_model, vehicle_plate_number, number_of_seats, vehicle_color }
        );

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
    })
}