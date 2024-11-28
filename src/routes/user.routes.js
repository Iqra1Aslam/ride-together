import { Router } from 'express'
import { user } from '../controllers/user/user.controllers.js'
import { auth_middleware } from '../middlewares/auth.middlewares.js'


export const userRouter = Router()

userRouter.route('/user-details-add').patch(
  auth_middleware.check_user_role(['passenger', 'driver']), user.user_details_add)
userRouter.route('/user-details-update').patch(auth_middleware.check_user_role(['passenger', 'driver']), user.user_details_update)

userRouter.route('/token-add').patch(
    
    auth_middleware.check_user_role(['passenger', 'driver', 'admin']),
    user.user_token_add
  );
  userRouter.route('/token-get/:id').get(
    
    auth_middleware.check_user_role(['passenger', 'driver', 'admin']),
    user.user_token_get
  );