import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthRequest } from '../middleware/auth';
const router = Router();
const prisma = new PrismaClient();
router.use(protect);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const { type } = req.query;
    const loans = await prisma.loan.findMany({
      where: { userId: req.userId!, ...(type ? { type: type as any } : {}) },
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(loans);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { type, personName, phone, amount, currency, dueDate, notes, customerId } = req.body;
    const loan = await prisma.loan.create({
      data: {
        userId: req.userId!, type, personName, phone,
        amount: parseFloat(amount),
        currency: currency || 'TZS',
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        customerId: customerId || null
      }
    });
    res.json(loan);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.patch('/:id/pay', async (req: AuthRequest, res) => {
  try {
    const { paidAmount } = req.body;
    const loan = await prisma.loan.findUnique({ where: { id: req.params.id } });
    if (!loan) return res.status(404).json({ message: 'Haikupatikana' });
    const newPaid = loan.paidAmount + parseFloat(paidAmount);
    const status = newPaid >= loan.amount ? 'PAID' : 'PARTIAL';
    const updated = await prisma.loan.update({
      where: { id: req.params.id },
      data: { paidAmount: newPaid, status }
    });
    res.json(updated);
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.loan.delete({ where: { id: req.params.id, userId: req.userId! } });
    res.json({ message: 'Imefutwa' });
  } catch { res.status(500).json({ message: 'Tatizo la seva' }); }
});

export default router;