import { Driver } from "../../models/driver.models.js";
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { upload_single_on_cloudinary } from "../../utils/cloudinary.js";

export const driver = {
    driver_details_add: asyncHandler(async (req, res) => {
        const user_id = req.user_id;
        const { name, phone, cnic } = req.body;
        const image = req.file;

        let profile_image_url = null;

        if (image) {
            const profile_image = await upload_single_on_cloudinary(image);
            profile_image_url = profile_image?.url;
        }

        const driver = await Driver.findOneAndUpdate(
            { driver: user_id },
            { 
                driver_lisence_image: profile_image_url,
                name: name,
                phone: phone,
                cnic: cnic 
            },
            { new: true, upsert: true }
        );

        res.status(200).json(new ApiResponse(200, { driver }, 'Driver details updated successfully'));
    }),

    driver_verification: asyncHandler(async (req, res) => {
        const { is_verified } = req.body;
        const user_id = req.user_id;

        const driver = await Driver.findOneAndUpdate(
            { driver: user_id },
            { is_driver_verified: is_verified },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json(new ApiResponse(404, {}, 'Driver not found.'));
        }

        res.status(200).json(new ApiResponse(200, { driver }, 'Driver verification status updated successfully'));
    }),




  

// Endpoint to update driver's location
 driver_location :  asyncHandler(async (req, res) => {
    const { driverId, latitude, longitude } = req.body;
    const user_id = req.user_id
    try {
        await Driver.findByIdAndUpdate(user_id, {
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
        });
        res.status(200).send({ success: true, message: 'Location updated successfully' });
    } catch (error) {
        res.status(500).send({ success: false, message: 'Error updating location', error: error.message });
    }
}),







    }