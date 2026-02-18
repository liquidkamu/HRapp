# Backend Architecture - HR Leave Management System

## Overview

REST API for HR Leave Management supporting ~200 employees. Handles leave requests, approvals, reporting, and notifications.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express 4.x
- **ORM:** Prisma 5.x
- **Database:** PostgreSQL 15+
- **Auth:** JWT (access + refresh tokens)
- **Validation:** Zod
- **Testing:** Jest + Supertest
- **Email:** Nodemailer + SendGrid
- **Logging:** Winston

---

## Project Structure

```
src/
├── config/           # Env & config
│   ├── database.ts
│   ├── auth.ts
│   └── email.ts
├── prisma/
│   └── schema.prisma # Database schema
├── api/
│   ├── routes/       # Route definitions
│   ├── controllers/  # HTTP handlers
│   ├── services/     # Business logic
│   ├── middleware/   # Auth, validation, error handling
│   └── validators/   # Zod schemas
├── lib/
│   ├── prisma.ts     # DB client singleton
│   ├── jwt.ts        # Token utilities
│   ├── email.ts      # Email service
│   └── logger.ts     # Winston logger
├── jobs/             # Scheduled tasks (cron)
├── types/            # TypeScript types
└── app.ts            # Express app config
```

---

## Database Schema (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum UserRole {
  EMPLOYEE
  MANAGER
  HR_ADMIN
}

enum LeaveType {
  VACATION
  SICK_LEAVE
  REMOTE_WORK
  PARENTAL
  TRAINING
  OTHER
}

enum RequestStatus {
  DRAFT
  PENDING
  MANAGER_APPROVED
  HR_APPROVED
  REJECTED
  CANCELLED
}

enum ApprovalAction {
  APPROVE
  REJECT
}

// Models
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String    // bcrypt hash
  firstName     String
  lastName      String
  role          UserRole  @default(EMPLOYEE)
  departmentId  String?
  managerId     String?
  startDate     DateTime  // Employment start date
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  department    Department?  @relation(fields: [departmentId], references: [id])
  manager       User?        @relation("ManagerToDirectReports", fields: [managerId], references: [id])
  directReports User[]       @relation("ManagerToDirectReports")
  requests      LeaveRequest[]
  balances      LeaveBalance[]
  approvals     ApprovalStep[]

  @@index([departmentId])
  @@index([managerId])
}

model Department {
  id        String   @id @default(uuid())
  name      String   @unique
  createdAt DateTime @default(now())
  
  users     User[]
}

model LeaveBalance {
  id        String @id @default(uuid())
  userId    String
  year      Int
  totalDays Float  // Annual allowance
  usedDays  Float  @default(0)
  
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, year])
  @@index([userId])
}

model LeaveRequest {
  id          String        @id @default(uuid())
  userId      String
  type        LeaveType
  startDate   DateTime      @db.Date
  endDate     DateTime      @db.Date
  workingDays Float         // Calculated, excludes weekends/holidays
  reason      String?
  status      RequestStatus @default(DRAFT)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  approvalSteps ApprovalStep[]
  
  @@index([userId])
  @@index([status])
  @@index([startDate, endDate])
}

model ApprovalStep {
  id          String         @id @default(uuid())
  requestId   String
  approverId  String
  stepNumber  Int            // 1 = Manager, 2 = HR
  action      ApprovalAction?
  comment     String?
  decidedAt   DateTime?
  createdAt   DateTime       @default(now())
  
  request     LeaveRequest   @relation(fields: [requestId], references: [id], onDelete: Cascade)
  approver    User           @relation(fields: [approverId], references: [id])
  
  @@unique([requestId, stepNumber])
  @@index([requestId])
  @@index([approverId])
}

model CompanyHoliday {
  id   String   @id @default(uuid())
  date DateTime @db.Date
  name String
  
  @@unique([date])
}

// For notifications log
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String   // REQUEST_SUBMITTED, APPROVED, REJECTED, etc.
  message   String
  isRead    Boolean  @default(false)
  requestId String?
  createdAt DateTime @default(now())
  
  @@index([userId, isRead])
}
```

---

## API Endpoints

### Auth Routes

```typescript
// POST /api/v1/auth/login
// Request
{
  "email": "user@company.com",
  "password": "string"
}

// Response
{
  "user": {
    "id": "uuid",
    "email": "user@company.com",
    "firstName": "Anna",
    "lastName": "Kowalska",
    "role": "EMPLOYEE",
    "department": { "id": "uuid", "name": "Engineering" }
  },
  "tokens": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 3600
  }
}

// POST /api/v1/auth/refresh
// POST /api/v1/auth/logout
// POST /api/v1/auth/forgot-password
// POST /api/v1/auth/reset-password
```
