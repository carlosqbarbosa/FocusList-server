const express = require('express')
const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { assunto, mensagem } = req.body

    if (!assunto || !mensagem) {
      return res.status(400).json({
        success: false,
        message: 'Assunto e mensagem são obrigatórios'
      })
    }

    return res.json({
      success: true,
      message: 'Ticket de suporte criado com sucesso'
    })
  } catch (error) {
    console.error('Erro no suporte:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar ticket de suporte'
    })
  }
})

router.get('/', async (req, res) => {
  try {
    return res.json({
      success: true,
      data: []
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar tickets'
    })
  }
})

module.exports = router
