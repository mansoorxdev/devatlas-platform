import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    brief: {
      type: String,
      required: [true, 'Content brief is required'],
      trim: true,
      minlength: [10, 'Brief must be at least 10 characters'],
      maxlength: [3000, 'Brief cannot exceed 3000 characters'],
    },
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned writer is required'],
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin assigner is required'],
      index: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    language: {
      type: String,
      trim: true,
      default: 'English',
    },
    targetKeywords: {
      type: [String],
      default: [],
    },
    targetWordCount: {
      type: Number,
      default: 1000,
      min: [100, 'Target word count must be at least 100 words'],
      max: [20000, 'Target word count cannot exceed 20,000 words'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'submitted', 'completed', 'cancelled'],
      default: 'assigned',
      index: true,
    },
    additionalInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for fast admin and writer query filtering
assignmentSchema.index({ writer: 1, status: 1, deadline: 1 });
assignmentSchema.index({ assignedBy: 1, status: 1 });

const ArticleAssignment = mongoose.model('ArticleAssignment', assignmentSchema);

export default ArticleAssignment;
