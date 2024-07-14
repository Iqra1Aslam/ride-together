import { Router } from 'express';

import { auth_middleware } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { rider } from '../controllers/rider/rider.controllers.js';

export const riderRouter = Router();




riderRouter.route('/rider-verification').patch(auth_middleware.check_user_role(['rider','admin']), rider. rider_verification)
riderRouter.route('/rider-lisence-img/:id').patch(upload.single('lisence_image'), auth_middleware.check_user_role(['passenger', 'rider', 'admin']), rider.rider_lisence_image_add);
