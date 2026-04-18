import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;
    if (!name || !email || !password || !businessName)
      return res.status(400).json({ message: 'Jaza sehemu zote' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Barua pepe hii tayari ipo' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, password: hashed, businessName } });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, businessName: user.businessName } });
  } catch { res.status(500).json({ message: 'Kuna tatizo la seva' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Barua pepe au neno la siri si sahihi' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Barua pepe au neno la siri si sahihi' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, businessName: user.businessName } });
  } catch { res.status(500).json({ message: 'Kuna tatizo la seva' }); }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Hakuna token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, businessName: true, plan: true, createdAt: true }
    });
    res.json(user);
  } catch { res.status(401).json({ message: 'Token batili' }); }
});

export default router;