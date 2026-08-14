import mongoose from 'mongoose';

export const SNIPPET_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'go',
  'rust',
  'html',
  'css',
  'sql',
  'shell',
  'json',
  'yaml',
];

const snippetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Snippet title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Snippet slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [500, 'Summary cannot exceed 500 characters'],
      default: '',
    },
    code: {
      type: String,
      required: [true, 'Snippet code content is required'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      enum: {
        values: SNIPPET_LANGUAGES,
        message: 'Unsupported programming language',
      },
      lowercase: true,
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Snippet author is required'],
      index: true,
    },
    publishedAt: {
      type: Date,
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

// Compound indexes for public filtering and pagination
snippetSchema.index({ status: 1, publishedAt: -1 });
snippetSchema.index({ language: 1, status: 1 });

// Text index for search functionality across title, summary, code, and tags
// Note: language_override is set to 'text_language' so MongoDB does not treat the programming language field as a text-stemming language.
snippetSchema.index(
  { title: 'text', summary: 'text', code: 'text', tags: 'text' },
  { language_override: 'text_language' }
);

const Snippet = mongoose.model('Snippet', snippetSchema);

export default Snippet;
