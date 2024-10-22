import { User } from "../models/user.models.js";
import { ApiResponse } from "../services/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { jwt_token_verify } from "../utils/jwt.js";

export const auth_middleware = {
    check_user_role: (roles) => asyncHandler(async (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.body.token; // Ensure the token is stripped correctly
        if (!token) return res.status(401).json(new ApiResponse(401, {}, 'Unauthorized user'));
    
        const verify_token = jwt_token_verify(token);
        if (!verify_token) return res.status(401).json(new ApiResponse(401, {}, 'Invalid token'));
    
        const user = await User.findById(verify_token.id);
        if (!user) return res.status(404).json(new ApiResponse(404, {}, 'User not found'));
    
        req.user_id = user._id; // Assign user_id to request
        req.role = user.role;
    
        next();
    }),
    
    check_is_admin: asyncHandler(async (req, res, next) => {
        const user_id = req.user_id;
    
        // Check if user ID exists
        // console.log("User ID from request:", user_id); // Log user ID
        if (!user_id) {
            return res.status(400).json(new ApiResponse(400, {}, 'User ID not provided'));
        }
    
        // Find the user by ID
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json(new ApiResponse(404, {}, 'User not found'));
        }
    
        // // Check if the user is an admin
        if (!user.is_admin) {
            return res.status(403).json(new ApiResponse(403, {}, 'Only admin can access this route'));
        }
    
        next();
    })
    
}
