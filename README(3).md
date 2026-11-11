# Conversor de Moedas

Aplicativo mobile feito com React Native (Expo) e JavaScript, usando arquitetura MVVM.
Converte valores entre moedas com as taxas da API pública [Frankfurter](https://frankfurter.dev).

## Requisitos

- Node.js (versão LTS compatível com o Expo que você instalar)
- App **Expo Go** no celular, ou um emulador Android/iOS

## Como criar o projeto do zero

O template padrão atual do `create-expo-app` usa Expo Router e TypeScript, sem o `App.js`
que o enunciado pede. Por isso use o template `blank`:

```bash
npx create-expo-app@latest ConversorMoedas --template blank
cd ConversorMoedas
npx expo install @react-native-picker/picker
```

Depois copie a pasta `src/` e o `App.js` deste repositório por cima dos arquivos do projeto.

Use `npx expo install` (e não `npm install`) para o picker: assim o Expo escolhe a versão
compatível com o SDK do projeto.

## Como executar

```bash
npm install
npx expo start
```

Escaneie o QR Code com o Expo Go, ou aperte `a` (Android) / `i` (iOS) no terminal.

## Estrutura (MVVM)

```
ConversorMoedas/
  App.js
  src/
    models/
      CambioModel.js            acesso à API (moedas e taxa)
    viewmodels/
      useConversorViewModel.js  estados, fluxo da conversão, cálculo
      validacao.js              regras de validação do formulário
    views/
      ConversorView.js          tela principal
      SeletorMoeda.js           seletor de moeda (Picker)
      formatadores.js           formatação de moeda, taxa e data
```

- **Model**: só faz as requisições e devolve dados já interpretados. Não conhece a tela.
- **ViewModel**: guarda os estados, valida, pede a taxa ao Model, calcula e prepara as mensagens de erro.
- **View**: desenha a tela e chama o ViewModel. Não faz requisição nem cálculo.

## Como funciona a conversão

1. A lista de moedas vem de `GET /v2/currencies` quando a tela abre.
2. Ao converter, o ViewModel valida os dados e chama `GET /v2/rate/{origem}/{destino}`.
3. Resultado = valor informado × taxa recebida. A tela mostra o valor, a taxa e a data de referência.

A taxa é de referência (publicada por bancos centrais), por isso o app mostra a data e não
trata o valor como cotação em tempo real.

## Pontos que diferem do enunciado / da API

- A API v2 **não tem endpoint de conversão**. O endpoint 3 do enunciado (`/rates?base=...&quotes=...`)
  só devolve taxas, e devolve um **array**. Usei `/rate/{base}/{quote}`, que devolve um objeto único.
- Na v2, `/currencies` devolve um **array** de objetos (`iso_code`, `name`, `type`...), e não um
  objeto indexado por código como na v1. Também vêm metais e criptomoedas; o app filtra só `type: "currency"`.
- `fetch` não dá erro quando a API responde 404/422/503, então o código confere `response.ok`.
- Entrada ambígua como `1.500` é bloqueada (em português seria mil e quinhentos, em JS seria um e meio).
- A data da API (`AAAA-MM-DD`) é separada como texto, sem `new Date`, para não aparecer um dia a menos por causa do fuso.

## Testes manuais (checklist do enunciado)

- [ ] Lista de moedas carrega ao abrir
- [ ] Conversão válida entre duas moedas diferentes
- [ ] Campo vazio mostra mensagem
- [ ] Zero e negativo bloqueados
- [ ] Valor decimal (`10,50` e `10.5`)
- [ ] Moedas iguais bloqueadas
- [ ] Sem internet: mostra erro e dá para tentar de novo
- [ ] Indicador de carregamento aparece e some
- [ ] Nova conversão atualiza o resultado
- [ ] Taxa e data aparecem no resultado

## Capturas de tela

Adicione aqui as imagens do app funcionando (tela inicial, conversão, erro de validação, erro de rede).


