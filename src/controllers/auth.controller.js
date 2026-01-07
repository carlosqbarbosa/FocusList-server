const authService = require('../services/auth.service')

class AuthController {

   async login(req, res) {
    try {
      const { email, senha } = req.body

      if (!email || !senha) {
        return res.status(400).json({
          message: 'Email e senha são obrigatórios'
        })
      }

      const response = await authService.login(email, senha)

      return res.status(200).json(response)

    } catch (error) {
      console.error('Erro no login:', error.message)

      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({ message: 'Usuário não encontrado' })
      }

      if (error.message === 'INVALID_PASSWORD') {
        return res.status(401).json({ message: 'Senha inválida' })
      }

      return res.status(500).json({
        message: 'Erro interno no servidor'
      })
    }
  
  }

  
  async register(req, res) {
    try {
      const response = await authService.register(req.body)
      return res.status(201).json(response)
    } catch (error) {
      console.error('Erro no register:', error.message)

      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({ message: 'Email já cadastrado' })
      }

      return res.status(500).json({
        message: 'Erro interno no servidor'
      })
    }
  }

  async refreshToken(req, res) {
    try {
      const response = await authService.refreshToken(req.body)
      return res.status(200).json(response)
    } catch (error) {
      return res.status(401).json({ message: 'Refresh token inválido' })
    }
  }

  async logout(req, res) {
    return res.status(200).json({ message: 'Logout realizado com sucesso' })
  }

  async verificarToken(req, res) {
    return res.status(200).json({ valid: true })
  }
}

module.exports = new AuthController()
