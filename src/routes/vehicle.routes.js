import { Router } from 'express';
import { auth_middleware } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';

import { vehicle } from '../controllers/vehicle/vehicle.controllers.js';

export const vehicleRouter = Router();

vehicleRouter.route('/vehicle_details_add').post(auth_middleware.check_user_role(['passenger', 'driver']),vehicle.vehicle_details_add);
vehicleRouter.route('/vehicle-verification/:vehicleId').patch(auth_middleware.check_user_role(['admin']),auth_middleware.check_is_admin, vehicle.vehicle_verification);
vehicleRouter.route('/vehicle-images-upload').patch(auth_middleware.check_user_role(['admin', 'driver']), upload.fields([
    {
        name: 'vehicle_image',
        maxCount: 1
    },
    {
        name: 'vehicle_dox_image',
        maxCount: 1
    }
]), vehicle.vehicle_images_upload);
vehicleRouter.route('/is_nearestVehicle').post(auth_middleware.check_user_role(['driver', 'passenger']), vehicle.is_nearestVehicle);
vehicleRouter.route('/publish-ride').post(auth_middleware.check_user_role(['driver', 'admin', 'passenger']), vehicle.publish_ride);

// Add the new route for sending requests
vehicleRouter.route('/send-request').post(auth_middleware.check_user_role(['driver', 'passenger']), vehicle.send_request);
vehicleRouter.route('/driver/ride-requests/:driverId').get(auth_middleware.check_user_role(['driver', 'passenger']), vehicle.fetch_ride_requests);

vehicleRouter.route('/accept-and-book').post(auth_middleware.check_user_role(['driver', 'passenger']), vehicle.acceptAndBookRide);
vehicleRouter.route('/booked-passengers/:rideId').get(auth_middleware.check_user_role(['driver']), vehicle.getBookedPassengers);
