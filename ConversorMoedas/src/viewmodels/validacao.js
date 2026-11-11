// Regras de validacao do formulario. Ficam separadas do hook so pra poder
// testar sem precisar abrir o app (sao funcoes puras, nao usam React).

export function interpretarValor(texto) {
  const t = (texto ?? '').trim();

  if (t === '') {
    return { ok: false, mensagem: 'Digite o valor que deseja converter.' };
  }

  if (/^[-+]/.test(t)) {
    return { ok: false, mensagem: 'O valor precisa ser maior que zero.' };
  }

  // So aceito digitos com no maximo UM separador decimal (virgula ou ponto).
  // Isso barra "1.234,56", "1,234.56", "abc", "10,5,2" etc.
  if (!/^\d+([.,]\d+)?$/.test(t)) {
    return {
      ok: false,
      mensagem: 'Use só números, com vírgula ou ponto para os decimais (ex.: 10,50). Não use separador de milhar.',
    };
  }

  // OBS: "1.500" e ambiguo. Em portugues e mil e quinhentos, em JavaScript e
  // um e meio. Em vez de chutar, bloqueio e peco pra digitar de outro jeito.
  // (Zero a esquerda, tipo "0.500", nao e milhar, entao passa normal.)
  if (/^[1-9]\d{0,2}\.\d{3}$/.test(t)) {
    return {
      ok: false,
      mensagem: 'Valor ambíguo. Digite 1500 (sem ponto) ou 1,5 (com vírgula).',
    };
  }

  const valor = Number(t.replace(',', '.'));

  if (!Number.isFinite(valor)) {
    return { ok: false, mensagem: 'Esse valor é grande demais.' };
  }
  if (valor <= 0) {
    return { ok: false, mensagem: 'O valor precisa ser maior que zero.' };
  }

  return { ok: true, valor };
}

export function validarEntrada({ valorTexto, moedaOrigem, moedaDestino }) {
  const valor = interpretarValor(valorTexto);
  if (!valor.ok) return valor;

  if (!moedaOrigem) {
    return { ok: false, mensagem: 'Selecione a moeda de origem.' };
  }
  if (!moedaDestino) {
    return { ok: false, mensagem: 'Selecione a moeda de destino.' };
  }

  // Regra da primeira versao do projeto. Detalhe: a API aceita par igual e
  // devolve taxa 1, entao essa restricao e do app e nao da API.
  if (moedaOrigem === moedaDestino) {
    return { ok: false, mensagem: 'Escolha moedas diferentes para a conversão.' };
  }

  return { ok: true, valor: valor.valor };
}
