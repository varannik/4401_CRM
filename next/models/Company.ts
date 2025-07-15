import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  website?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  leadSource?: string;
  assignedDepartment?: string;
  status: 'prospect' | 'active' | 'inactive' | 'archived';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true },
  domain: { type: String },
  industry: { type: String },
  size: { type: String },
  website: { type: String },
  description: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  leadSource: { type: String },
  assignedDepartment: { type: String },
  status: { 
    type: String, 
    enum: ['prospect', 'active', 'inactive', 'archived'], 
    default: 'prospect' 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema); 