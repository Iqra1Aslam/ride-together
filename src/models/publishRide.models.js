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

  driverAvailability:{
    type: Boolean,
    default: true
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
  
  pricePerSeat: { type: Number, required: true },
  
  bookedPassengers: [ // Array to store booked passengers
    {
      passengerId: { type: Schema.Types.ObjectId, ref: 'User' },
      passengerDetails: {
        id: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        gender: { type: String }
      }
    }
  ],
  
  status: {
    type: String,
    enum: ['pending', 'waiting', 'requested', 'accepted', 'completed', 'cancelled'],
    default: 'waiting'
  },
  booked_seats: { type: Number, default: 0 }
});

// Create a geospatial index on the pickup location
publishRideSchema.index({ pickup_location: '2dsphere' });

export const PublishRide = model('PublishRide', publishRideSchema);
