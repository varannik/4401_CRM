import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunication extends Document {
  type: 'email' | 'phone' | 'meeting' | 'note' | 'task';
  subject: string;
  content: string;
  contact?: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  project?: string;
  contract?: string;
  initiative?: string;
  direction: 'inbound' | 'outbound';
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledDate?: Date;
  completedDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  emailMetadata?: {
    messageId?: string;
    threadId?: string;
    fromEmail?: string;
    toEmails?: string[];
    ccEmails?: string[];
    bccEmails?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const CommunicationSchema = new Schema<ICommunication>({
  type: { 
    type: String, 
    enum: ['email', 'phone', 'meeting', 'note', 'task'], 
    required: true 
  },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  project: { type: String },
  contract: { type: String },
  initiative: { type: String },
  direction: { 
    type: String, 
    enum: ['inbound', 'outbound'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled'], 
    default: 'completed' 
  },
  scheduledDate: { type: Date },
  completedDate: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  emailMetadata: {
    messageId: String,
    threadId: String,
    fromEmail: String,
    toEmails: [String],
    ccEmails: [String],
    bccEmails: [String],
  },
}, {
  timestamps: true
});

// Indexes for efficient searches
CommunicationSchema.index({ contact: 1, createdAt: -1 });
CommunicationSchema.index({ company: 1, createdAt: -1 });
CommunicationSchema.index({ project: 1, createdAt: -1 });
CommunicationSchema.index({ contract: 1, createdAt: -1 });
CommunicationSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.models.Communication || mongoose.model<ICommunication>('Communication', CommunicationSchema); 