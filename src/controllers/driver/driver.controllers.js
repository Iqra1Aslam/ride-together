import { Driver } from "../../models/driver.models.js";
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { upload_single_on_cloudinary } from "../../utils/cloudinary.js";
import { PublishRide } from "../../models/publishRide.models.js";
import { getMessaging } from "firebase-admin/messaging";

export const driver = {
    driver_details_add: asyncHandler(async (req, res) => {
        const user_id = req.user_id;
        const { name, phone, cnic } = req.body;

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
            res.status(500).json(new ApiResponse(500, {}, 'Failed to add driver details'));
        }
    }),

    upload_driver_license_image: asyncHandler(async (req, res) => {
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
            res.status(500).json(new ApiResponse(500, {}, 'Failed to upload driver license image'));
        }
    }),

    driver_verification: asyncHandler(async (req, res) => {
        const { is_verified } = req.body;
        const user_id = req.user_id;

        try {
            const driver = await Driver.findOneAndUpdate(
                { _id: user_id },
                { is_driver_verified: is_verified },
                { new: true }
            );

            if (!driver) {
                return res.status(404).json(new ApiResponse(404, {}, 'Driver not found.'));
            }

            res.status(200).json(new ApiResponse(200, { driver }, 'Driver verification status updated successfully'));
        } catch (error) {
            res.status(500).json(new ApiResponse(500, {}, 'Failed to update driver verification status'));
        }
    }),

    driver_location: asyncHandler(async (req, res) => {
        const { latitude, longitude } = req.body;
        const user_id = req.user_id;

        try {
            await Driver.findByIdAndUpdate(user_id, {
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                }
            });
            res.status(200).json(new ApiResponse(200, {}, 'Location updated successfully'));
        } catch (error) {
            res.status(500).json(new ApiResponse(500, {}, 'Error updating location'));
        }
    }),

    fetch_driver_requests: asyncHandler(async (req, res) => {
        const driverId = req.user_id;

        try {
            const rideRequests = await PublishRide.find({ driverId: driverId, status: 'requested' });

            if (!rideRequests.length) {
                return res.status(404).json(new ApiResponse(404, {}, 'No requests found for this driver'));
            }

            res.status(200).json(new ApiResponse(200, { rideRequests }, 'Ride requests fetched successfully'));
        } catch (error) {
            res.status(500).json(new ApiResponse(500, {}, 'Error fetching ride requests'));
        }
    }),

    ride_request: asyncHandler(async (req, res) => {
        const user_id = req.user_id; // Ensure req.user_id is correctly set by authentication middleware

        try {
            const driver = await Driver.findById(user_id);

            if (!driver || !driver.fcmToken) {
                return res.status(404).json({ success: false, message: 'Driver or FCM token not found' });
            }

            // Create a message payload
            const message = {
                notification: {
                    title: 'New Ride Request',
                    body: 'A passenger has requested a ride from you.',
                },
                token: driver.fcmToken, // Send the notification to the driver's FCM token
            };

            // Send the notification
            await getMessaging().send(message);

            res.status(200).json(new ApiResponse(200, {}, 'Notification sent successfully'));
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error sending notification', error: error.message });
        }
    })
};
