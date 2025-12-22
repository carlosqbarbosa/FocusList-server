class TaskListDTO {
  constructor(task) {
    this.id = task.id;
    this.titulo = task.titulo;
    this.status = task.status;
    this.prioridade = task.prioridade;
    this.categoria = task.categoria;
    this.dataVencimento = task.data_vencimento;
    this.progresso = this.calcularProgresso(
      task.pomodoros_realizados || 0,
      task.estimativa_pomodoros
    );
    this.tags = task.tags || [];
    this.estaVencida = this.verificarVencimento(
      task.data_vencimento,
      task.status
    );
  }

  calcularProgresso(realizados, estimativa) {
    if (estimativa === 0) return 0;
    return Math.min(Math.round((realizados / estimativa) * 100), 100);
  }

  verificarVencimento(dataVencimento, status) {
    if (!dataVencimento || status === 'concluido') return false;
    return new Date(dataVencimento) < new Date();
  }
}


class TaskFilterDTO {
  constructor(query) {
    this.status = query.status;
    this.prioridade = query.prioridade;
    this.categoria = query.categoria;
    this.busca = query.busca;
    this.tags = query.tags ? query.tags.split(',') : undefined;
    this.dataInicio = query.dataInicio;
    this.dataFim = query.dataFim;
    this.limite = parseInt(query.limite) || 20;
    this.pagina = parseInt(query.pagina) || 1;
    this.ordenar = query.ordenar || 'criado_em';
    this.ordem = query.ordem?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  }
}

module.exports = {
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskResponseDTO,
  TaskListDTO,
  TaskFilterDTO
};