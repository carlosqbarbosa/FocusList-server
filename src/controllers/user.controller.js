const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

class UserController {

  async perfil(req, res) {
    const userId = req.userId;
    console.log(' [PERFIL] userId:', userId);

    try {
      const [rows] = await pool.query(
        `SELECT id, nome, sobrenome, email, url_foto_perfil, plano, preferences, criado_em
         FROM usuarios
         WHERE id = ? AND deletado_em IS NULL`,
        [userId]
      );

      console.log(' [PERFIL] result.rows:', rows);

      const usuario = rows[0];

      if (usuario && usuario.preferences) {
        try {
          usuario.preferences = typeof usuario.preferences === 'string' 
            ? JSON.parse(usuario.preferences) 
            : usuario.preferences;
        } catch (e) {
          usuario.preferences = { notifications: { tasks: true, pomodoro: false } };
        }
      } else if (usuario) {
        usuario.preferences = { notifications: { tasks: true, pomodoro: false } };
      }

      return sendSuccess(res, usuario);
    } catch (error) {
      console.error(' [PERFIL] Erro:', error);
      return sendError(res, 'Erro ao buscar perfil');
    }
  }

  async atualizar(req, res) {
    const userId = req.userId;
    const { nome, sobrenome } = req.body;

    console.log(' [ATUALIZAR] userId:', userId);
    console.log(' [ATUALIZAR] body:', req.body);

    if (!nome || !sobrenome) {
      console.log(' [ATUALIZAR] Campos faltando - nome:', nome, 'sobrenome:', sobrenome);
      return sendError(res, 'Nome e sobrenome são obrigatórios', 400);
    }

    try {
      console.log(' [ATUALIZAR] Executando UPDATE...');
      
      await pool.query(
        `UPDATE usuarios
         SET nome = ?, sobrenome = ?
         WHERE id = ?`,
        [nome, sobrenome, userId]
      );

      console.log(' [ATUALIZAR] UPDATE executado');

      console.log(' [ATUALIZAR] Buscando usuário atualizado...');
      
      const [rows] = await pool.query(
        `SELECT id, nome, sobrenome, email, url_foto_perfil FROM usuarios WHERE id = ?`,
        [userId]
      );

      console.log(' [ATUALIZAR] Usuario atualizado:', rows[0]);

      return sendSuccess(res, {
        message: 'Dados atualizados com sucesso',
        usuario: rows[0]
      });
    } catch (error) {
      console.error(' [ATUALIZAR] Erro completo:', error);
      console.error(' [ATUALIZAR] Stack:', error.stack);
      return sendError(res, 'Erro ao atualizar dados');
    }
  }

  async atualizarEmail(req, res) {
    const userId = req.userId;
    const { novoEmail, senhaAtual } = req.body;

    console.log(' [EMAIL] userId:', userId);
    console.log(' [EMAIL] novoEmail:', novoEmail);

    if (!novoEmail || !senhaAtual) {
      return sendError(res, 'Email e senha são obrigatórios', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(novoEmail)) {
      return sendError(res, 'Email inválido', 400);
    }

    try {
      const [usuarioRows] = await pool.query(
        `SELECT id, email, senha_hash FROM usuarios WHERE id = ? AND deletado_em IS NULL`,
        [userId]
      );

      if (usuarioRows.length === 0) {
        return sendError(res, 'Usuário não encontrado', 404);
      }

      const usuario = usuarioRows[0];

      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha_hash);
      if (!senhaValida) {
        console.log(' [EMAIL] Senha incorreta');
        return sendError(res, 'Senha incorreta', 401);
      }

      const [emailExisteRows] = await pool.query(
        `SELECT id FROM usuarios WHERE email = ? AND id != ? AND deletado_em IS NULL`,
        [novoEmail, userId]
      );

      if (emailExisteRows.length > 0) {
        return sendError(res, 'Este email já está em uso', 409);
      }

      await pool.query(
        `UPDATE usuarios SET email = ? WHERE id = ?`,
        [novoEmail, userId]
      );

      const [usuarioAtualizadoRows] = await pool.query(
        `SELECT id, nome, sobrenome, email, url_foto_perfil FROM usuarios WHERE id = ?`,
        [userId]
      );

      console.log(' [EMAIL] Email atualizado com sucesso');

      return sendSuccess(res, {
        message: 'Email atualizado com sucesso',
        usuario: usuarioAtualizadoRows[0]
      });

    } catch (error) {
      console.error(' [EMAIL] Erro:', error);
      console.error(' [EMAIL] Stack:', error.stack);
      return sendError(res, 'Erro ao atualizar email');
    }
}

  async atualizarPreferencias(req, res) {
    const userId = req.userId;
    const { notifications } = req.body;

    console.log(' [PREFERENCIAS] userId:', userId);
    console.log(' [PREFERENCIAS] notifications:', notifications);

    if (!notifications) {
      return sendError(res, 'Preferências de notificação são obrigatórias', 400);
    }

    try {
      const preferencesJSON = JSON.stringify({ notifications });

      console.log(' [PREFERENCIAS] JSON:', preferencesJSON);

      await pool.query(
        `UPDATE usuarios SET preferences = ? WHERE id = ?`,
        [preferencesJSON, userId]
      );

      console.log(' [PREFERENCIAS] Preferências atualizadas');

      return sendSuccess(res, {
        message: 'Preferências atualizadas com sucesso',
        preferences: { notifications }
      });

    } catch (error) {
      console.error(' [PREFERENCIAS] Erro:', error);
      console.error(' [PREFERENCIAS] Stack:', error.stack);
      return sendError(res, 'Erro ao atualizar preferências');
    }
  }

  async deletar(req, res) {
    const userId = req.userId;
    console.log(' [DELETAR] userId:', userId);

    try {
      await pool.query(
        `UPDATE usuarios
         SET deletado_em = NOW()
         WHERE id = ?`,
        [userId]
      );

      console.log(' [DELETAR] Usuário deletado');

      return sendSuccess(res, null, 'Usuário deletado com sucesso');
    } catch (error) {
      console.error(' [DELETAR] Erro:', error);
      return sendError(res, 'Erro ao deletar usuário');
    }
  }

  async alterarSenha(req, res) {
    const userId = req.userId;
    const { senhaAtual, novaSenha } = req.body;

    console.log(' [SENHA] userId:', userId);

    if (!senhaAtual || !novaSenha) {
      return sendError(res, 'Senha atual e nova senha são obrigatórias', 400);
    }

    if (novaSenha.length < 6) {
      return sendError(res, 'A nova senha deve ter no mínimo 6 caracteres', 400);
    }

    try {
      const [rows] = await pool.query(
        `SELECT id, senha_hash FROM usuarios WHERE id = ? AND deletado_em IS NULL`,
        [userId]
      );

      if (rows.length === 0) {
        return sendError(res, 'Usuário não encontrado', 404);
      }

      const usuario = rows[0];

      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha_hash);
      if (!senhaValida) {
        console.log(' [SENHA] Senha atual incorreta');
        return sendError(res, 'Senha atual incorreta', 401);
      }

      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      await pool.query(
        `UPDATE usuarios SET senha_hash = ? WHERE id = ?`,
        [novaSenhaHash, userId]
      );

      console.log(' [SENHA] Senha alterada com sucesso');

      return sendSuccess(res, null, 'Senha alterada com sucesso');
      
    } catch (error) {
      console.error(' [SENHA] Erro:', error);
      console.error(' [SENHA] Stack:', error.stack);
      return sendError(res, 'Erro ao alterar senha');
    }
  }
}

module.exports = new UserController();