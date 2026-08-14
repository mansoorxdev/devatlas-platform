import mongoose from 'mongoose';

export const ERROR_CATEGORIES = [
  'database',
  'authentication',
  'build-tooling',
  'runtime-exception',
  'api-network',
  'environment-config',
];

export const ERROR_LANGUAGES = [
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

const errorSolutionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Error solution title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Error solution slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    errorMessage: {
      type: String,
      required: [true, 'Raw error message is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Error category is required'],
      enum: {
        values: ERROR_CATEGORIES,
        message: 'Unsupported error category',
      },
      lowercase: true,
      trim: true,
      index: true,
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      enum: {
        values: ERROR_LANGUAGES,
        message: 'Unsupported programming language',
      },
      lowercase: true,
      trim: true,
      index: true,
    },
    cause: {
      type: String,
      required: [true, 'Error cause explanation is required'],
      trim: true,
    },
    solution: {
      type: String,
      required: [true, 'Error solution walkthrough is required'],
      trim: true,
    },
    codeFix: {
      type: String,
      trim: true,
      default: '',
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
      required: [true, 'Error solution author is required'],
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
errorSolutionSchema.index({ status: 1, publishedAt: -1 });
errorSolutionSchema.index({ language: 1, status: 1 });
errorSolutionSchema.index({ category: 1, status: 1 });

// Text index for search functionality across title, errorMessage, cause, solution, and tags
// Note: language_override is set to 'text_language' so MongoDB does not treat the programming language field as a text-stemming language.
errorSolutionSchema.index(
  { title: 'text', errorMessage: 'text', cause: 'text', solution: 'text', tags: 'text' },
  { language_override: 'text_language' }
);

const ErrorSolution = mongoose.model('ErrorSolution', errorSolutionSchema);

export default ErrorSolution;
