/*
 * Perfil DEMONSTRATIVO -- RF-007, RN-002 (redacao da DT-013: o perfil e ficticio).
 *
 * NAO ha saldo nem historico aqui, e a ausencia e deliberada: a **PD-006** -- campos
 * exatos do perfil e se exibe saldo ficticio -- continua **em aberto**, e inventar um
 * saldo seria decidir por omissao uma pendencia que o `requisitos.md` marca como nao
 * definida. O que esta aqui e so o que RF-007 e os CA-007.1 a CA-007.4 exigem.
 *
 * Nenhum destes valores e, nem pode ser, dado pessoal verdadeiro (RN-006, CA-007.4):
 * sao constantes do codigo, iguais para toda a gente, e nada na interface os recolhe.
 */

/** Um campo do perfil: rotulo e valor, ambos fixos. */
export interface CampoPerfil {
  readonly id: string;
  readonly rotulo: string;
  readonly valor: string;
}

/** Nome visivel da conta de demonstracao. Inventado, e assumidamente generico. */
export const NOME_DEMONSTRATIVO = 'Visitante de demonstração';

export const CAMPOS_DEMONSTRATIVOS: readonly CampoPerfil[] = [
  { id: 'identificador', rotulo: 'Identificador', valor: 'demo-0001' },
  { id: 'adesao', rotulo: 'Conta criada em', valor: '01/01/2026' },
  { id: 'plano', rotulo: 'Tipo de conta', valor: 'Demonstração' },
];

/**
 * O que a plataforma NAO faz, dito na propria tela.
 *
 * CA-007.3 exige que nao exista acao de deposito, saque, pagamento ou verificacao de
 * identidade. A ausencia de um botao cumpre a regra, mas nao a *comunica*: quem chega
 * ao perfil a procura de um deposito fica a procurar. Dizer que nao existe e mais
 * honesto do que deixar o ecra calado (principio P5 do design-system).
 */
export const OPERACOES_INEXISTENTES: readonly string[] = [
  'Depósito, saque ou qualquer pagamento',
  'Saldo em dinheiro, crédito ou prêmio resgatável',
  'Apostas, cupons ou bilhetes',
  'Verificação de identidade ou envio de documentos',
  'Alteração de dados cadastrais reais',
];
