import { Schema, model } from 'mongoose';

const publishRideSchema = new Schema({
  passengerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  pickup_location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
  },
  dropLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  time: {
    type: Date,
    required: true
  },
 
  numSeats: {
    type: Number,
    required: true,
  },
  pricePerSeat: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'matched', 'completed'],
    default: 'waiting'
  } // waiting, matched, completed
});

publishRideSchema.index({ pickup_location: '2dsphere' });
export const publishRide = model('Ride', publishRideSchema);