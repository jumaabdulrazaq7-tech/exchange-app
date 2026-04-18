import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';
const router = Router();
const prisma = new PrismaClient();
router.use(protect);

router.get('/summary', async (req: AuthRequest, res) => {
  try {
    const { period } = req.query;
    const now = new Date();
    let startDate = new Date();
    if (period === 'day') { startDate.setHours(0, 0, 0, 0); }
    else if (period === 'week') { startDate.setDate(now.getDate() - 7); }
    else if (period === 'month') { startDate = new Date(now.getFullYear(), now.getMonth(), 1); }
    else { startDate.setHours(0, 0, 0, 0); }

    const [transactions, expenses, loans] = await Promise.all([
      prisma.transaction.findMany({ where: { userId: req.userId!, date: { gte: startDate } } }),
      prisma.expense.findMany({ where: { userId: req.userId!, date: { gte: startDate } } }),
      prisma.loan.findMany({ where: { userId: req.userId!, status: { not: 'PAID' } } })
    ]);

    const totalProfit = transactions.reduce((s, t) => s + t.profit, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalProfit - totalExpenses;
    const totalAedBought = transactions.filter(t => t.type === 'BUY').reduce((s, t) => s + t.aedAmount, 0);
    const totalAedSold = transactions.filter(t => t.type === 'SELL').reduce((s, t) => s + t.aedAmount, 0);
    const pendingLoansGiven = loans.filter(l => l.type === 'GIVEN').reduce((s, l) => s + (l.amount - l.paidAmount), 0);
    const pendingLoansReceived = loans.filter(l => l.type === 'RECEIVED').reduce((s, l) => s + (l.amount - l.paidAmount), 0);

    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const dayTx = transactions.filter(t => new Date(t.date) >= day && new Date(t.date) < nextDay);
      const dayExp = expenses.filter(e => new Date(e.date) >= day && new Date(e.date) < nextDay);
      dailyData.push({
        date: day.toLocaleDateString('sw-TZ', { weekday: 'short', day: 'numeric' }),
        profit: dayTx.reduce((s, t) => s + t.profit, 0),
        expenses: dayExp.reduce((s, e) => s + e.amount, 0),
        transactions: dayTx.length
      });
    }

    res.json({
      totalTransactions: transactions.length,
      totalAedBought, totalAedSold,
      totalProfit, totalExpenses, netProfit,
      pendingLoansGiven, pendingLoansReceived,
      dailyData
    });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Tatizo la seva' }); }
});

export default router;