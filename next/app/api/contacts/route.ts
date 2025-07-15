import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Contact from '@/models/Contact';
import Company from '@/models/Company';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const contacts = await Contact.find({})
      .populate('company', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      department,
      companyId,
      leadSource,
      assignedTo,
      status,
      notes,
      socialProfiles
    } = body;

    await dbConnect();

    // Validate required fields
    if (!firstName || !lastName || !email || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if contact with this email already exists
    const existingContact = await Contact.findOne({ email });
    if (existingContact) {
      return NextResponse.json(
        { error: 'Contact with this email already exists' },
        { status: 409 }
      );
    }

    const contact = new Contact({
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      department,
      company: companyId,
      leadSource,
      assignedTo,
      status: status || 'lead',
      notes,
      socialProfiles,
      createdBy: (session.user as any).id,
    });

    await contact.save();

    // Populate the response
    await contact.populate('company', 'name');
    await contact.populate('assignedTo', 'name email');
    await contact.populate('createdBy', 'name email');

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 