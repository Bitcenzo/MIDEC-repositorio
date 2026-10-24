const express = require('express');
const Contacto = require('../models/Contacto');

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  const correo = String(req.body.correo || '').trim().toLowerCase();
  const asunto = String(req.body.asunto || '').trim() || 'Consulta desde la web';
  const mensaje = String(req.body.mensaje || '').trim();
  const website = String(req.body.website || '').trim();

  // Campo invisible para personas; si está completo, se trata como spam.
  if (website) {
    return res.status(200).json({ message: 'Mensaje enviado correctamente.' });
  }

  if (nombre.length < 2 || nombre.length > 100) {
    return res.status(400).json({ message: 'Ingresá un nombre de entre 2 y 100 caracteres.' });
  }

  if (correo.length > 160 || !emailRegex.test(correo)) {
    return res.status(400).json({ message: 'Ingresá una dirección de correo válida.' });
  }

  if (asunto.length > 120) {
    return res.status(400).json({ message: 'El asunto no puede superar los 120 caracteres.' });
  }

  if (mensaje.length < 10 || mensaje.length > 3000) {
    return res.status(400).json({ message: 'El mensaje debe tener entre 10 y 3000 caracteres.' });
  }

  try {
    await Contacto.create({ nombre, correo, asunto, mensaje });
    return res.status(201).json({ message: '¡Gracias por escribirnos! Tu mensaje quedó registrado.' });
  } catch (error) {
    console.error('Error al guardar un contacto:', error.message);
    return res.status(500).json({ message: 'No pudimos guardar el mensaje. Probá de nuevo más tarde.' });
  }
});

module.exports = router;
