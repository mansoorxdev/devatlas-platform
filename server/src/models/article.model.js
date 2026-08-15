import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Article slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    summary: {
      type: String,
      required: [true, 'Article summary is required'],
      trim: true,
      maxlength: [500, 'Summary cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    featuredImage: {
      type: String,
      trim: true,
      default: '',
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [200, 'SEO title cannot exceed 200 characters'],
      default: '',
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'SEO description cannot exceed 300 characters'],
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'Backend',
      index: true,
    },
    language: {
      type: String,
      trim: true,
      default: 'English',
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'changes_requested', 'rejected', 'published', 'unpublished', 'archived'],
      default: 'draft',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredAt: {
      type: Date,
      default: null,
    },
    reviewNote: {
      type: String,
      default: null,
    },
    reviewHistory: [
      {
        action: {
          type: String,
          enum: ['request_changes', 'reject', 'submit', 'resubmit', 'approve'],
        },
        note: { type: String, default: '' },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    revisions: [
      {
        action: {
          type: String,
          enum: [
            'publish',
            'unpublish',
            'archive',
            'restore',
            'edit_content',
            'feature',
            'unfeature',
            'approve',
            'reject',
            'request_changes',
          ],
        },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: '' },
        snapshot: {
          title: { type: String, default: '' },
          summary: { type: String, default: '' },
          category: { type: String, default: '' },
          language: { type: String, default: '' },
          status: { type: String, default: '' },
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Article author is required'],
      index: true,
    },
    readTime: {
      type: Number,
      default: 1,
      min: [1, 'Read time must be at least 1 minute'],
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArticleAssignment',
      default: null,
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

// Compound index for efficient public paginated queries (status + publishedAt)
articleSchema.index({ status: 1, publishedAt: -1 });

// Text index for search functionality over title, summary, and tags
articleSchema.index({ title: 'text', summary: 'text', tags: 'text' });

const Article = mongoose.model('Article', articleSchema);

export default Article;
