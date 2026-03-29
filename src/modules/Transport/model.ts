import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Bus Route ──────────────────────────────────────────────────────────────

export interface IBusStop {
  name: string;
  time: string;
  latitude?: number;
  longitude?: number;
}

export interface IBusRoute extends Document {
  name: string;
  schoolId: Types.ObjectId;
  driverName: string;
  driverPhone: string;
  vehicleRegistration: string;
  capacity: number;
  stops: IBusStop[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const busStopSchema = new Schema<IBusStop>(
  {
    name: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  { _id: false },
);

const busRouteSchema = new Schema<IBusRoute>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    driverPhone: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleRegistration: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    stops: {
      type: [busStopSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

busRouteSchema.index({ schoolId: 1, isActive: 1 });
busRouteSchema.index({ schoolId: 1, name: 1 });

export const BusRoute = mongoose.model<IBusRoute>('BusRoute', busRouteSchema);

// ─── Transport Assignment ───────────────────────────────────────────────────

export type TransportDirection = 'morning' | 'afternoon' | 'both';

export interface ITransportAssignment extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  busRouteId: Types.ObjectId;
  stopName: string;
  direction: TransportDirection;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const transportAssignmentSchema = new Schema<ITransportAssignment>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    busRouteId: {
      type: Schema.Types.ObjectId,
      ref: 'BusRoute',
      required: true,
    },
    stopName: {
      type: String,
      required: true,
      trim: true,
    },
    direction: {
      type: String,
      enum: ['morning', 'afternoon', 'both'],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

transportAssignmentSchema.index({ studentId: 1, busRouteId: 1 });
transportAssignmentSchema.index({ schoolId: 1, busRouteId: 1 });

export const TransportAssignment = mongoose.model<ITransportAssignment>(
  'TransportAssignment',
  transportAssignmentSchema,
);
