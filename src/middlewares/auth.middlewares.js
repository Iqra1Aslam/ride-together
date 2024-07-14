import { User } from "../models/user.models.js";
import { ApiResponse } from "../services/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { jwt_token_verify } from "../utils/jwt.js";

import jwt from 'jsonwebtoken'



export const auth_middleware = {
    check_user_role: (roles) => asyncHandler(async (req, res, next) => {
        const token = req.header('Authorization') || req.body.token
        if (!token) return res.status(401).json(new ApiResponse(401, {}, 'Unauthorized user'))

        const verify_token = jwt_token_verify(token)
        if (!verify_token) return res.status(401).json(new ApiResponse(401, {}, 'invalid token'))

        const user = await User.findById(verify_token.id)
        if (!user) return res.status(404).json(new ApiResponse(404, {}, 'user not found'))
        console.log(user)

        if (!roles.includes(user.role)) return res.status(401).json(new ApiResponse(401, {}, 'unauthorized user'))

        req.user_id = user._id
        req.role = user.role

        next()
    }),

    check_is_admin: asyncHandler(async (req, res, next) => {
        const user_id = req.user_id
        const user = await User.findById(user_id)
        if (!user.is_admin) return res.status(400).json(new ApiResponse(400, {}, 'only admin can access this route'))
        next()
    })
}