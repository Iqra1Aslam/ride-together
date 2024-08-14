import { Router } from 'express'
import { user } from '../controllers/user/user.controllers.js'
import { auth_middleware } from '../middlewares/auth.middlewares.js'
import { upload } from '../middlewares/multer.middlewares.js'

export const userRouter = Router()

userRouter.route('/user-details-add').patch(auth_middleware.check_user_role(['passenger', 'driver']), user.user_details_add)
userRouter.route('/user-details-update').patch(auth_middleware.check_user_role(['passenger', 'driver']), user.user_details_update)
userRouter.route('/user-delete/:id').patch(auth_middleware.check_user_role(['passenger', 'driver', 'admin']), user.user_details_delete)
// userRouter.route('/user-delete/:id').patch(auth_middleware.check_user_role([ 'admin']), auth_middleware.check_is_admin(), user.user_details_delete)
userRouter.patch(
    '/user-profile-image-add/:id',
    upload.single('images'), 
    auth_middleware.check_user_role(['passenger', 'driver', 'admin']),
    user.user_profile_image_add
  );