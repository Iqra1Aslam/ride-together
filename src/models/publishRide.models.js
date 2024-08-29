import { Schema, model } from 'mongoose';

const publishRideSchema = new Schema({
  passengerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
  pricePerSeat: { type: Number, required: true },
  status: {
    type: String,
    enum: ['waiting', 'matched', 'completed'],
    default: 'waiting'
  }
});

publishRideSchema.index({ pickup_location: '2dsphere' });

export const PublishRide = model('PublishRide', publishRideSchema);
