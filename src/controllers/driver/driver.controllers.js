import { Driver } from "../../models/driver.models.js";
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { upload_single_on_cloudinary } from "../../utils/cloudinary.js";

export const driver = {
    driver_details_add: asyncHandler(async (req, res) => {
<<<<<<< HEAD
        const user_id = req.user_id;
        // const user_id = req.params.id.trim();
        const { name, phone, cnic } = req.body;
    
       try{
=======
        const user_id = req.params.id.trim();
        const { name, phone, cnic } = req.body;
    
        try {
>>>>>>> 410cb0017b1d79a083025a9c771f548375d97630
            const driver = await Driver.findByIdAndUpdate(
                user_id,
                { 
                    name: name,
                    phone: phone,
                    cnic: cnic 
                },
<<<<<<< HEAD
                { new: true,upsert: true}
            );
          } catch (error) {
            res.status(500).json({ success: false, message: "Failed to add driver details" });
        }
  
          res.status(200).json(new ApiResponse(200, { driver }, 'Driver status updated successfully'));
      }),
    upload_driver_license_image: asyncHandler(async (req, res) => {
        // const user_id = req.params.id.trim();
        const user_id = req.user_id;
        const image = req.file;
    
        try {
            const profile_image_url = await upload_single_on_cloudinary(image);
    
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
=======
                { new: true, upsert: true }
            );
    
            res.status(200).json(new ApiResponse(200, { driver }, 'Driver details added successfully'));
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to add driver details" });
        }
    }),
    upload_driver_license_image: asyncHandler(async (req, res) => {
        const user_id = req.params.id.trim();
        const image = req.file;
    
        try {
            const profile_image_url = await upload_single_on_cloudinary(image);
    
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
>>>>>>> 410cb0017b1d79a083025a9c771f548375d97630
        
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