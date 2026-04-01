const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const JWT_SECRET = process.env.JWT_SECRET || 'ocuscan_super_secret_key_123';

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const setup2FA = async (req, res) => {
  try {
    const secret = 'JBSWY3DPEHPK3PXP'; // Simulated secret
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorSecret: secret, isTwoFactorEnabled: true }
    });
    res.json({ secret, qrCode: `https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/ClariEye:${req.user.email}?secret=${secret}&issuer=ClariEye` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verify2FA = async (req, res) => {
  const { code } = req.body;
  if (code === '123456') {
     res.json({ success: true });
  } else {
     res.status(400).json({ error: 'Invalid 2FA code' });
  }
};

module.exports = { register, login, setup2FA, verify2FA };
