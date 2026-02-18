"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret';
// Mock database (in-memory for demo)
const users = [
    {
        id: '1',
        email: 'anna@firma.pl',
        passwordHash: bcrypt_1.default.hashSync('demo123', 10),
        firstName: 'Anna',
        lastName: 'Kowalska',
        role: 'EMPLOYEE',
        department: { id: '1', name: 'IT' },
    },
    {
        id: '2',
        email: 'tomek@firma.pl',
        passwordHash: bcrypt_1.default.hashSync('demo123', 10),
        firstName: 'Tomek',
        lastName: 'Nowak',
        role: 'MANAGER',
        department: { id: '1', name: 'IT' },
    },
    {
        id: '3',
        email: 'kasia@firma.pl',
        passwordHash: bcrypt_1.default.hashSync('demo123', 10),
        firstName: 'Kasia',
        lastName: 'Lewandowska',
        role: 'HR_ADMIN',
        department: { id: '2', name: 'HR' },
    },
];
const leaveRequests = [
    {
        id: 'req-1',
        userId: '1',
        type: 'VACATION',
        startDate: '2026-03-15',
        endDate: '2026-03-20',
        workingDays: 6,
        reason: 'Wyjazd na narty',
        status: 'HR_APPROVED',
        createdAt: '2026-02-01',
        user: { firstName: 'Anna', lastName: 'Kowalska' },
    },
];
const leaveBalances = [
    { userId: '1', year: 2026, totalDays: 26, usedDays: 6 },
];
// Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token)
        return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
// Auth Routes
app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !await bcrypt_1.default.compare(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            department: user.department,
        },
        tokens: { accessToken: token },
    });
});
app.get('/api/v1/users/me', authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
    });
});
// Leave Requests
app.get('/api/v1/requests', authMiddleware, (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;
    let requests = leaveRequests;
    if (role === 'EMPLOYEE') {
        requests = leaveRequests.filter(r => r.userId === userId);
    }
    // MANAGER i HR_ADMIN widzą wszystko
    res.json({ requests });
});
app.post('/api/v1/requests', authMiddleware, (req, res) => {
    const { type, startDate, endDate, workingDays, reason } = req.body;
    const newRequest = {
        id: `req-${Date.now()}`,
        userId: req.user.id,
        type,
        startDate,
        endDate,
        workingDays,
        reason,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        user: { firstName: req.user.email.split('@')[0], lastName: '' },
    };
    leaveRequests.push(newRequest);
    // Update balance
    const balance = leaveBalances.find(b => b.userId === req.user.id && b.year === 2026);
    if (balance)
        balance.usedDays += workingDays;
    res.status(201).json({ request: newRequest });
});
app.put('/api/v1/requests/:id/:action', authMiddleware, (req, res) => {
    const { id, action } = req.params;
    const request = leaveRequests.find(r => r.id === id);
    if (!request)
        return res.status(404).json({ error: 'Not found' });
    const role = req.user.role;
    if (role === 'EMPLOYEE')
        return res.status(403).json({ error: 'Forbidden' });
    if (action === 'approve') {
        request.status = role === 'HR_ADMIN' ? 'HR_APPROVED' : 'MANAGER_APPROVED';
    }
    else if (action === 'reject') {
        request.status = 'REJECTED';
    }
    res.json({ request });
});
// Balance
app.get('/api/v1/balance', authMiddleware, (req, res) => {
    const balance = leaveBalances.find(b => b.userId === req.user.id && b.year === 2026);
    res.json({
        totalDays: balance?.totalDays || 26,
        usedDays: balance?.usedDays || 0,
        remaining: (balance?.totalDays || 26) - (balance?.usedDays || 0),
    });
});
// Reports (HR only)
app.get('/api/v1/reports/summary', authMiddleware, (req, res) => {
    if (req.user.role !== 'HR_ADMIN')
        return res.status(403).json({ error: 'Forbidden' });
    const summary = {
        totalRequests: leaveRequests.length,
        byStatus: {
            PENDING: leaveRequests.filter(r => r.status === 'PENDING').length,
            APPROVED: leaveRequests.filter(r => r.status.includes('APPROVED')).length,
            REJECTED: leaveRequests.filter(r => r.status === 'REJECTED').length,
        },
        byType: {
            VACATION: leaveRequests.filter(r => r.type === 'VACATION').length,
            SICK: leaveRequests.filter(r => r.type === 'SICK_LEAVE').length,
        },
    };
    res.json(summary);
});
app.listen(PORT, () => {
    console.log(`🚀 HR Backend running on http://localhost:${PORT}`);
});
