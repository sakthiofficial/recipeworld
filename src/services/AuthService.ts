import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User, { IUser } from "@/models/User";

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  code?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  token?: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  private readonly JWT_EXPIRES_IN = "7d";

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      await connectDB();

      const { email, password } = data;

      // Validate input
      if (!email || !password) {
        return {
          success: false,
          message: "Email and password are required",
        };
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return {
          success: false,
          message: "No account found with this email address",
          code: "USER_NOT_FOUND",
        };
      }

      // Check if user has a password (for non-OAuth users)
      if (!user.password) {
        return {
          success: false,
          message:
            "This account was created with Google. Please continue with Google.",
          code: "GOOGLE_ACCOUNT_ONLY",
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid password",
          code: "INVALID_PASSWORD",
        };
      }

      // Generate JWT token
      const token = this.generateToken(user._id.toString());

      return {
        success: true,
        message: "Login successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An error occurred during login",
      };
    }
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      await connectDB();

      const { name, email, password } = data;

      // Validate input
      if (!name || !email || !password) {
        return {
          success: false,
          message: "Name, email and password are required",
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          message: "Password must be at least 6 characters long",
        };
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        // Check if user has a password (manual signup) or not (Google OAuth only)
        if (existingUser.password) {
          return {
            success: false,
            message:
              "An account with this email already exists. Please sign in instead.",
            code: "USER_EXISTS_WITH_PASSWORD",
          };
        } else {
          return {
            success: false,
            message:
              "An account with this email exists via Google. Please continue with Google.",
            code: "USER_EXISTS_GOOGLE_ONLY",
          };
        }
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        followers: [],
        following: [],
      });

      try {
        await newUser.save();
      } catch (saveError: unknown) {
        // Handle MongoDB duplicate key error (E11000)
        const mongoError = saveError as { code?: number };
        if (mongoError.code === 11000) {
          return {
            success: false,
            message:
              "An account with this email already exists. Please sign in instead.",
            code: "USER_EXISTS_WITH_PASSWORD",
          };
        }
        throw saveError;
      }

      // Generate JWT token
      const token = this.generateToken(newUser._id.toString());

      return {
        success: true,
        message: "Account created successfully",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
        },
        token,
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: "An error occurred during signup",
      };
    }
  }

  async facebookLogin(): Promise<AuthResponse> {
    try {
      await connectDB();

      // This method is for manual Facebook token verification
      // In practice, NextAuth.js handles Google OAuth automatically
      // This is here for completeness if you need manual Google login

      // For now, we'll just return an error since NextAuth handles this
      return {
        success: false,
        message: "Please use the Google OAuth button for Google login",
      };
    } catch {
      return {
        success: false,
        message: "An error occurred during Google login",
      };
    }
  }

  async verifyToken(
    token: string
  ): Promise<{ valid: boolean; userId?: string }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      return { valid: true, userId: decoded.userId };
    } catch {
      return { valid: false };
    }
  }

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      await connectDB();
      const user = await User.findById(userId).select("-password");
      return user;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }
}
