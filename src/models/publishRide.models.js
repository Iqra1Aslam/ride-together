import { Schema, model } from 'mongoose';

const publishRideSchema = new Schema({
  passengerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
 
  passengerDetails: {
    id: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    gender: { type: String }
  },
 
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  vehicleId: { // Reference to the vehicle
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  
  pickup_location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  
  dropLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  
  date: { type: Date, required: true },
  starttime: { type: Date, required: true },
  endtime: { type: Date, required: true },
  
  numSeats: { type: Number, required: true },
  initialNumSeats: { type: Number, required: false }, // Store initial seats for discount logic
  initialPricePerSeat: { type: Number, required: false }, // Store initial price for discount calculation
  availableSeats: { type: Number, default:4 },
  pricePerSeat: { type: Number, required: true },
  
  bookedPassengers: [ // Array to store booked passengers
    {
      passengerId: { type: Schema.Types.ObjectId, ref: 'User' },
      passengerDetails: {
        id: { type: Schema.Types.ObjectId, ref: 'User' },
     
       
      }
    }
  ],
  
  status: {
    type: String,
    enum: ['waiting', 'requested','active', 'accepted', 'completed', 'cancelled'],
    default: 'active'
  }
});

// Create a geospatial index on the pickup location
publishRideSchema.index({ pickup_location: '2dsphere' });

export const PublishRide = model('PublishRide', publishRideSchema);