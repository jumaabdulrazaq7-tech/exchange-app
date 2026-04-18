import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';
const router = Router();
const prisma = new PrismaClient();
router.use(protect);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const rates = await prisma.exchangeRate.findMany({
      where: { userId: req.userId! }, orderBy: { date: 'desc' }, take: 30
    });
    res.json(rates);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.get('/latest', async (req: AuthRequest, res) => {
  try {
    const rate = await prisma.exchangeRate.findFirst({
      where: { userId: req.userId! }, orderBy: { date: 'desc' }
    });
    res.json(rate || { buyRate: 0, sellRate: 0 });
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { buyRate, sellRate } = req.body;
    const rate = await prisma.exchangeRate.create({
      data: { userId: req.userId!, buyRate: parseFloat(buyRate), sellRate: parseFloat(sellRate) }
    });
    res.json(rate);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

export default router;