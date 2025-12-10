// Funções de hash e comparação usando bcrypt

const bcrypt = require('bcrypt');

const hash = async (plain) => {
  return bcrypt.hash(plain, 10);
};

const compare = async (plain, hashed) => {
  return bcrypt.compare(plain, hashed);
};

module.exports = { hash, compare };
