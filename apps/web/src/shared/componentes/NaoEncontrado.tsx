import { Link } from 'wouter';

import estilos from './NaoEncontrado.module.css';

/**
 * Endereco que nao corresponde a tela nenhuma.
 *
 * Existe porque, com enderecos, passa a ser possivel chegar a um: um link antigo, um
 * engano a escrever, um favorito do navegador para uma tela que mudou. A visao exige
 * caminhos "sem becos sem saida", por isso esta tela tem sempre uma saida visivel.
 *
 * Vive em `shared/` porque e usada pela casca (rota desconhecida) E por um dominio
 * (um jogo de cassino que nao existe). Um dominio a importar da casca seria inverter
 * a dependencia; o que e comum vive no comum (arquitetura, seccao 3).
 */
export function NaoEncontrado() {
  return (
    <div className={estilos.bloco}>
      <span className={estilos.marca} aria-hidden="true">
        ⌕
      </span>
      <h1 className={estilos.titulo}>Esta página não existe</h1>
      <p className={estilos.mensagem}>
        O endereço que abriu não corresponde a nenhuma área da plataforma. Pode ter
        mudado, ou o link estar incompleto.
      </p>
      <Link href="/" className={estilos.saida}>
        Ir para os esportes
      </Link>
    </div>
  );
}
