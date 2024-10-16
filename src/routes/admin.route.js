import { Router } from 'express'

import { auth_middleware } from '../middlewares/auth.middlewares.js'
import { admin } from '../controllers/admin.controller.js';


export const router = Router();
router.route('/set-admin').patch(
    auth_middleware.check_user_role(['admin']), // Ensure this matches your role checks
    auth_middleware.check_is_admin,
    admin.setAdminRole
);

// router.post('/set-admin',admin.AdminRole);
router.route('/updateAdmin/:id').patch( auth_middleware.check_user_role(['admin']),admin.updateAdmin);
// Route to get all passengers
router.route('/getAllPassengers').get( auth_middleware.check_user_role(['admin']), // Ensure this matches your role checks
auth_middleware.check_is_admin, admin.getAllPassengers);

// Route to delete a passenger
router.route('/deletePassenger/:id').delete( auth_middleware.check_user_role(['admin']), admin.deletePassenger);

// Route to update passenger details
router.route('/updatePassenger/:id').patch( auth_middleware.check_user_role(['admin']),admin.updatePassenger);
router.route('/getAllDrivers').get( auth_middleware.check_user_role(['admin']), // Ensure this matches your role checks
auth_middleware.check_is_admin, admin.getAllDrivers);
router.route('/updateDriver/:id').patch( auth_middleware.check_user_role(['admin']),admin.updateDriver);
router.route('/deleteDriver/:id').delete( auth_middleware.check_user_role(['admin']), admin.deleteDriver);
router.route('/rides').get( auth_middleware.check_user_role(['admin']), admin.rides);
router.route('/getAllVehicle').get( auth_middleware.check_user_role(['admin']), // Ensure this matches your role checks
auth_middleware.check_is_admin, admin.getAllVehicles);

