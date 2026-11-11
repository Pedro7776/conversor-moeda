// Funcoes so de apresentacao (View). Nao calculam nada, so formatam.

export function formatarMoeda(valor, codigo) {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: codigo }).format(valor);
  } catch {
    // OBS: se o Intl do aparelho nao conhecer o codigo ele lanca RangeError.
    // Cai num formato simples pra tela nao quebrar.
    return `${valor.toFixed(2)} ${codigo}`;
  }
}

export function formatarTaxa(taxa) {
  // Casas fixas nao servem: JPY->USD da 0,0064 e USD->JPY da 155. Por isso
  // limito por digitos significativos.
  return new Intl.NumberFormat('pt-BR', { maximumSignificantDigits: 6 }).format(taxa);
}

export function formatarData(dataIso) {
  // OBS: nao usei new Date("2026-11-11"). Esse formato e lido como UTC e, no
  // fuso do Brasil (UTC-3), a data aparece um dia antes. Separando a string
  // nao tem esse problema.
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso);
  if (!partes) return dataIso;
  return `${partes[3]}/${partes[2]}/${partes[1]}`;
}
