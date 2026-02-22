import { Schema, model, Document, Model, Types } from "mongoose";

export interface IRealEstateLead extends Document {

  searchQuery: string;
  timestamp: Date;
  matchedProperties: Types.ObjectId[];
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  location?: string;
  status: 'new' | 'inquiry' | 'contacted' | 'converted' | 'archived';
  notes?: string;
  source?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface IRealEstateLeadModel extends Model<IRealEstateLead> {
  findLeadsByUser(userId: Types.ObjectId): Promise<IRealEstateLead[]>;
  findLeadsByStatus(status: string): Promise<IRealEstateLead[]>;
}

const RealEstateLeadSchema = new Schema<IRealEstateLead, IRealEstateLeadModel>({

  searchQuery: {
    type: String,

    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  matchedProperties: [{
    type: Schema.Types.ObjectId,
    ref: 'Property',
    default: []
  }],
  contactInfo: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'inquiry', 'contacted', 'converted', 'archived'],
    default: 'new',
    index: true
  },
  notes: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    trim: true,
    enum: ['website', 'app', 'referral', 'other', 'popup'],
    default: 'website'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
RealEstateLeadSchema.index({ user_id: 1, status: 1 });
RealEstateLeadSchema.index({ 'contactInfo.email': 1 });

// Static methods
RealEstateLeadSchema.statics.findLeadsByUser = async function (
  userId: Types.ObjectId
): Promise<IRealEstateLead[]> {
  return this.find({ user_id: userId })
    .populate('user_id', 'name email')
    .populate('matchedProperties', 'title price')
    .sort({ timestamp: -1 });
};

RealEstateLeadSchema.statics.findLeadsByStatus = async function (
  status: string
): Promise<IRealEstateLead[]> {
  return this.find({ status })
    .populate('user_id', 'name email')
    .populate('matchedProperties', 'title price')
    .sort({ timestamp: -1 });
};

// Virtual for lead age (in days)
RealEstateLeadSchema.virtual('ageInDays').get(function () {
  const diff = Date.now() - this.timestamp.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Middleware to update timestamp when status changes
RealEstateLeadSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.timestamp = new Date();
  }
  next();
});

export const RealEstateLeadModel = model<IRealEstateLead, IRealEstateLeadModel>(
  "RealEstateLead",
  RealEstateLeadSchema
);
