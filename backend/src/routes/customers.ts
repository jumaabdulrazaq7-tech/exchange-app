import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';
const router = Router();
const prisma = new PrismaClient();
router.use(protect);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { userId: req.userId! },
      include: { _count: { select: { transactions: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    const customer = await prisma.customer.create({
      data: { userId: req.userId!, name, phone, email, notes }
    });
    res.json(customer);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.get('/:id/transactions', async (req: AuthRequest, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { customerId: req.params.id, userId: req.userId! },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id, userId: req.userId! } });
    res.json({ message: 'Imefutwa' });
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

export default router;