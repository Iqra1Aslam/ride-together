import { Driver } from "../../models/driver.models.js";
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";



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
                     
                },
                { new: true, upsert: true }
            );
    
            res.status(200).json(new ApiResponse(200, { driver }, 'Driver details added successfully'));
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to add driver details" });
        }
    }),
    verifyDriverLicense: asyncHandler(async (req, res) => {
        const { driverId } = req.params; 
        const { is_verified } = req.body; 
        
        try {
           
            // Find the driver by ID and retrieve avgRating
        const driver = await Driver.findById(driverId).select('avgRating');

        if (!driver) {
            return res.status(404).json(new ApiResponse(404, {}, 'Driver  not found.'));
        }

        // Check the driver's average rating before updating the verification status
        if (driver.avgRating < 3 && is_verified) {
            return res.status(400).json(new ApiResponse(400, {}, 'Cannot verify driver with an average rating below 3.'));
        }

        // Update the driver's verification status
        driver.is_driver_verified = is_verified;
        await driver.save();

        console.log('Driver verification status updated successfully.');
        res.status(200).json(new ApiResponse(200, { driver }, 'Driver  status updated successfully'));
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

  

}),
average_driver_rating_update: asyncHandler(async (req, res) => {
    try {
        let { driverId } = req.params;
        let { newRating } = req.body;
        driverId = driverId.replace(/^:/, '').trim();
        // Find the driver by ID
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ message: 'driver not found' });
        }

        // Calculate the new average rating
        const totalRatings = driver.ratingCount || 0;
        const currentAverage = driver.avgRating || 0;
        const updatedAverage = ((currentAverage * totalRatings) + newRating) / (totalRatings + 1);

        // Update driver's average rating and increment rating count
        driver.avgRating = updatedAverage;
        driver.ratingCount = totalRatings + 1;
        await driver.save();

        return res.status(200).json({ driverId, newAvgRating: updatedAverage });
    } catch (error) {
        console.error("Error updating average rating:", error.message || error);
        return res.status(500).json({ message: 'Error updating average rating', error: error.message });
    }
}),

// New rating for driver
new_driver_rating: asyncHandler(async (req, res) => {
    try {
        const { userId, driverId, rating, comment } = req.body;

        if (!userId || !driverId || !rating) {
            return res.status(400).json({ message: 'userId, driverId, and rating are required' });
        }
       
        const driver = await Driver.findById(driverId)
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        driver.ratings.push({ userId, rating, comment });

        
        const totalRatings = driver.ratingCount || 0;
        const currentAverage = driver.avgRating || 0;
        const updatedAverage = ((currentAverage * totalRatings) + rating) / (totalRatings + 1);

        
        driver.avgRating = updatedAverage.toFixed(1);
        driver.ratingCount = totalRatings + 1;

        await driver.save();

        return res.status(201).json({ message: 'Rating added successfully',driver });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating rating', error: error.message });
    }
}),

// Get rating
get_driver_rating: asyncHandler(async (req, res) => {
    try {
        let { driverId } = req.params;
        driverId = driverId.replace(/^:/, '').trim();

        // Find the driver by ID
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ message: 'driver not found' });
        }

        return res.status(200).json({avgRating: parseFloat(driver.avgRating).toFixed(1), ratingCount: driver.ratingCount });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching ratings', error: error.message });
    }
}),
}
