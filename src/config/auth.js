module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'seu-secret-super-secreto-mude-isso',
    expiresIn: process.env.JWT_EXPIRATION || '7d', 
    
    
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    refreshExpiresIn: '30d' 
  },
  
  password: {
    saltRounds: 10, 
    minLength: 6,
    maxLength: 128,
    requireUppercase: false, 
    requireNumbers: false,
    requireSpecialChars: false
  },

  
  session: {
    maxActiveDevices: 5, 
    rememberMeDuration: '30d' 
  }
};
