import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'article_submitted',
        'changes_requested',
        'article_approved',
        'article_rejected',
        'assignment_received',
        'assignment_deadline_approaching',
        'assignment_cancelled',
        'writer_article_submitted',
        'writer_article_resubmitted',
        'new_writer_registered',
        'new_writer_application',
        'application_approved',
        'application_rejected',
        'assigned_work_submitted',
      ],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    entityType: {
      type: String,
      enum: ['article', 'assignment', 'user', 'system'],
      default: 'system',
    },
    entityId: {
      type: String,
      default: null,
    },
    eventId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
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

// Compound indexes for efficient recipient notifications query & unread counting
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
