import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import balanceRoutes from './routes/balance';
import rateRoutes from './routes/rates';
import transactionRoutes from './routes/transactions';
import customerRoutes from './routes/customers';
import expenseRoutes from './routes/expenses';
import loanRoutes from './routes/loans';
import reportRoutes from './routes/reports';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reports', reportRoutes);

app.listen(PORT, () => console.log('Server inaendesha kwenye port ' + PORT));