import { Router } from 'express';
import { auth_middleware } from '../middlewares/auth.middlewares.js';


import { vehicle } from '../controllers/vehicle/vehicle.controllers.js';

export const vehicleRouter = Router();

vehicleRouter.route('/vehicle_details_add').post(
    auth_middleware.check_user_role(['passenger', 'driver']),
    vehicle.vehicle_details_add);


vehicleRouter.route('/is_nearestVehicle').post(
    auth_middleware.check_user_role(['driver', 'passenger']),
     vehicle.is_nearestVehicle);
vehicleRouter.route('/publish-ride').post(
    auth_middleware.check_user_role(['driver', 'admin', 'passenger']),
     vehicle.publish_ride);
vehicleRouter.route('/driver/ride-requests/:driverId').get(
    auth_middleware.check_user_role(['driver', 'passenger']),
     vehicle.fetch_ride_requests);

vehicleRouter.route('/accept-and-book').post(
    auth_middleware.check_user_role(['driver', 'passenger']),
     vehicle.acceptAndBookRide);
vehicleRouter.route('/booked-passengers/:rideId').get(
    auth_middleware.check_user_role(['driver', 'passenger']),
     vehicle.getBookedPassengers);
vehicleRouter.route('/book-ride')
.post(
    auth_middleware.check_user_role(['driver', 'passenger']), 
vehicle.bookRide);
