import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Company from '@/models/Company';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const companies = await Company.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
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
      name,
      domain,
      industry,
      size,
      website,
      description,
      address,
      leadSource,
      assignedDepartment,
      status
    } = body;

    await dbConnect();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Check if company with this name already exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      );
    }

    const company = new Company({
      name,
      domain,
      industry,
      size,
      website,
      description,
      address,
      leadSource,
      assignedDepartment,
      status: status || 'prospect',
      createdBy: (session.user as any).id,
    });

    await company.save();

    // Populate the response
    await company.populate('createdBy', 'name email');

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 