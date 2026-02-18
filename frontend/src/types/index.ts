export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
  department?: { id: string; name: string };
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'VACATION' | 'SICK_LEAVE' | 'REMOTE_WORK' | 'PARENTAL' | 'TRAINING' | 'OTHER';
  startDate: string;
  endDate: string;
  workingDays: number;
  reason?: string;
  status: string;
  createdAt: string;
  user?: { firstName: string; lastName: string };
}

export interface LeaveBalance {
  totalDays: number;
  usedDays: number;
  remaining: number;
}
