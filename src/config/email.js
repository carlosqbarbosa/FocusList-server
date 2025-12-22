const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT === '465', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  ...(process.env.EMAIL_HOST === 'smtp.gmail.com' && {
    service: 'gmail'
  })
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Erro na configuração de email:', error);
  } else {
    console.log('Servidor de email pronto para enviar mensagens');
  }
});

const emailConfig = {
  transporter,
  
  from: {
    name: process.env.EMAIL_FROM_NAME || 'FocusList',
    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
  },

  templates: {
    bemVindo: {
      subject: 'Bem-vindo ao FocusList!',
      html: (nome) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Bem-vindo ao FocusList, ${nome}!</h1>
          <p>Estamos felizes em ter você conosco.</p>
          <p>Comece criando sua primeira tarefa e experimente o método Pomodoro!</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
            Acessar Dashboard
          </a>
        </div>
      `
    },

    recuperarSenha: {
      subject: 'Recuperação de Senha - FocusList',
      html: (nome, token, expiraEm) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Recuperação de Senha</h1>
          <p>Olá ${nome},</p>
          <p>Recebemos uma solicitação para redefinir sua senha.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" 
             style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Redefinir Senha
          </a>
          <p style="color: #666; font-size: 14px;">
            Este link expira em ${expiraEm} minutos.
          </p>
          <p style="color: #666; font-size: 14px;">
            Se você não solicitou esta alteração, ignore este email.
          </p>
        </div>
      `
    },

    tarefaVencida: {
      subject: 'Tarefa Vencida - FocusList',
      html: (nome, tarefa) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #DC2626;">Tarefa Vencida</h1>
          <p>Olá ${nome},</p>
          <p>A seguinte tarefa está vencida:</p>
          <div style="background: #FEF2F2; padding: 16px; border-left: 4px solid #DC2626; margin: 20px 0;">
            <h3 style="margin: 0 0 8px 0; color: #DC2626;">${tarefa.titulo}</h3>
            <p style="margin: 0; color: #666;">Vencimento: ${tarefa.dataVencimento}</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/tasks/${tarefa.id}" 
             style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Tarefa
          </a>
        </div>
      `
    },

    resumoDiario: {
      subject: 'Seu Resumo Diário - FocusList',
      html: (nome, stats) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Resumo do Dia</h1>
          <p>Olá ${nome},</p>
          <p>Aqui está o resumo da sua produtividade hoje:</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="margin-bottom: 12px;">
              <strong> Pomodoros:</strong> ${stats.pomodoros}
            </div>
            <div style="margin-bottom: 12px;">
              <strong> Tarefas Concluídas:</strong> ${stats.tarefasConcluidas}
            </div>
            <div style="margin-bottom: 12px;">
              <strong> Tempo Focado:</strong> ${stats.tempoFocado} minutos
            </div>
            <div>
              <strong> Sequência:</strong> ${stats.sequencia} dias
            </div>
          </div>
          <p>Continue assim!</p>
        </div>
      `
    }
  },

  retry: {
    attempts: 3, 
    delay: 1000
  }
};

module.exports = emailConfig;
