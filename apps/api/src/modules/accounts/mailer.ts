/**
 * Envio de e-mail. **Não há provedor escolhido** — é decisão em aberto (ver DT-020), por isso a
 * api define a costura e traz uma implementação que escreve no log em vez de enviar. Assim o
 * fluxo de verificação e de recuperação funciona inteiro em desenvolvimento, sem inventar um
 * provedor nem meter credenciais que não existem.
 */
export interface Message {
  readonly to: string;
  readonly subject: string;
  /** Texto simples. O token aparece aqui e **nunca** no log da aplicação. */
  readonly body: string;
}

export interface Mailer {
  send(message: Message): Promise<void>;
}

export interface MailerSink {
  (line: string): void;
}

/**
 * Escreve a mensagem na saída indicada. Serve para desenvolvimento e testes; em produção é
 * substituída pelo provedor real, e a configuração recusa arrancar sem ele (ver `env.ts`).
 */
export function createLoggingMailer(sink: MailerSink = (line) => console.info(line)): Mailer {
  return {
    async send({ to, subject, body }) {
      sink(`[e-mail não enviado — sem provedor configurado] para=${to} assunto=${subject}\n${body}`);
    },
  };
}

/** Recusa enviar. É o que fica em produção enquanto não houver provedor escolhido. */
export function createRefusingMailer(): Mailer {
  return {
    async send() {
      throw new Error('Nenhum provedor de e-mail configurado.');
    },
  };
}
