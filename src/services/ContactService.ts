import { connectDB } from "@/lib/db";
import Contact from "@/models/Contact";

export class ContactService {
  async createContact(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    await connectDB();

    // Basic validation
    if (!data.name || !data.email || !data.subject || !data.message) {
      throw new Error("All fields are required");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format");
    }

    // Length validations
    if (data.name.length > 100) {
      throw new Error("Name must be less than 100 characters");
    }
    if (data.email.length > 255) {
      throw new Error("Email must be less than 255 characters");
    }
    if (data.subject.length > 200) {
      throw new Error("Subject must be less than 200 characters");
    }
    if (data.message.length > 2000) {
      throw new Error("Message must be less than 2000 characters");
    }

    const contact = await Contact.create({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      isRead: false,
    });

    return contact;
  }

  async getContacts(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) {
    await connectDB();

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (params?.isRead !== undefined) {
      filter.isRead = params.isRead;
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getContactById(id: string) {
    await connectDB();
    return Contact.findById(id);
  }

  async markAsRead(id: string) {
    await connectDB();
    return Contact.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }

  async markAsUnread(id: string) {
    await connectDB();
    return Contact.findByIdAndUpdate(id, { isRead: false }, { new: true });
  }

  async deleteContact(id: string) {
    await connectDB();
    return Contact.findByIdAndDelete(id);
  }

  async getUnreadCount() {
    await connectDB();
    return Contact.countDocuments({ isRead: false });
  }
}
