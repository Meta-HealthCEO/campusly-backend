import mongoose, { Schema, Document } from 'mongoose';

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
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
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

schoolSchema.index({ name: 1 });

export const School = mongoose.model<ISchool>('School', schoolSchema);
