import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  company: mongoose.Types.ObjectId;
  leadSource?: string;
  assignedTo?: mongoose.Types.ObjectId;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  notes?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  jobTitle: { type: String },
  department: { type: String },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  leadSource: { type: String },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['lead', 'prospect', 'customer', 'inactive'], 
    default: 'lead' 
  },
  notes: { type: String },
  socialProfiles: {
    linkedin: String,
    twitter: String,
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

// Index for efficient searches
ContactSchema.index({ email: 1 });
ContactSchema.index({ company: 1 });
ContactSchema.index({ assignedTo: 1 });

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema); 