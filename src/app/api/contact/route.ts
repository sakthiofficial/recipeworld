import { NextRequest, NextResponse } from "next/server";
import { ContactService } from "@/services/ContactService";
import { rateLimit } from "@/lib/rateLimit";

const contactService = new ContactService();

// Rate limiting for contact submissions (max 3 per hour per IP)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 3, // Max 3 submissions per interval
});

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const identifier =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimitCheck = limiter(identifier);
    if (!rateLimitCheck) {
      return NextResponse.json(
        { error: "Too many contact submissions. Please try again in an hour." },
        { status: 429 }
      );
    }

    const body = await req.json();

    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Create contact entry
    const contact = await contactService.createContact({
      name,
      email,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
      contact: {
        id: contact._id,
        name: contact.name,
        subject: contact.subject,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET endpoint for admin to retrieve contacts
export async function GET(req: NextRequest) {
  try {
    // Note: In a real app, you'd want to protect this with admin authentication
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const isRead = searchParams.get("isRead");

    const params: { page: number; limit: number; isRead?: boolean } = {
      page,
      limit,
    };
    if (isRead !== null) {
      params.isRead = isRead === "true";
    }

    const result = await contactService.getContacts(params);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
