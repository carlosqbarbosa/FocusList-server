import bcrypt from 'bcryptjs';

async function generate() {
  const hash = await bcrypt.hash('teste123', 10);
  console.log('HASH CORRETO:', hash);
}

generate();
