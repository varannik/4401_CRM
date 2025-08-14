import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/users/[id] - Update user role and department
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role, departmentId } = body;

    // Validate role
    const validRoles = ['consultant', 'dept_admin', 'sys_admin'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: consultant, dept_admin, sys_admin' },
        { status: 400 }
      );
    }

    // Additional role assignment restrictions
    if (currentUserRole === 'dept_admin') {
      // dept_admin can only manage consultants and other dept_admins in their department
      if (role === 'sys_admin') {
        return NextResponse.json(
          { error: 'Department administrators cannot assign sys_admin role' },
          { status: 403 }
        );
      }

      // Check if the target user is in the same department or if assigning to their department
      const targetUser = await prisma.user.findUnique({
        where: { id: id }
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email || '' }
      });

      if (!currentUser) {
        return NextResponse.json(
          { error: 'Current user not found' },
          { status: 404 }
        );
      }

      // dept_admin can only manage users in their own department
      if (targetUser.departmentId !== currentUser.departmentId && 
          departmentId !== currentUser.departmentId) {
        return NextResponse.json(
          { error: 'Department administrators can only manage users in their own department' },
          { status: 403 }
        );
      }
    }

    // Validate department exists if provided
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });

      if (!department) {
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        ...(role && { role }),
        ...(departmentId !== undefined && { departmentId })
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        departmentId: updatedUser.departmentId,
        department: updatedUser.department,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Failed to update user:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}