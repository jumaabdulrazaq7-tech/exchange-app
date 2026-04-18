import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';
const router = Router();
const prisma = new PrismaClient();
router.use(protect);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const where: any = { userId: req.userId! };
    if (type) where.type = type;
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }
    const transactions = await prisma.transaction.findMany({
      where, include: { customer: true }, orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { type, aedAmount, tzsAmount, rate, customerId, paymentMethod, notes, date } = req.body;
    const latestRate = await prisma.exchangeRate.findFirst({
      where: { userId: req.userId! }, orderBy: { date: 'desc' }
    });
    let profit = 0;
    if (latestRate) {
      if (type === 'SELL') profit = parseFloat(aedAmount) * (parseFloat(rate) - latestRate.buyRate);
      else profit = parseFloat(aedAmount) * (latestRate.sellRate - parseFloat(rate));
    }
    const tx = await prisma.transaction.create({
      data: {
        userId: req.userId!, type,
        aedAmount: parseFloat(aedAmount),
        tzsAmount: parseFloat(tzsAmount),
        rate: parseFloat(rate),
        profit,
        customerId: customerId || null,
        paymentMethod: paymentMethod || 'CASH',
        notes,
        date: date ? new Date(date) : new Date()
      },
      include: { customer: true }
    });
    res.json(tx);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.transaction.delete({ where: { id: req.params.id, userId: req.userId! } });
    res.json({ message: 'Imefutwa' });
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

export default router;