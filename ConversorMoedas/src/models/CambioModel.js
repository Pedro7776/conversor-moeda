// Model: tudo que fala com a API Frankfurter fica aqui.
// Nada de tela, estado ou mensagem de interface neste arquivo.

const URL_BASE = 'https://api.frankfurter.dev/v2';
const TEMPO_LIMITE_MS = 10000;

// Erro com "tipo" pra o ViewModel conseguir separar os casos:
//   'rede'    -> nao conseguiu falar com o servidor (sem internet, DNS...)
//   'tempo'   -> o servidor nao respondeu dentro do limite
//   'http'    -> o servidor respondeu, mas com status de erro (404, 422, 503...)
//   'formato' -> respondeu 200, mas o JSON nao tem o que a gente espera
export class ErroApi extends Error {
  constructor(tipo, detalhe = '', status = null) {
    super(detalhe || tipo);
    this.name = 'ErroApi';
    this.tipo = tipo;
    this.status = status;
  }
}

async function requisitar(caminho) {
  // OBS: o fetch do React Native nao tem timeout proprio. Sem isso, se a rede
  // ficar "pendurada" o spinner roda pra sempre e o botao nunca libera.
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  let resposta;
  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, { signal: controle.signal });
  } catch (erro) {
    if (erro && erro.name === 'AbortError') {
      throw new ErroApi('tempo');
    }
    throw new ErroApi('rede', String(erro && erro.message));
  } finally {
    clearTimeout(timer);
  }

  // OBS: fetch NAO rejeita quando o servidor responde 404/422/503.
  // So rejeita em falha de rede. Por isso o res.ok e obrigatorio.
  // Nesses casos a API devolve um JSON do tipo { "message": "..." }.
  if (!resposta.ok) {
    let detalhe = '';
    try {
      const corpo = await resposta.json();
      detalhe = corpo && corpo.message ? corpo.message : '';
    } catch {
      // corpo vazio ou que nao e JSON, segue sem detalhe
    }
    throw new ErroApi('http', detalhe, resposta.status);
  }

  try {
    return await resposta.json();
  } catch {
    throw new ErroApi('formato', 'resposta nao e JSON valido');
  }
}

export async function listarMoedas() {
  const dados = await requisitar('/currencies');

  // OBS: no enunciado nao diz, mas na v2 o /currencies devolve um ARRAY de
  // objetos { iso_code, name, symbol, type, ... }. Na v1 era um objeto do tipo
  // { "USD": "United States Dollar" }. Codigo antigo de tutorial quebra aqui.
  if (!Array.isArray(dados)) {
    throw new ErroApi('formato', '/currencies nao devolveu uma lista');
  }

  // OBS: a lista tambem traz metais e cripto (campo "type"). Filtrei so
  // "currency" porque o Intl.NumberFormat nao formata bem codigo que nao e ISO
  // de moeda, e o app e de conversao de moedas mesmo.
  const moedas = dados
    .filter(
      (m) =>
        m &&
        m.type === 'currency' &&
        typeof m.iso_code === 'string' &&
        /^[A-Z]{3}$/.test(m.iso_code)
    )
    .map((m) => ({
      codigo: m.iso_code,
      nome: m.name || m.iso_code,
      simbolo: m.symbol || null,
    }))
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  if (moedas.length === 0) {
    throw new ErroApi('formato', 'lista de moedas vazia');
  }
  return moedas;
}

export async function buscarTaxa(moedaOrigem, moedaDestino) {
  // OBS: o enunciado lista 3 endpoints, mas o 3 (/rates?base=..&quotes=..) nao
  // e uma "conversao direta". A v2 nao tem endpoint de conversao nenhum, e o
  // /rates devolve um array com uma linha por moeda. Usei o /rate/{base}/{quote}
  // porque devolve um objeto unico e e mais simples de validar.
  const dados = await requisitar(
    `/rate/${encodeURIComponent(moedaOrigem)}/${encodeURIComponent(moedaDestino)}`
  );

  const taxaValida =
    dados && typeof dados.rate === 'number' && Number.isFinite(dados.rate) && dados.rate > 0;
  if (!taxaValida || typeof dados.date !== 'string') {
    throw new ErroApi('formato', 'resposta sem rate/date esperados');
  }

  // A ordem importa: USD->BRL nao e o inverso de BRL->USD. Confiro se a API
  // devolveu o mesmo par que eu pedi antes de aceitar a taxa.
  if (dados.base !== moedaOrigem || dados.quote !== moedaDestino) {
    throw new ErroApi('formato', 'a API devolveu outro par de moedas');
  }

  return {
    moedaOrigem: dados.base,
    moedaDestino: dados.quote,
    taxa: dados.rate,
    data: dados.date, // "AAAA-MM-DD", dia a que a taxa se refere (nao e hora da consulta)
  };
}
