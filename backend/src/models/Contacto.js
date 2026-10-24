const mongoose = require('mongoose');

const contactoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    correo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    asunto: {
      type: String,
      trim: true,
      maxlength: 120,
      default: 'Consulta desde la web',
    },
    mensaje: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 3000,
    },
    estado: {
      type: String,
      enum: ['nuevo', 'leido', 'respondido'],
      default: 'nuevo',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('contacto', contactoSchema);
