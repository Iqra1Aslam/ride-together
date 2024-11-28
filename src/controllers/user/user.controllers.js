import { User } from "../../models/user.models.js";
import { ApiResponse } from "../../services/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Joi from 'joi'
export const user = {
    user_details_add: asyncHandler(async (req, res) => {
       
        const { full_name, phone_number, gender, city, role } = req.body
        const user_id = req.user_id
        const userValidationSchema = Joi.object({
            city: Joi.string().valid('Lahore').required(),
            role: Joi.string().valid('driver', 'passenger').required(),
            full_name: Joi.string().min(3).max(15).required(),
            gender: Joi.string().min(3).max(15).required(),
            phone_number: Joi.string().min(11).max(11).required()
        })
        const { error } = userValidationSchema.validate(req.body)
        if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message))

        const user = await User.findByIdAndUpdate(
            user_id,
            {
                full_name: full_name,
                phone_number: phone_number,
                gender:gender,
                city: city,
                role: role

            },
            { new: true }
        )
        // send response
        return res.status(200).json(new ApiResponse(200, { user }, 'Successfully added information'))

    }),


    user_token_add: asyncHandler(async (req, res) => {
        const user_id = req.user_id;
        
            const {  pushToken } = req.body;
          
            if (!user_id  || !pushToken) {
              return res.status(400).json({ error: 'User ID and push token are required' });
            }
          
            try {
              const user = await User.findByIdAndUpdate(
                user_id,
                { pushToken },
                { new: true, upsert: true } 
              );
          
              res.status(200).json({ message: 'Push token saved successfully', user });
            } catch (error) {
              console.error('Error saving push token:', error);
              res.status(500).json({ error: 'Internal server error' });
            }
          
      }),
    
      user_token_get: asyncHandler(async (req, res) => {
        const user_id = req.params.id;
      
        try {
          const user = await User.findById(user_id);
      
          if (!user || !user.pushToken) {
            return res.status(404).json({ error: 'Push token not found for this user' });
          }
      
          res.status(200).json({ pushToken: user.pushToken });
        } catch (error) {
          console.error('Error fetching push token:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }),
    user_details_update: asyncHandler(async (req, res) => {
        const { full_name, city, role, phone_number, email } = req.body
    
        const userValidationSchema = Joi.object({
            full_name: Joi.string(),
            
            city: Joi.string().valid('Lahore'),
            role: Joi.string().valid('driver', 'passenger'),
            phone_number: Joi.string().required(),
            email: Joi.string().email(),
           
           
        })
        const { error } = userValidationSchema.validate(req.body)
        if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message))
        const user_id = req.user_id
        const user = await User.findByIdAndUpdate(
            user_id,
            {
                full_name: full_name,
               
                city: city,
                role: role,
                phone_number: phone_number,
                email: email,
                
                
            },
            { new: true }
        )
        return res.status(200).json(new ApiResponse(200, user, 'user updated successfully'))
    })
   

}