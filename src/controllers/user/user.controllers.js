import { User } from "../../models/user.models.js";
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Joi from 'joi'
import { upload_single_on_cloudinary } from "../../utils/cloudinary.js";

export const user = {
    user_details_add: asyncHandler(async (req, res) => {
        //get from body
        const { full_name, phone_number, city, role } = req.body
        const user_id = req.user_id

        //validation
        const userValidationSchema = Joi.object({
            city: Joi.string().valid('Lahore').required(),
            role: Joi.string().valid('driver', 'passenger').required(),
            full_name: Joi.string().min(3).max(15).required(),
            phone_number: Joi.string().min(11).max(11).required()
        })
        const { error } = userValidationSchema.validate(req.body)
        if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message))

        //find user 
        const user = await User.findByIdAndUpdate(
            user_id,
            {
                full_name: full_name,
                phone_number: phone_number,
                city: city,
                role: role

            },
            { new: true }
        )
        // send response
        return res.status(201).json(new ApiResponse(201, { user }, 'Successfully added information'))

    }),


    user_profile_image_add: asyncHandler(async (req, res) => {
        const user_id = req.user_id;
        const image = req.file;
    
        const profile_image = await upload_single_on_cloudinary(image);
        const updatedUser = await User.findByIdAndUpdate(
          user_id,
          { profile_image: profile_image?.url }
        );
        res.status(200).json(new ApiResponse(200, {}, 'User profile updated'));
      }),
    

    user_details_update: asyncHandler(async (req, res) => {
        const { full_name, profile_image, city, role, phone_number, email, address, password , user_location} = req.body
        // validation (joi)
        const userValidationSchema = Joi.object({
            full_name: Joi.string(),
            profile_image: Joi.string(),
            city: Joi.string().valid('Lahore'),
            role: Joi.string().valid('driver', 'passenger'),
            phone_number: Joi.string().required().min(10).max(13).pattern(/^[0-9]+$/),
            email: Joi.string().email(),
            address: Joi.string(),
           
            user_location: Joi.object({
                type: Joi.string().valid('Point').required(),
                coordinates: Joi.array().items(
                    Joi.number().min(-180).max(180), // Longitude
                    Joi.number().min(-90).max(90)    // Latitude
                ).length(2).required()
            }).required(),
            password: Joi.string().min(8).max(15)
        })
        const { error } = userValidationSchema.validate(req.body)
        if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message))
        const user_id = req.user_id
        const user = await User.findByIdAndUpdate(
            user_id,
            {
                full_name: full_name,
                profile_image: profile_image,
                city: city,
                role: role,
                phone_number: phone_number,
                email: email,
                address: address,
                // password: password
            },
            { new: true }
        )
        return res.status(200).json(new ApiResponse(200, user, 'user updated successfully'))
    }),

    user_details_delete: asyncHandler(async (req, res) => {
        const user_id = req.params.id
        await User.findByIdAndDelete(user_id)
        return res.status(400).json(new ApiResponse(400, {}, 'only admin delete'))
    })

    // api for update user role abc to admin (PATCH)

}