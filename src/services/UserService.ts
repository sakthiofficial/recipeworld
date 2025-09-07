import { connectDB } from "@/lib/db";
import User from "@/models/User";

export class UserService {
  async getUser(userId: string) {
    await connectDB();
    return User.findById(userId).select("-password");
  }

  async findByEmail(email: string) {
    await connectDB();
    return User.findOne({ email });
  }

  async create(userData: { name: string; email: string; password: string }) {
    await connectDB();
    return User.create(userData);
  }

  async followUser(userId: string, targetId: string) {
    await connectDB();
    await User.findByIdAndUpdate(userId, {
      $addToSet: { following: targetId },
    });
    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: userId },
    });
    return { success: true };
  }

  async unfollowUser(userId: string, targetId: string) {
    await connectDB();
    await User.findByIdAndUpdate(userId, { $pull: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { followers: userId } });
    return { success: true };
  }

  async getFollowers(userId: string) {
    await connectDB();
    const user = await User.findById(userId).populate("followers");
    return user?.followers || [];
  }

  async getFollowing(userId: string) {
    await connectDB();
    const user = await User.findById(userId).populate("following");
    return user?.following || [];
  }

  async isFollowing(followerId: string, followingId: string) {
    await connectDB();
    const user = await User.findById(followerId);
    return user?.following.includes(followingId) || false;
  }
}
