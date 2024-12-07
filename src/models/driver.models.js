import { Schema, model } from 'mongoose';


const vehicle_schema = new Schema({
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    car_type: {
        type: String
    },
    vehicle_color: {
        type: String
    },
    vehicle_model: {
        type: String
    },
    vehicle_plate_number: {
        type: String
    },
    number_of_seats: {
        type: Number
    },
    vehicle_image: {
        type: String,
         default: 'https://shorturl.at/mpFGT'
    },
    vehicle_dox_image: {
        type: String
    },
    is_vehicle_verified: {
        type: Boolean,
        default: false
    },
   
}, {
    timestamps: true
});
const driver_schema = new Schema({

    driver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: true, // This ensures the driver is always linked to a user
    },
    name: {
        type: String,
        // required: true, // Driver's name is required
    },
    phone: {
        type: String,
        // required: true, // Phone number is required
    },
    cnic: {
        type: String,
        // required: true, // CNIC is required
    },

    ratings: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            rating: { type: Number, required: true, min: 1, max: 5 },
            comment: { type: String }
        }
    ],
    ratingCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 }
   
    ,
    driver_id_confirmation: {
        type: String,
    },
    is_driver_verified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

vehicle_schema.index({ location: '2dsphere' });
export const Vehicle = model('Vehicle', vehicle_schema);
export const Driver = model('Driver', driver_schema);