import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'


const userSchema = new Schema(
    {
        full_name: {
            type: String
        },
        profile_image: {
            type: String,
            default: 'https://shorturl.at/mpFGT'
        },
        role: {
            type: String,
            enum: ['driver', 'passenger', 'admin'],
            default: 'passenger'
        },
        phone_number: {
            type: String
        },
        email: {
            type: String
        },
        address: {
            type: String
        },
        city: {
            type: String
        },
        gender: { type: String,
            // default: 'men'
         },
        is_verified: {
            type: Boolean,
            default: false
        },
        is_admin: {
            type: Boolean,
            default: false
        },
        password: {
            type: String
        }, 
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires:{
            type:  Date
        },
        newPassword:{
            type: String
        },
       
        
    },
    {
        timestamps: true
    })



userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 8)
})

userSchema.methods.is_password_correct = async function (password) {
    return await bcrypt.compare(password, this.password)
}


export const User = model('User', userSchema)