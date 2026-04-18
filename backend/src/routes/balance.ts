import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';
const router = Router();
const prisma = new PrismaClient();
router.use(protect);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const balances = await prisma.openingBalance.findMany({
      where: { userId: req.userId! }, orderBy: { date: 'desc' }, take: 30
    });
    res.json(balances);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.get('/latest', async (req: AuthRequest, res) => {
  try {
    const balance = await prisma.openingBalance.findFirst({
      where: { userId: req.userId! }, orderBy: { date: 'desc' }
    });
    res.json(balance || { aedCash: 0, aedBank: 0, tzsCash: 0, tzsBank: 0 });
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { aedCash, aedBank, tzsCash, tzsBank, notes, date } = req.body;
    const balance = await prisma.openingBalance.create({
      data: {
        userId: req.userId!,
        aedCash: parseFloat(aedCash) || 0,
        aedBank: parseFloat(aedBank) || 0,
        tzsCash: parseFloat(tzsCash) || 0,
        tzsBank: parseFloat(tzsBank) || 0,
        notes, date: date ? new Date(date) : new Date()
      }
    });
    res.json(balance);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

export default router;