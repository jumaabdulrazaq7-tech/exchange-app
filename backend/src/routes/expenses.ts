import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';
const router = Router();
const prisma = new PrismaClient();
router.use(protect);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = { userId: req.userId! };
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }
    const expenses = await prisma.expense.findMany({
      where, orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { category, amount, currency, notes, date } = req.body;
    const expense = await prisma.expense.create({
      data: {
        userId: req.userId!, category,
        amount: parseFloat(amount),
        currency: currency || 'TZS', notes,
        date: date ? new Date(date) : new Date()
      }
    });
    res.json(expense);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id, userId: req.userId! } });
    res.json({ message: 'Imefutwa' });
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

export default router;