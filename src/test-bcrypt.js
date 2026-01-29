import bcrypt from 'bcryptjs';

async function test() {
  const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye/IQ3LOoHHXnQhVJy8E7eZBU.7F6W3yq';

  console.log('teste123 =>', await bcrypt.compare('teste123', hash));
  console.log('password =>', await bcrypt.compare('password', hash));
}

test();
