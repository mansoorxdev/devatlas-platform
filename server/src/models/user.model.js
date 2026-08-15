import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Prevent password hash leakage by default
    },
    role: {
      type: String,
      enum: ['admin', 'writer'],
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio must not exceed 500 characters'],
      default: '',
    },
    avatar: {
      type: String,
      trim: true,
      default: 'avatar-01',
    },
    avatarType: {
      type: String,
      enum: ['default', 'uploaded'],
      default: 'default',
    },
    expertise: {
      type: [String],
      default: [],
    },
    socialLinks: {
      github: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
      website: { type: String, trim: true, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to database, normalize email, and auto-generate unique slug
userSchema.pre('save', async function () {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();
  }

  // Auto-generate or update unique author slug handling collisions (-1, -2)
  if (this.isModified('name') || !this.slug) {
    let baseSlug = slugify(this.name);
    if (!baseSlug) baseSlug = 'author';

    let uniqueSlug = baseSlug;
    let count = 1;
    while (await mongoose.models.User.findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
      uniqueSlug = `${baseSlug}-${count}`;
      count++;
    }
    this.slug = uniqueSlug;
  }

  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password hashes safely
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Reusable serialization transform function
const transformFn = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.password;
  delete ret.__v;
  delete ret.createdAt;
  delete ret.updatedAt;
  return ret;
};

// Strip database metadata and password hashes automatically during serialization (both JSON and Object transforms)
userSchema.set('toJSON', { transform: transformFn });
userSchema.set('toObject', { transform: transformFn });

const User = mongoose.model('User', userSchema);

export default User;
