// FIX: Define the Agency enum to resolve circular dependency.
export enum Agency {
    HOC = 'HOC',
    Matriz = 'Matriz',
    Engenho = 'Engenho',
    Centro = 'Centro',
    Escala = 'Escala',
}

export type Responsible = string;

export interface ResponsibleUser {
  name: Responsible;
  image: string;
}

export enum UserRole {
  Admin = 'Administrador',
  Analyst = 'Analista',
}

export interface User {
  name: string;
  email: string;
  role: UserRole;
  image: string;
}

export enum Status {
  Planejamento = 'Planejamento',
  PendenteAprovacao = 'Pendente Aprovação',
  EmExecucao = 'Em Execução',
  AguardandoRelatorio = 'Aguardando Relatório',
  AnaliseInterna = 'Análise Interna',
  Concluida = 'Concluída',
  Atrasada = 'Atrasada',
  Cancelada = 'Cancelada',
}

export enum ExhibitionStatus {
  AguardandoInicio = 'aguardando início',
  EmExibicao = 'em exibição',
}

export enum MediaPresence {
  Televisao = 'Televisão',
  Radio = 'Rádio',
  Impresso = 'Impresso',
  OOH = 'OOH',
  DOOH = 'DOOH',
  Revista = 'Revista',
  Cinema = 'Cinema',
  Digital = 'Digital',
  Influenciadores = 'Influenciadores',
  AcoesIntegradas = 'Ações integradas',
  Eventos = 'Eventos',
}

export enum RegiaoFuncional {
    RF1 = 'RF 1 - RMPA (Porto Alegre e Novo Hamburgo)',
    RF2 = 'RF2 - Região dos Vales (Santa Cruz do Sul e Lajeado)',
    RF3 = 'RF 3 - RMSG (Caxias do Sul e Bento Gonçalves)',
    RF4 = 'RF 4 - Litoral Norte (Capão da Canoa, Tramandaí e Osório)',
    RF5 = 'RF 5 - Pelotas e Rio Grande',
    RF6 = 'RF 6 - Fronteira Oeste (Uruguaiana e Bagé)',
    RF7 = 'RF 7 - Ijuí, Santo Ângelo e Santa Rosa',
    RF8 = 'RF 8 - Santa Maria',
    RF9 = 'RF 9 - Passo Fundo e Erechim',
}

export interface HistoryEntry {
  user: string;
  timestamp: Date;
  changes: string[];
}

export interface Campaign {
  id: string;
  cliente: string;
  campanha: string;
  agencia: Agency;
  atendimento_responsavel: Responsible;
  periodo_inicio: Date | null;
  periodo_fim: Date | null;
  data_entrada_pauta: Date | null;
  data_prevista_retorno_agencia: Date | null;
  data_recebimento_relatorio: Date | null;
  data_prevista_recebimento_relatorio: Date | null;
  prazo_analise_interna: Date | null;
  data_feedback_agencia: Date | null;
  status_plano: Status;
  proa?: string;
  briefing?: string;
  orcamento?: number;
  comentarios?: string;
  relatorio_recebido: boolean;
  created_at: Date;
  updated_at: Date;
  history?: HistoryEntry[];

  // New fields from reorganization
  exhibition_status: ExhibitionStatus;
  observacoes_ajustes?: string;
  comprovantes_sac_recebidos: boolean;
  plano_midia_arquivo_nome?: string;
  relatorio_arquivo_nome?: string;
  presenca_em?: MediaPresence[];
  orcamento_por_midia?: Partial<Record<MediaPresence, number>>;
  regioes_funcionais?: RegiaoFuncional[];
}

export interface Filters {
    agencia: Agency | '';
    atendimento_responsavel: Responsible | '';
    periodo_inicio: string;
    periodo_fim: string;
    status_plano: Status[];
    cliente: string;
    presenca_em: MediaPresence[];
    regioes_funcionais: RegiaoFuncional[];
}

export enum DocumentType {
    PDF = 'PDF',
    Word = 'Word',
    Image = 'Image',
}

export interface Document {
    id: number;
    name: string;
    type: DocumentType;
    campaignId: string;
    campaignName: string;
    uploadedAt: string;
    url?: string;
}

export interface Notification {
  id: string;
  campaignId: string;
  campaignName: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface Integration {
    name: string;
    description: string;
    connected: boolean;
    requiresApiKey: boolean;
    apiKey?: string;
}