const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Falta MONGODB_URI en el archivo .env');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log('Conexión con MongoDB establecida.');
}

module.exports = connectDatabase;
