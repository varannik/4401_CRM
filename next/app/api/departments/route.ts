import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/departments - List all departments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check if user has appropriate permissions
    const currentUserRole = session.user.role;
    if (currentUserRole !== 'sys_admin' && currentUserRole !== 'dept_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions to view departments' },
        { status: 403 }
      );
    }

    type DepartmentWithCounts = {
      id: string;
      name: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
      _count: { users: number; companies: number };
    };
    let departments: DepartmentWithCounts[];

    if (currentUserRole === 'sys_admin') {
      // sys_admin can see all departments
      departments = await prisma.department.findMany({
        include: {
          _count: {
            select: {
              users: true,
              companies: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
    } else {
      // dept_admin can only see their own department
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email || '' },
        include: { department: true }
      });

      if (!currentUser?.department) {
        return NextResponse.json(
          { error: 'No department assigned to current user' },
          { status: 404 }
        );
      }

      departments = [
        {
          id: currentUser.department.id,
          name: currentUser.department.name,
          description: currentUser.department.description,
          createdAt: currentUser.department.createdAt,
          updatedAt: currentUser.department.updatedAt,
          _count: {
            users: await prisma.user.count({
              where: { departmentId: currentUser.departmentId }
            }),
            companies: await prisma.company.count({
              where: { ownerDepartmentId: currentUser.departmentId }
            })
          }
        }
      ];
    }

    return NextResponse.json({
      departments: departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        description: dept.description,
        userCount: dept._count.users,
        companyCount: dept._count.companies,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt
      }))
    });
    
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch departments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/departments - Create new department (sys_admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check if user has sys_admin role
    if (session.user.role !== 'sys_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Only system administrators can create departments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        description: description || null
      }
    });

    return NextResponse.json({
      department: {
        id: department.id,
        name: department.name,
        description: department.description,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Failed to create department:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json(
        { error: 'Department name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create department',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}