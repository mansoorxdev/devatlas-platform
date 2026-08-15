import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
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
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to database and normalize email using async/await
userSchema.pre('save', async function () {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();
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
