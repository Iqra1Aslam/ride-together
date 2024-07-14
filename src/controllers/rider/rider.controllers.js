import { Rider } from "../../models/rider.models.js";
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {upload_single_on_cloudinary} from "../../utils/cloudinary.js"
import Joi from 'joi'

export const rider = {
    rider_lisence_image_add: asyncHandler(async (req, res) => {
        const user_id = req.user_id
        const image = req.file
    
        const profile_image = await upload_single_on_cloudinary(image)
        // check inside lisence_image exist url or not
        const user = await User.findByIdAndUpdate(
            user_id,
            { profile_image: profile_image?.url }
        )

        res.status(200).json(new ApiResponse(200, {}, 'rider_lisence_image updated'))
       
    }),
    rider_verification :  asyncHandler(async (req, res) => {
        const { is_verified } = req.body;
        const user_id = req.user_id
    
        const rider = await Rider.findByIdAndUpdate(
            user_id,
            { is_verified: is_verified },
            { new: true }
        );
    
        if (!vehicle) {
            return res.status(404).json(new ApiResponse(404, {}, 'Rider not found.'));
        }
    
        res.status(200).json(new ApiResponse(200, { vehicle }, 'Rider verification status updated successfully'));
      })
    }