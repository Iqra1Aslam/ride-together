import { Driver } from "../../models/driver.models.js";
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { upload_single_on_cloudinary } from "../../utils/cloudinary.js";


export const driver = {
    driver_details_add: asyncHandler(async (req, res) => {
        const user_id = req.user_id;
        const { name, phone, cnic,  } = req.body;
    
        try {
            const driver = await Driver.findByIdAndUpdate(
                user_id,
                {
                    name: name,
                    phone: phone,
                    cnic: cnic,
                     // Save FCM token
                },
                { new: true, upsert: true }
            );
    
            res.status(200).json(new ApiResponse(200, { driver }, 'Driver details added successfully'));
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to add driver details" });
        }
    }),
    
    upload_driver_license_image: asyncHandler(async (req, res) => {
        const user_id = req.user_id;
        const image = req.file;
        const profile_image_url = await upload_single_on_cloudinary(image);
        try {
            const driver = await Driver.findByIdAndUpdate(
                user_id,
                { driver_lisence_image: profile_image_url },
                { new: true }
            );
    
            res.status(200).json(new ApiResponse(200, { driver }, 'Driver license image uploaded successfully'));
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to upload driver license image" });
        }
    }),
        
    // driver_verification: asyncHandler(async (req, res) => {
    //     const { is_verified } = req.body;
    //     const user_id = req.user_id;

    //     const driver = await Driver.findOneAndUpdate(
    //         { driver: user_id },
    //         { is_driver_verified: is_verified },
    //         { new: true }
    //     );

    //     if (!driver) {
    //         return res.status(404).json(new ApiResponse(404, {}, 'Driver not found.'));
    //     }

    //     res.status(200).json(new ApiResponse(200, { driver }, 'Driver verification status updated successfully'));
    // }),
    verifyDriverLicense: asyncHandler(async (req, res) => {
        const { driverId } = req.params; // Assume driverId is passed as a parameter in the URL
        const { is_verified } = req.body; // Admin sends verification status in the request body
        
        try {
            // Find the driver by ID and check if the license image exists
            const driver = await Driver.findById(driverId).select('driver_lisence_image');
    
            if (!driver || !driver.driver_lisence_image) {
                return res.status(404).json(new ApiResponse(404, {}, 'Driver license image not found.'));
            }
    
            // Update the driver's verification status
            driver.is_driver_verified = is_verified;
            await driver.save();
    
            console.log('Driver verification status updated successfully.');
            res.status(200).json(new ApiResponse(200, { driver }, 'Driver license verification status updated successfully'));
        } catch (error) {
            console.error('Error updating driver license verification status:', error.message);
            res.status(500).json(new ApiResponse(500, {}, 'Failed to update driver license verification status'));
        }
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

  

})

}
