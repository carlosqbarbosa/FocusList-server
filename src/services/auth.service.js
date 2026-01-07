const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/database')
const authConfig = require('../config/auth')

const {
  CreateUserDTO,
  AuthResponseDTO
} = require('../dto/user.dto')

class AuthService {

  async register(data) {
    const createUserDTO = new CreateUserDTO(data)

    const [userExists] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ? AND deletado_em IS NULL',
      [createUserDTO.email]
    )

    if (userExists.length > 0) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    this.validatePassword(createUserDTO.senha)

    const senhaHash = await bcrypt.hash(
      createUserDTO.senha,
      authConfig.password.saltRounds
    )

    const [result] = await pool.query(
      `INSERT INTO usuarios (
        nome,
        sobrenome,
        email,
        senha_hash,
        criado_em,
        atualizado_em
      ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [
        createUserDTO.nome,
        createUserDTO.sobrenome,
        createUserDTO.email,
        senhaHash
      ]
    )

    const usuario = {
      id: result.insertId,
      nome: createUserDTO.nome,
      sobrenome: createUserDTO.sobrenome,
      email: createUserDTO.email,
    }

    try {
      await pool.query(
        'INSERT INTO usuarios_configuracoes (usuario_id) VALUES (?)',
        [usuario.id]
      )
    } catch (err) {
      console.warn('Tabela usuarios_configuracoes não encontrada (ignorado)')
    }

    const token = this.generateToken(usuario)
    const refreshToken = this.generateRefreshToken(usuario)

    return new AuthResponseDTO(usuario, token, refreshToken)
  }

  async login(email, senha) {
    try {
      console.log(' ====== DEBUG LOGIN ======')
      console.log(' Email recebido:', email)
      console.log(' Senha recebida:', senha)
      console.log(' Tipo da senha:', typeof senha)
      console.log(' Tamanho da senha:', senha?.length)
      
      const emailNormalizado = email.toLowerCase().trim()
      console.log(' Email normalizado:', emailNormalizado)

      console.log(' Buscando usuário no banco...')
      const [rows] = await pool.query(
        `SELECT
          id,
          nome,
          sobrenome,
          email,
          senha_hash,
          url_foto_perfil,
          criado_em,
          atualizado_em
        FROM usuarios
        WHERE email = ? AND deletado_em IS NULL`,
        [emailNormalizado]
      )

      console.log(' Quantidade de usuários encontrados:', rows.length)

      if (rows.length === 0) {
        console.log(' USER_NOT_FOUND')
        throw new Error('USER_NOT_FOUND')
      }

      const usuarioDB = rows[0]
      console.log(' Usuário encontrado:', {
        id: usuarioDB.id,
        nome: usuarioDB.nome,
        email: usuarioDB.email
      })
      console.log(' Hash do banco:', usuarioDB.senha_hash)
      console.log(' Hash começa com $2?', usuarioDB.senha_hash?.startsWith('$2'))
      console.log(' Tamanho do hash:', usuarioDB.senha_hash?.length)

      console.log(' Comparando senhas...')
      
      const senhaLimpa = senha.trim()
      console.log(' Senha após trim:', senhaLimpa)
      console.log(' Tamanho após trim:', senhaLimpa.length)
      
      const senhaValida = await bcrypt.compare(
        senhaLimpa,
        usuarioDB.senha_hash
      )

      console.log(' Resultado da comparação:', senhaValida)

      if (!senhaValida) {
        console.log(' INVALID_PASSWORD')
        throw new Error('INVALID_PASSWORD')
      }

      console.log(' Login válido! Gerando tokens...')

      delete usuarioDB.senha_hash

      const token = this.generateToken(usuarioDB)
      const refreshToken = this.generateRefreshToken(usuarioDB)

      console.log(' Tokens gerados com sucesso')
      console.log(' ====== FIM DEBUG ======')

      return new AuthResponseDTO(usuarioDB, token, refreshToken)

    } catch (error) {
      console.error(' ERRO NO LOGIN:', error.message)
      console.error('Stack:', error.stack)
      throw error
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        authConfig.jwt.refreshSecret
      )

      const [rows] = await pool.query(
        `SELECT id, nome, sobrenome, email
        FROM usuarios
        WHERE id = ? AND deletado_em IS NULL`,
        [decoded.id]
      )

      if (rows.length === 0) {
        throw new Error('USER_NOT_FOUND')
      }

      const usuario = rows[0]

      return {
        token: this.generateToken(usuario),
        refreshToken: this.generateRefreshToken(usuario)
      }
    } catch (error) {
      throw new Error('INVALID_TOKEN')
    }
  }

  generateToken(usuario, expiresIn = null) {
    return jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome
      },
      authConfig.jwt.secret,
      { expiresIn: expiresIn || authConfig.jwt.expiresIn }
    )
  }

  generateRefreshToken(usuario) {
    return jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      authConfig.jwt.refreshSecret,
      { expiresIn: authConfig.jwt.refreshExpiresIn }
    )
  }

  validatePassword(password) {
    if (password.length < authConfig.password.minLength) {
      throw new Error('PASSWORD_TOO_SHORT')
    }
    if (password.length > authConfig.password.maxLength) {
      throw new Error('PASSWORD_TOO_LONG')
    }
    if (
      authConfig.password.requireUppercase &&
      !/[A-Z]/.test(password)
    ) {
      throw new Error('PASSWORD_REQUIRE_UPPERCASE')
    }
    if (
      authConfig.password.requireNumbers &&
      !/[0-9]/.test(password)
    ) {
      throw new Error('PASSWORD_REQUIRE_NUMBERS')
    }
    if (
      authConfig.password.requireSpecialChars &&
      !/[!@#$%^&*]/.test(password)
    ) {
      throw new Error('PASSWORD_REQUIRE_SPECIAL')
    }
  }

  async verifyToken(token) {
    try {
      return jwt.verify(token, authConfig.jwt.secret)
    } catch (error) {
      throw new Error('INVALID_TOKEN')
    }
  }

  async alterarSenha(userId, senhaAtual, novaSenha) {
    try {
      const [rows] = await pool.query(
        'SELECT senha_hash FROM usuarios WHERE id = ? AND deletado_em IS NULL',
        [userId]
      )

      if (rows.length === 0) {
        throw new Error('USER_NOT_FOUND')
      }

      const senhaValida = await bcrypt.compare(
        senhaAtual,
        rows[0].senha_hash
      )

      if (!senhaValida) {
        throw new Error('INVALID_CURRENT_PASSWORD')
      }

      this.validatePassword(novaSenha)

      const novaSenhaHash = await bcrypt.hash(
        novaSenha,
        authConfig.password.saltRounds
      )

      await pool.query(
        'UPDATE usuarios SET senha_hash = ?, atualizado_em = NOW() WHERE id = ?',
        [novaSenhaHash, userId]
      )

      return true
    } catch (error) {
      throw error
    }
  }
}

module.exports = new AuthService()
