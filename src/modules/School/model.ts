import mongoose, { Schema, Document, type Types } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface IContactInfo {
  email: string;
  phone: string;
  website?: string;
}

export interface ISubscription {
  tier: 'basic' | 'standard' | 'premium';
  expiresAt: Date;
}

export interface ISettings {
  academicYear: number;
  terms: number;
  gradingSystem: 'percentage' | 'letter' | 'gpa';
}

export interface ISchool extends Document {
  name: string;
  address: IAddress;
  logo?: string;
  contactInfo: IContactInfo;
  subscription: ISubscription;
  modulesEnabled: string[];
  settings: ISettings;
  principal?: string;
  emisNumber?: string;
  type?: 'primary' | 'secondary' | 'combined' | 'special';
  joinCode: string;
  plan: 'standalone' | 'school';
  ownerUserId?: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Generate a random 6-character alphanumeric join code (uppercase). */
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const contactInfoSchema = new Schema<IContactInfo>(
  {
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
  },
  { _id: false },
);

const subscriptionSchema = new Schema<ISubscription>(
  {
    tier: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { _id: false },
);

const settingsSchema = new Schema<ISettings>(
  {
    academicYear: { type: Number, required: true },
    terms: { type: Number, required: true },
    gradingSystem: {
      type: String,
      enum: ['percentage', 'letter', 'gpa'],
      required: true,
    },
  },
  { _id: false },
);

const schoolSchema = new Schema<ISchool>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: addressSchema,
      required: true,
    },
    logo: {
      type: String,
    },
    contactInfo: {
      type: contactInfoSchema,
      required: true,
    },
    subscription: {
      type: subscriptionSchema,
      required: true,
    },
    modulesEnabled: {
      type: [String],
      default: [],
    },
    settings: {
      type: settingsSchema,
      required: true,
    },
    principal: {
      type: String,
      trim: true,
    },
    emisNumber: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['primary', 'secondary', 'combined', 'special'],
    },
    joinCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    plan: {
      type: String,
      enum: ['standalone', 'school'],
      default: 'school',
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

schoolSchema.index({ name: 1 });
schoolSchema.index({ joinCode: 1 }, { unique: true });

schoolSchema.pre('save', function () {
  if (!this.joinCode) {
    this.joinCode = generateJoinCode();
  }
});

export const School = mongoose.model<ISchool>('School', schoolSchema);
