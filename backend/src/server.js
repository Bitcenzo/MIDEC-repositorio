require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDatabase = require('./config/database');
const contactoRoutes = require('./routes/contacto');

const app = express();
const PORT = process.env.PORT || 3000;

// Render termina el tráfico HTTPS en un proxy; confiar en el primer proxy permite
// identificar correctamente la IP del visitante para el límite de solicitudes.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(
  cors({
    origin(origin, callback) {
      // Los clientes sin Origin pueden ser herramientas de prueba como curl.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Se recibieron demasiados intentos. Probá de nuevo en 15 minutos.' },
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'midec-contacto' });
});

app.use('/api/contacto', contactLimiter, contactoRoutes);

app.use((error, _req, res, _next) => {
  if (error.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ message: 'Origen no permitido.' });
  }
  console.error('Error de API:', error.message);
  return res.status(500).json({ message: 'Ocurrió un error en el servidor.' });
});

connectDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API de MIDEC activa en el puerto ${PORT}.`);
    });
  })
  .catch((error) => {
    console.error('No se pudo iniciar la API:', error.message);
    process.exit(1);
  });
