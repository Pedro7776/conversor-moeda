# Conversor de Moedas

Aplicativo mobile desenvolvido com **React Native**, **Expo** e **JavaScript**, utilizando a arquitetura **MVVM (Model-View-ViewModel)**.

O aplicativo permite converter valores entre diferentes moedas utilizando as taxas de referência disponibilizadas pela API pública [Frankfurter](https://frankfurter.dev).

## Tecnologias utilizadas

- JavaScript
- React Native
- Expo
- React Hooks
- @react-native-picker/picker
- API Frankfurter

## Requisitos

- Node.js (versão LTS compatível com o Expo)
- npm
- Aplicativo Expo Go instalado no dispositivo móvel ou emulador Android/iOS.

## Como executar o projeto

**1. Clone o repositório:**

```bash
git clone https://github.com/Pedro7776/conversor-moeda.git
```

**2. Entre na pasta do projeto:**

```bash
cd conversor-moeda/ConversorMoedas
```

**3. Instale as dependências:**

```bash
npm install
```

**4. Inicie o Expo:**

```bash
npx expo start
```

**5. Abra o aplicativo:**

Escaneie o QR Code exibido no terminal utilizando o Expo Go.

O dispositivo móvel e o computador devem estar conectados à mesma rede Wi-Fi quando utilizado o modo de conexão local.

## Estrutura do projeto

A aplicação segue a arquitetura MVVM, separando as responsabilidades entre Model, ViewModel e View.

```text
ConversorMoedas/
├── App.js
├── index.js
├── package.json
├── app.json
└── src/
    ├── models/
    │   └── CambioModel.js
    ├── viewmodels/
    │   ├── useConversorViewModel.js
    │   └── validacao.js
    └── views/
        ├── ConversorView.js
        ├── SeletorMoeda.js
        └── formatadores.js
```

### Organização MVVM

- **Model:** responsável pelas requisições à API Frankfurter e pelo tratamento dos dados recebidos.
- **ViewModel:** gerencia os estados da aplicação, valida as entradas, coordena as operações e realiza o cálculo da conversão.
- **View:** responsável pela interface gráfica e pela interação com o usuário, sem realizar diretamente requisições à API.

## Funcionamento

1. Ao abrir o aplicativo, a lista de moedas disponíveis é carregada por meio do endpoint `GET /v2/currencies`.
2. O usuário informa o valor e seleciona as moedas de origem e destino.
3. O ViewModel valida os dados e solicita a taxa de conversão ao endpoint `GET /v2/rate/{origem}/{destino}`.
4. O valor informado é multiplicado pela taxa recebida.
5. O resultado é apresentado junto à taxa utilizada e à data de referência fornecida pela API.

As taxas disponibilizadas são valores de referência baseados em dados de instituições financeiras, não cotações em tempo real.

## Considerações sobre a API

Durante o desenvolvimento, foram consideradas algumas particularidades da API Frankfurter v2:

- A API não disponibiliza um endpoint específico de conversão. Por isso, foi utilizado o endpoint `/rate/{base}/{quote}`, que retorna a taxa entre duas moedas.
- O endpoint `/currencies` retorna uma lista de objetos contendo informações como código ISO, nome e tipo da moeda.
- A aplicação filtra os resultados para disponibilizar apenas moedas do tipo `currency`.
- Como o `fetch` não considera respostas HTTP de erro como exceções automaticamente, a implementação verifica o status da resposta por meio de `response.ok`.
- A entrada numérica considera o padrão brasileiro, aceitando valores decimais com vírgula ou ponto e evitando interpretações ambíguas.
- A data de referência é tratada diretamente como texto para evitar alterações decorrentes de diferenças de fuso horário.

## Testes manuais

Checklist para validação das funcionalidades:

- [ ] Carregamento da lista de moedas ao abrir o aplicativo.
- [ ] Conversão entre duas moedas diferentes.
- [ ] Validação de campo vazio.
- [ ] Bloqueio de valores iguais a zero ou negativos.
- [ ] Aceitação de valores decimais (ex.: `10,50` e `10.5`).
- [ ] Bloqueio da seleção de moedas iguais.
- [ ] Tratamento de falhas de conexão e ausência de internet.
- [ ] Exibição do indicador de carregamento.
- [ ] Atualização do resultado após uma nova conversão.
- [ ] Exibição da taxa utilizada e da data de referência.

## Capturas de tela

As imagens abaixo podem ser adicionadas para demonstrar o funcionamento da aplicação.

| Tela | Descrição |
|---|---|
| Tela inicial | Interface principal e seleção de moedas |
| Conversão | Exibição do valor convertido e da taxa |
| Validação | Mensagens para entradas inválidas |
| Erro de conexão | Tratamento de falhas na comunicação com a API |

---

**Projeto acadêmico desenvolvido como atividade prática de Desenvolvimento de Software Multiplataforma.**
