import { Schema, model } from 'mongoose';

const vehicle_schema = new Schema({
        rider: {
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
        }

},
{
    timestamps: true
});

const rider_schema = new Schema({

        rider: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        cnic: {
            type: String
        },
        rider_lisence_image: {
            type: String
        },
        rider_id_confirmation: {
            type: String

        },
        is_rider_verified: {
            type: Boolean,
            default: false
        }
    
},{timestamps: true})

export const Vehicle = model('Vehicle', vehicle_schema);
export const Rider = model('Rider', rider_schema);