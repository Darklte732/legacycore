export default function handler(req, res) {
  res.status(200).json({ name: 'LegacyCore API', status: 'online' });
} 