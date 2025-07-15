import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Communication from '@/models/Communication';
import Contact from '@/models/Contact';
import Company from '@/models/Company';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const communications = await Communication.find({})
      .populate('contact', 'firstName lastName')
      .populate('company', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(communications);
  } catch (error) {
    console.error('Error fetching communications:', error);
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
      type,
      subject,
      content,
      contactId,
      companyId,
      project,
      contract,
      initiative,
      direction,
      status,
      scheduledDate,
      completedDate,
      assignedTo,
      emailMetadata
    } = body;

    await dbConnect();

    // Validate required fields
    if (!type || !subject || !content || !direction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate contact exists if provided
    if (contactId) {
      const contact = await Contact.findById(contactId);
      if (!contact) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }
    }

    // Validate company exists if provided
    if (companyId) {
      const company = await Company.findById(companyId);
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
    }

    const communication = new Communication({
      type,
      subject,
      content,
      contact: contactId || undefined,
      company: companyId || undefined,
      project,
      contract,
      initiative,
      direction,
      status: status || 'completed',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      completedDate: completedDate ? new Date(completedDate) : new Date(),
      createdBy: (session.user as any).id,
      assignedTo,
      emailMetadata,
    });

    await communication.save();

    // Populate the response
    await communication.populate('contact', 'firstName lastName');
    await communication.populate('company', 'name');
    await communication.populate('createdBy', 'name email');
    await communication.populate('assignedTo', 'name email');

    return NextResponse.json(communication, { status: 201 });
  } catch (error) {
    console.error('Error creating communication:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 