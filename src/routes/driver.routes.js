import { Router } from 'express';

import { auth_middleware } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { driver } from '../controllers/driver/driver.controllers.js';

export const driverRouter = Router();




driverRouter.route('/driver-verification').patch(auth_middleware.check_user_role(['driver','admin']), driver. driver_verification)
driverRouter.post('/driver-details', 
    auth_middleware.check_user_role(['driver', 'admin', 'passenger']), // Ensure only drivers or admins can access this route
    upload.single('lisence_image'), // Upload the license image
    driver.driver_details_add // Call the controller function
);
