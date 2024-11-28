import { Router } from 'express';
import { auth_middleware } from '../middlewares/auth.middlewares.js';

import { driver } from '../controllers/driver/driver.controllers.js';

export const driverRouter = Router();

driverRouter.patch(
    '/verifyDriverLicense/:driverId',
 auth_middleware.check_user_role(['admin']), 
auth_middleware.check_is_admin,
driver.verifyDriverLicense);
// Add driver details
driverRouter.post(
    '/driver-details/:id',
    auth_middleware.check_user_role(['driver', 'admin', 'passenger']),
    driver.driver_details_add
);

driverRouter.patch('/new-rating',
    auth_middleware.check_user_role(['driver', 'admin', 'passenger']),
driver.new_driver_rating)
driverRouter.get('/get-rating/:driverId',
    auth_middleware.check_user_role(['driver', 'admin', 'passenger']),
    driver.get_driver_rating)
driverRouter.post('/avg-update-rating/:driverId',
    auth_middleware.check_user_role(['driver', 'admin', 'passenger']),
    driver.average_driver_rating_update)

