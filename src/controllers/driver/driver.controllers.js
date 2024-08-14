import { Driver } from "../../models/driver.models.js";
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {upload_single_on_cloudinary} from "../../utils/cloudinary.js"
import Joi from 'joi'

export const driver = {
    driver_lisence_image_add: asyncHandler(async (req, res) => {
        const user_id = req.user_id
        const image = req.file
    
        const profile_image = await upload_single_on_cloudinary(image)
        // check inside lisence_image exist url or not
        const user = await User.findByIdAndUpdate(
            user_id,
            { profile_image: profile_image?.url }
        )

        res.status(200).json(new ApiResponse(200, {}, 'driver_lisence_image updated'))
       
    }),
    driver_verification :  asyncHandler(async (req, res) => {
        const { is_verified } = req.body;
        const user_id = req.user_id
    
        const driver = await Driver.findByIdAndUpdate(
            user_id,
            { is_verified: is_verified },
            { new: true }
        );
    
        if (!vehicle) {
            return res.status(404).json(new ApiResponse(404, {driver}, 'driver not found.'));
        }
    
        res.status(200).json(new ApiResponse(200, { vehicle }, 'driver verification status updated successfully'));
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

nearby_drivers : asyncHandler(async (req, res) => {
    console.log('Request body:', req.body)
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
        return res.status(400).json({ success: false, message: 'Invalid Latitude or Longitude' });
    }

    try {
        const nearbyDrivers = await Driver.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parsedLongitude, parsedLatitude]
                    },
                    $maxDistance: 5000 // 5 km radius
                }
            }
        });

        if (!nearbyDrivers.length) {
            return res.status(404).json({ success: false, message: 'No drivers found nearby' });
        }

        res.status(200).send({ success: true, drivers: nearbyDrivers });
    } catch (error) {
        console.error('Error fetching nearby drivers:', error);
        res.status(500).send({ success: false, message: 'Error fetching nearby drivers', error: error.message });
    }
})





    }