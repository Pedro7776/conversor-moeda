// ViewModel da tela de conversao, feito como hook.
// A View so le os estados daqui e chama as funcoes. Quem valida, chama o
// Model e calcula e este arquivo.

import { useCallback, useEffect, useRef, useState } from 'react';
import { buscarTaxa, listarMoedas } from '../models/CambioModel.js';
import { validarEntrada } from './validacao.js';

// Traduz o erro do Model numa mensagem pro usuario.
// Fica aqui (e nao no Model) porque texto de tela nao e responsabilidade dele.
function mensagemDoErro(erro) {
  if (!erro || erro.name !== 'ErroApi') {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }
  switch (erro.tipo) {
    case 'rede':
      return 'Sem conexão com o serviço de câmbio. Verifique sua internet e tente de novo.';
    case 'tempo':
      return 'O serviço demorou demais para responder. Tente de novo.';
    case 'formato':
      return 'O serviço devolveu uma resposta em formato inesperado.';
    case 'http':
      if (erro.status === 404) return 'A API não tem taxa disponível para esse par de moedas.';
      if (erro.status === 422) return 'A API recusou a consulta (código de moeda inválido).';
      if (erro.status === 503) return 'O serviço de câmbio está indisponível agora. Tente em instantes.';
      return `O serviço respondeu com erro (código ${erro.status}).`;
    default:
      return 'Não foi possível concluir a consulta.';
  }
}

export function useConversorViewModel() {
  const [valorTexto, setValorTexto] = useState('');
  const [moedaOrigem, setMoedaOrigem] = useState('');
  const [moedaDestino, setMoedaDestino] = useState('');
  const [moedas, setMoedas] = useState([]);
  const [carregandoMoedas, setCarregandoMoedas] = useState(true);
  const [erroMoedas, setErroMoedas] = useState(null);

  const [carregando, setCarregando] = useState(false);
  const [erroValidacao, setErroValidacao] = useState(null); // o usuario digitou algo errado
  const [erroApi, setErroApi] = useState(null); // deu problema na consulta
  const [resultado, setResultado] = useState(null);

  // Contadores pra ignorar respostas atrasadas (regra 10 do enunciado).
  // Cada consulta pega um numero; so a mais recente pode mexer no estado.
  const consultaAtual = useRef(0);
  const cargaMoedasAtual = useRef(0);

  const carregarMoedas = useCallback(async () => {
    const id = ++cargaMoedasAtual.current;
    setCarregandoMoedas(true);
    setErroMoedas(null);
    try {
      const lista = await listarMoedas();
      if (id !== cargaMoedasAtual.current) return;

      const codigos = lista.map((m) => m.codigo);
      const origem = codigos.includes('USD') ? 'USD' : codigos[0];
      const destino = codigos.includes('BRL') ? 'BRL' : codigos.find((c) => c !== origem);

      setMoedas(lista);
      setMoedaOrigem(origem);
      setMoedaDestino(destino);
    } catch (erro) {
      if (id !== cargaMoedasAtual.current) return;
      setErroMoedas(`Não foi possível carregar as moedas. ${mensagemDoErro(erro)}`);
    } finally {
      if (id === cargaMoedasAtual.current) setCarregandoMoedas(false);
    }
  }, []);

  useEffect(() => {
    carregarMoedas();
    // Ao sair da tela, invalida o que ainda estiver em andamento.
    return () => {
      cargaMoedasAtual.current++;
      consultaAtual.current++;
    };
  }, [carregarMoedas]);

  // Mexeu em qualquer campo: o resultado antigo deixa de valer, cancela a
  // consulta em andamento (se tiver) e limpa as mensagens.
  function descartarResultado() {
    consultaAtual.current++;
    setCarregando(false);
    setResultado(null);
    setErroApi(null);
    setErroValidacao(null);
  }

  function alterarValor(texto) {
    setValorTexto(texto);
    descartarResultado();
  }

  function alterarMoedaOrigem(codigo) {
    setMoedaOrigem(codigo);
    descartarResultado();
  }

  function alterarMoedaDestino(codigo) {
    setMoedaDestino(codigo);
    descartarResultado();
  }

  function inverterMoedas() {
    setMoedaOrigem(moedaDestino);
    setMoedaDestino(moedaOrigem);
    descartarResultado();
  }

  async function converter() {
    if (carregando || carregandoMoedas) return; // evita consultas em paralelo

    const validacao = validarEntrada({ valorTexto, moedaOrigem, moedaDestino });
    setErroApi(null);
    setResultado(null);
    if (!validacao.ok) {
      setErroValidacao(validacao.mensagem);
      return;
    }
    setErroValidacao(null);

    const id = ++consultaAtual.current;
    setCarregando(true);
    try {
      const { taxa, data } = await buscarTaxa(moedaOrigem, moedaDestino);
      if (id !== consultaAtual.current) return; // chegou atrasada, descarta

      // Guardo o numero cru. Quem arredonda e a View, so na hora de mostrar.
      // OBS: o calculo e em ponto flutuante (double). Pra exibir com 2 casas
      // serve, mas pra contabilidade de verdade o certo seria usar decimal.
      setResultado({
        valorOriginal: validacao.valor,
        moedaOrigem,
        moedaDestino,
        valorConvertido: validacao.valor * taxa,
        taxa,
        data,
      });
    } catch (erro) {
      if (id !== consultaAtual.current) return;
      setErroApi(mensagemDoErro(erro));
    } finally {
      // So desliga o loading se ainda for a consulta atual; senao desligaria o
      // spinner de uma consulta mais nova.
      if (id === consultaAtual.current) setCarregando(false);
    }
  }

  return {
    // estados
    valorTexto,
    moedaOrigem,
    moedaDestino,
    moedas,
    carregandoMoedas,
    erroMoedas,
    carregando,
    erroValidacao,
    erroApi,
    resultado,
    // acoes
    alterarValor,
    alterarMoedaOrigem,
    alterarMoedaDestino,
    inverterMoedas,
    converter,
    carregarMoedas,
  };
}
