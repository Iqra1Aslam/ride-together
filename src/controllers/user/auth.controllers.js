import { ApiResponse } from '../../services/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { User } from '../../models/user.models.js'
import Joi from 'joi'
import { sendMail } from '../../utils/nodeMailer.js'
import { otpCodeGenerator } from '../../utils/otpGenerator.js'
import { jwt_token_generator } from '../../utils/jwt.js'
import bcrypt from 'bcrypt'

export const auth = {
    register: asyncHandler(async (req, res) => {
       
        const { email, password } = req.body
       
        const userValidationSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(15).required()
        })
        const { error } = userValidationSchema.validate(req.body)
        if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message))

        const userExist = await User.findOne({ email })
        if (userExist) return res.status(400).json(new ApiResponse(400, {}, 'user already exist'))

        await sendMail(email, otpCodeGenerator)

        
        const user = await User.create({ email, password })

        const token = jwt_token_generator(user._id)

        // send response
        return res.status(201).json(new ApiResponse(201, { user, token }, 'user created successfully'))
    }),

    login: asyncHandler(async (req, res) => {

        
        const { email, password } = req.body

        const userValidationSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(15).required()
        })
        const { error } = userValidationSchema.validate(req.body)
        if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message))

        // chk usr exist
        const user = await User.findOne({ email })
        if (!user)
            return res.status(400).json(new ApiResponse(400, {}, 'user does not already exist'))

        //pass chk
        await user.is_password_correct(password)
        const token = jwt_token_generator(user._id)

        // send response
        return res.status(200).json(new ApiResponse(200, { user, token }, 'user login successfully'))
    }),

    verify_otp: asyncHandler(async (req, res) => {
        const user_id = req.user_id
        const { otp_code } = req.body

        const userValidationSchema = Joi.object({
            otp_code: Joi.string().min(4).max(4).required()
        })
        const { error } = userValidationSchema.validate(req.body)
        if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message))

        if (otp_code !== otpCodeGenerator) return res.status(400).json(new ApiResponse(400, {}, 'otp not mached'))

        const user = await User.findByIdAndUpdate(
            user_id,
            { is_verified: true },
            { new: true }
        )

       
        const check_user_verification = await User.findById(user._id)
        if (!check_user_verification.is_verified === true)
             return res.status(500).json(new ApiResponse(500, {}, 'still user is not verified'))

        return res.status(200).json(new ApiResponse(200, {}, 'user verified'))
    }),
    
    forget_password:asyncHandler(async(req,res)=>{
        const {email}=req.body
        const otp_code = otpCodeGenerator ;
       
        try{
            const user=await User.findOne({email});
            if(!user){
                return res.status(404).json(new ApiResponse(404),{},"User not found")
            }
            
            console.log('Generated OTP:', otp_code);
           
            user.resetPasswordToken = otp_code;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();
            await sendMail(email, otp_code)
           
    
          
        return res.status(200).json(new ApiResponse(200, { user},'OTP sent to your email' )); 

        } catch (error) {
            res.status(500).json(new ApiResponse(500,{},"Error"));
        }
        
    }),
    reset_password: asyncHandler(async (req, res) => {
        const { email, otp_code, newPassword } = req.body;
    
        try {
           
            const user = await User.findOne({
                email,
                resetPasswordToken: otp_code,
                resetPasswordExpires: { $gt: Date.now() } // Ensure OTP is not expired
            });
    
            if (!user) {
                return res.status(404).json(new ApiResponse(404, {}, "OTP not found"));
            }
    
           
            const hashedPassword = await bcrypt.hash(newPassword, 8);
    
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
    
            await user.save();
    
            // Generate a new JWT token
            const token = jwt_token_generator(user._id);
    
            // Send response
            res.status(200).json(new ApiResponse(200, { token }, 'Password reset successfully'));
        } catch (error) {
            console.error('Error resetting password:', error.message);
            res.status(500).json(new ApiResponse(500, {}, 'An error occurred'));
        }
    }),
    

   

}

