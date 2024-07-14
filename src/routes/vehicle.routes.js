import { Router } from 'express';

import { auth_middleware } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { vehicle } from '../controllers/rider/vehicle/vehicle.controllers.js';

export const vehicleRouter = Router();

vehicleRouter.route('/vehicle_details_add').patch(auth_middleware.check_user_role(['passenger', 'rider']), vehicle.vehicle_details_add);
vehicleRouter.route('/vehicle-verification').patch(auth_middleware.check_user_role(['rider', 'admin']), vehicle.vehicle_verification)
vehicleRouter.route('/vehicle-images-upload').patch(auth_middleware.check_user_role(['admin', 'rider']), upload.fields([
    {
        name: 'vehicle_image',
        maxCount: 1
    },
    {
        name: 'vehicle_dox_image',
        maxCount: 1
    }
]), vehicle.vehicle_images_upload)