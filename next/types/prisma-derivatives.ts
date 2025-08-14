import type { User, Department } from '@prisma/client';

export type UserWithDepartment = User & {
  department: Pick<Department, 'id' | 'name'> | null;
};


