import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role: 'admin' | 'team_lead' | 'user';
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { 
    type: String, 
    enum: ['admin', 'team_lead', 'user'], 
    default: 'user' 
  },
  department: { type: String },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 