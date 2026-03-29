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

// ─── Boarding Log ──────────────────────────────────────────────────────────

export interface IBoardingLog extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  routeId: Types.ObjectId;
  boardedAt: Date;
  alightedAt?: Date;
  boardingLat?: number;
  boardingLng?: number;
  alightingLat?: number;
  alightingLng?: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const boardingLogSchema = new Schema<IBoardingLog>(
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
    routeId: {
      type: Schema.Types.ObjectId,
      ref: 'BusRoute',
      required: true,
    },
    boardedAt: {
      type: Date,
      required: true,
    },
    alightedAt: {
      type: Date,
    },
    boardingLat: {
      type: Number,
    },
    boardingLng: {
      type: Number,
    },
    alightingLat: {
      type: Number,
    },
    alightingLng: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

boardingLogSchema.index({ studentId: 1, boardedAt: -1 });
boardingLogSchema.index({ routeId: 1, boardedAt: -1 });
boardingLogSchema.index({ schoolId: 1, boardedAt: -1 });

export const BoardingLog = mongoose.model<IBoardingLog>('BoardingLog', boardingLogSchema);

// ─── Transport Alert ───────────────────────────────────────────────────────

export type TransportAlertType = 'delay' | 'breakdown' | 'route_change' | 'emergency' | 'weather';
export type TransportAlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ITransportAlert extends Document {
  schoolId: Types.ObjectId;
  routeId?: Types.ObjectId;
  type: TransportAlertType;
  title: string;
  message: string;
  severity: TransportAlertSeverity;
  isResolved: boolean;
  resolvedAt?: Date;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const transportAlertSchema = new Schema<ITransportAlert>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    routeId: {
      type: Schema.Types.ObjectId,
      ref: 'BusRoute',
    },
    type: {
      type: String,
      enum: ['delay', 'breakdown', 'route_change', 'emergency', 'weather'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

transportAlertSchema.index({ schoolId: 1, isResolved: 1 });
transportAlertSchema.index({ routeId: 1, isResolved: 1 });
transportAlertSchema.index({ schoolId: 1, type: 1 });

export const TransportAlert = mongoose.model<ITransportAlert>('TransportAlert', transportAlertSchema);
