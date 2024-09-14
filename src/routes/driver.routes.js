import { Router } from 'express';
import { auth_middleware } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { driver } from '../controllers/driver/driver.controllers.js';

export const driverRouter = Router();

// Driver verification route
driverRouter.route('/driver-verification').patch(
    auth_middleware.check_user_role(['driver', 'admin']), 
    driver.driver_verification
);

// Add driver details
driverRouter.post(
    '/driver-details/:id',
    auth_middleware.check_user_role(['driver', 'admin', 'passenger']),
    driver.driver_details_add
);

// Upload driver's license image
driverRouter.post(
    '/upload-license-image/:id',
    auth_middleware.check_user_role(['driver', 'admin', 'passenger']),
    upload.single('lisence_image'),
    driver.upload_driver_license_image
);

// Update driver's location
driverRouter.patch(
    '/update-location',
    auth_middleware.check_user_role(['driver']),
    driver.driver_location
);

// Fetch requests for the driver
driverRouter.get(
    '/driver-requests',
    auth_middleware.check_user_role(['driver']),
    driver.fetch_driver_requests
);
driverRouter.post('/ride-request',auth_middleware.check_user_role(['driver', 'admin', 'passenger'])
,driver.ride_request);
