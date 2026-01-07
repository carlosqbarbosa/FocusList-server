class CreateUserDTO {
  constructor(data) {
    this.nome = data.nome;
    this.sobrenome = data.sobrenome;
    this.email = data.email.toLowerCase().trim();
    this.senha = data.senha;
  }
}


class LoginDTO {
  constructor(data) {
    this.email = data.email.toLowerCase().trim();
    this.senha = data.senha;
    this.lembrarMe = data.lembrarMe || false;
  }
}

class UserResponseDTO {
  constructor(user) {
    this.id = user.id;
    this.nome = user.nome;
    this.sobrenome = user.sobrenome;
    this.nomeCompleto = `${user.nome} ${user.sobrenome}`;
    this.email = user.email;
    this.urlFotoPerfil = user.url_foto_perfil || this.getGravatarUrl(user.email);
    this.plano = user.plano || 'gratuito';
    this.status = user.status;
    this.criadoEm = user.criado_em;
    this.atualizadoEm = user.atualizado_em;
    
    if (user.configuracoes) {
      this.configuracoes = new UserConfigDTO(user.configuracoes);
    }
    
    if (user.stats) {
      this.estatisticas = {
        totalTarefas: user.stats.total_tarefas || 0,
        tarefasConcluidas: user.stats.tarefas_concluidas || 0,
        totalPomodoros: user.stats.total_pomodoros || 0,
        sequenciaDias: user.stats.sequencia_dias || 0,
        nivel: user.stats.nivel || 1,
        xp: user.stats.xp || 0
      };
    }
  }

  getGravatarUrl(email) {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
  }
}

class UserListDTO {
  constructor(user) {
    this.id = user.id;
    this.nome = user.nome;
    this.sobrenome = user.sobrenome;
    this.email = user.email;
    this.urlFotoPerfil = user.url_foto_perfil;
  }
}

class UpdateUserDTO {
  constructor(data) {
    if (data.nome !== undefined) this.nome = data.nome;
    if (data.sobrenome !== undefined) this.sobrenome = data.sobrenome;
    if (data.urlFotoPerfil !== undefined) this.urlFotoPerfil = data.urlFotoPerfil;
    
  }
}

class ChangePasswordDTO {
  constructor(data) {
    this.senhaAtual = data.senhaAtual;
    this.novaSenha = data.novaSenha;
    this.confirmarNovaSenha = data.confirmarNovaSenha;
  }
}

class ForgotPasswordDTO {
  constructor(data) {
    this.email = data.email.toLowerCase().trim();
  }
}

class ResetPasswordDTO {
  constructor(data) {
    this.token = data.token;
    this.novaSenha = data.novaSenha;
    this.confirmarNovaSenha = data.confirmarNovaSenha;
  }
}

class UserConfigDTO {
  constructor(config) {
    this.pomodoro = {
      duracaoTrabalho: config.duracao_trabalho || 25,
      duracaoIntervaloCurto: config.duracao_intervalo_curto || 5,
      duracaoIntervaloLongo: config.duracao_intervalo_longo || 15,
      sessoesAteIntervaloLongo: config.sessoes_ate_intervalo_longo || 4,
      autoIniciarIntervalo: config.auto_iniciar_intervalo || false,
      autoIniciarTrabalho: config.auto_iniciar_trabalho || false
    };

    this.notificacoes = {
      email: config.notificacao_email || true,
      push: config.notificacao_push || false,
      som: config.notificacao_som || true,
      desktop: config.notificacao_desktop || true,
      lembreteTarefas: config.lembrete_tarefas || true,
      resumoDiario: config.resumo_diario || false
    };

    this.interface = {
      tema: config.tema || 'light', 
      idioma: config.idioma || 'pt-BR',
      formatoData: config.formato_data || 'DD/MM/YYYY',
      formatoHora: config.formato_hora || '24h',
      exibirTutorial: config.exibir_tutorial !== false
    };

    this.privacidade = {
      perfilPublico: config.perfil_publico || false,
      mostrarEstatisticas: config.mostrar_estatisticas || false,
      compartilharProgresso: config.compartilhar_progresso || false
    };
  }
}

class UpdateUserConfigDTO {
  constructor(data) {
    if (data.pomodoro) this.pomodoro = data.pomodoro;
    if (data.notificacoes) this.notificacoes = data.notificacoes;
    if (data.interface) this.interface = data.interface;
    if (data.privacidade) this.privacidade = data.privacidade;
  }
}

class AuthResponseDTO {
  constructor(user, token, refreshToken = null) {
    this.usuario = new UserResponseDTO(user);
    this.token = token;
    this.refreshToken = refreshToken;
    this.expiresIn = process.env.JWT_EXPIRATION || '7d';
  }
}

module.exports = {
  CreateUserDTO,
  LoginDTO,
  UserResponseDTO,
  UserListDTO,
  UpdateUserDTO,
  ChangePasswordDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  UserConfigDTO,
  UpdateUserConfigDTO,
  AuthResponseDTO
};