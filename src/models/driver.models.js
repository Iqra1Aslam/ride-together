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
        type: String
    },
    vehicle_dox_image: {
        type: String
    },
    is_vehicle_verified: {
        type: Boolean,
        default: false
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
}, {
    timestamps: true
});
const driver_schema = new Schema({

        driver: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        cnic: {
            type: String
        },
        driver_lisence_image: {
            type: String
        },
        driver_id_confirmation: {
            type: String

        },
        is_driver_verified: {
            type: Boolean,
            default: false
        }
       
    
},{timestamps: true})

vehicle_schema.index({ location: '2dsphere' });
export const Vehicle = model('Vehicle', vehicle_schema);
export const Driver = model('Driver', driver_schema);