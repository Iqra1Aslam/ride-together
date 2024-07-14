import { ApiResponse } from '../../services/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { User } from '../../models/user.models.js'
import Joi from 'joi'
import { sendMail } from '../../utils/nodeMailer.js'
import { otpCodeGenerator } from '../../utils/otpGenerator.js'
import { jwt_token_generator } from '../../utils/jwt.js'


export const auth = {
    register: asyncHandler(async (req, res) => {
        // get email and password from body
        const { email, password } = req.body
        // validation (joi)
        const userValidationSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(15).required()
        })
        const { error } = userValidationSchema.validate(req.body)
        if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message))

        // email already exist or not
        const userExist = await User.findOne({ email })
        if (userExist) return res.status(400).json(new ApiResponse(400, {}, 'user already exist'))

        // send mail (with OTP using NodeMailer)
        await sendMail(email, otpCodeGenerator)

        // save user
        const user = await User.create({ email, password })

        // create jwt token (user id) 
        const token = jwt_token_generator(user._id)

        // send response
        return res.status(201).json(new ApiResponse(201, { user, token }, 'user created successfully'))
    }),

    login: asyncHandler(async (req, res) => {

        // get email and password from body
        const { email, password } = req.body

        // validate body data with joi
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
        // get user_id from req which passed from middleware
        const user_id = req.user_id

        // get (otp_code) from body
        const { otp_code } = req.body

        // validation joi (min,max,string,required)
        const userValidationSchema = Joi.object({
            otp_code: Joi.string().min(4).max(4).required()
        })
        const { error } = userValidationSchema.validate(req.body)
        if (error) return res.status(400).json(new ApiResponse(error.code || 400, error, error.message))

        // match with email otp code (if error and invalid otp then throw error)
        if (otp_code !== otpCodeGenerator) return res.status(400).json(new ApiResponse(400, {}, 'otp not mached'))

        // update user.is_verified false to true

        /*
         hint :
           const user = await User.findByIdAndUpdate(user_id,{is_verified: true},{new:true})
        */
        const user = await User.findByIdAndUpdate(
            user_id,
            { is_verified: true },
            { new: true }
        )

        //  is_verified === true (if is still not updated then check)
        const check_user_verification = await User.findById(user._id)
        if (!check_user_verification.is_verified === true) return res.status(500).json(new ApiResponse(500, {}, 'still user is not verified'))

        // send response (200,{},'user is verified')
        return res.status(200).json(new ApiResponse(200, {}, 'user verified'))
    }),

    test: (req, res) => {
        res.json({ msg: 'oky' })
    }

}

