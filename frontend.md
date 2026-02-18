# Frontend Architecture - HR Leave Management System

## Overview

React 18 TypeScript SPA with Tailwind CSS. Supports 3 user roles (Employee, Manager, HR Admin).

## Tech Stack

- **Core:** React 18 + TypeScript 5.x
- **Router:** React Router 6.x
- **Styling:** Tailwind CSS 3.x
- **State:** Zustand (global) + TanStack Query (server)
- **Forms:** React Hook Form + Zod
- **UI Components:** Headless UI + Custom
- **Icons:** Lucide React
- **Date Picker:** react-datepicker
- **Charts:** Recharts (reports)

---

## Project Structure

```
src/
├── assets/         # Static files
├── components/
│   ├── ui/         # Reusable UI (Button, Input, Modal, etc.)
│   ├── layout/     # Layout parts (Sidebar, Header, etc.)
│   └── forms/      # Form-specific components
├── pages/
│   ├── auth/       # Login, ForgotPassword
│   ├── dashboard/  # Role-based dashboards
│   ├── requests/   # New, List, Detail
│   ├── approvals/  # Pending approvals
│   ├── team/       # Team calendar (manager)
│   ├── reports/    # HR reports
│   └── admin/      # HR admin settings
├── hooks/
│   ├── useAuth.ts
│   ├── useLeaveRequests.ts
│   └── ...
├── stores/
│   ├── authStore.ts
│   └── uiStore.ts
├── api/
│   ├── client.ts   # Axios instance
│   ├── auth.ts
│   ├── requests.ts
│   └── ...
├── types/
│   └── index.ts    # Type definitions
├── utils/
│   ├── dates.ts
│   └── formatters.ts
├── lib/
│   └── utils.ts    # cn() helper
├── App.tsx
└── main.tsx
```

---

## Routing

```typescript
// src/routes.tsx
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'requests', element: <RequestList /> },
      { path: 'requests/new', element: <NewRequest /> },
      { path: 'requests/:id', element: <RequestDetail /> },
      { path: 'approvals', element: <ApprovalList />, loader: requireRole(['MANAGER', 'HR_ADMIN']) },
      { path: 'team', element: <TeamView />, loader: requireRole(['MANAGER', 'HR_ADMIN']) },
      { path: 'reports', element: <Reports />, loader: requireRole('HR_ADMIN') },
      { path: 'profile', element: <Profile /> },
      { path: 'admin/*', element: <AdminRoutes />, loader: requireRole('HR_ADMIN') },
    ],
    loader: requireAuth,
  },
  {
    path: '/login',
    element: <Login />,
    loader: redirectIfAuth,
  },
]);
```

---

## Key Components

### 1. Layout (Sidebar Navigation)

```typescript
// src/components/layout/Layout.tsx
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, Calendar, FileText, Users, 
  BarChart3, Settings, Bell 
} from 'lucide-react';

export function Layout() {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/requests', icon: Calendar, label: 'My Requests' },
    ...(user?.role === 'MANAGER' ? [
      { to: '/approvals', icon: FileText, label: 'Approvals' },
      { to: '/team', icon: Users, label: 'Team' },
    ] : []),
    ...(user?.role === 'HR_ADMIN' ? [
      { to: '/approvals', icon: FileText, label: 'Approvals' },
      { to: '/reports', icon: BarChart3, label: 'Reports' },
      { to: '/admin', icon: Settings, label: 'Admin' },
    ] : []),
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">HR Leave</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={logout} className="...">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">{/* Page title */}</h2>
            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="text-sm">{user?.firstName} {user?.lastName}</span>
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

---

### 2. Auth Context

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
  department?: { id: string; name: string };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, token) => set({ user, accessToken: token }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

---

### 3. API Client

```typescript
// src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add JWT
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default apiClient;
```

---

### 4. Leave Request Form

```typescript
// src/pages/requests/NewRequest.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { api } from '@/api/requests';

const schema = z.object({
  type: z.enum(['VACATION', 'SICK_LEAVE', 'REMOTE_WORK', 'PARENTAL', 'TRAINING', 'OTHER']),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type FormData = z.infer<typeof schema>;

export function NewRequest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = 
    useForm<FormData>({
      resolver: zodResolver