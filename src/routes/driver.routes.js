import { Router } from 'express';

import { auth_middleware } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { driver } from '../controllers/driver/driver.controllers.js';

export const driverRouter = Router();




driverRouter.route('/driver-verification').patch(auth_middleware.check_user_role(['driver','admin']), driver. driver_verification)

driverRouter.post
('/driver-details/:id', 
    auth_middleware.check_user_role(['driver', 'admin', 'passenger']), 
    driver.driver_details_add 
);

driverRouter.post('/upload-license-image/:id',
    auth_middleware.check_user_role(['driver', 'admin', 'passenger']),
    upload.single('lisence_image'), 
    driver.upload_driver_license_image
);