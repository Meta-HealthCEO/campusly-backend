import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums.js';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: Types.ObjectId;
  profileImage?: string;
  phone?: string;
  isActive: boolean;
  isDeleted: boolean;
  refreshTokens: string[];
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isSchoolPrincipal: boolean;
  isHOD: boolean;
  departmentId?: Types.ObjectId | null;
  isBursar: boolean;
  isReceptionist: boolean;
  isCounselor: boolean;
  isStandaloneTeacher: boolean;
  isStandaloneCoach: boolean;
  onboardingDismissed: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
    },
    profileImage: {
      type: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
    lastLoginAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    isSchoolPrincipal: {
      type: Boolean,
      default: false,
    },
    isHOD: {
      type: Boolean,
      default: false,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    isBursar: {
      type: Boolean,
      default: false,
    },
    isReceptionist: {
      type: Boolean,
      default: false,
    },
    isCounselor: {
      type: Boolean,
      default: false,
    },
    isStandaloneTeacher: {
      type: Boolean,
      default: false,
    },
    isStandaloneCoach: {
      type: Boolean,
      default: false,
    },
    onboardingDismissed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ schoolId: 1, role: 1 });
userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ schoolId: 1, isHOD: 1 });
userSchema.index({ schoolId: 1, isSchoolPrincipal: 1 });
userSchema.index({ schoolId: 1, isCounselor: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
