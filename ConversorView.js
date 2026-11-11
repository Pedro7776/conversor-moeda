import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useConversorViewModel } from '../viewmodels/useConversorViewModel.js';
import SeletorMoeda from './SeletorMoeda.js';
import { formatarData, formatarMoeda, formatarTaxa } from './formatadores.js';

export default function ConversorView() {
  const vm = useConversorViewModel();
  const { resultado } = vm;

  const podeConverter = !vm.carregando && !vm.carregandoMoedas && vm.moedas.length > 0;

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* keyboardShouldPersistTaps: sem isso o 1o toque no botao so fecha o teclado */}
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={estilos.titulo}>Conversor de Moedas</Text>
        <Text style={estilos.subtitulo}>Taxas de referência da API Frankfurter</Text>

        <Text style={estilos.rotulo}>Valor</Text>
        <TextInput
          style={estilos.campo}
          value={vm.valorTexto}
          onChangeText={vm.alterarValor}
          placeholder="Ex.: 100,00"
          placeholderTextColor="#9ca3af"
          keyboardType="decimal-pad"
          editable={!vm.carregando}
        />

        {vm.carregandoMoedas && (
          <View style={estilos.linhaCarregando}>
            <ActivityIndicator />
            <Text style={estilos.textoCarregando}>Carregando moedas...</Text>
          </View>
        )}

        {vm.erroMoedas && (
          <View style={estilos.caixaErro}>
            <Text style={estilos.textoErro}>{vm.erroMoedas}</Text>
            <Pressable onPress={vm.carregarMoedas} style={estilos.botaoSecundario}>
              <Text style={estilos.textoBotaoSecundario}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}

        {vm.moedas.length > 0 && (
          <>
            <SeletorMoeda
              rotulo="De"
              valor={vm.moedaOrigem}
              moedas={vm.moedas}
              onChange={vm.alterarMoedaOrigem}
              desabilitado={vm.carregando}
            />

            <Pressable
              onPress={vm.inverterMoedas}
              disabled={vm.carregando}
              style={estilos.botaoSecundario}
            >
              <Text style={estilos.textoBotaoSecundario}>Inverter moedas</Text>
            </Pressable>

            <SeletorMoeda
              rotulo="Para"
              valor={vm.moedaDestino}
              moedas={vm.moedas}
              onChange={vm.alterarMoedaDestino}
              desabilitado={vm.carregando}
            />
          </>
        )}

        <Pressable
          onPress={vm.converter}
          disabled={!podeConverter}
          style={[estilos.botao, !podeConverter && estilos.botaoDesabilitado]}
        >
          {vm.carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={estilos.textoBotao}>Converter</Text>
          )}
        </Pressable>

        {/* Erro do usuario (validacao) e erro da API ficam em caixas separadas */}
        {vm.erroValidacao && (
          <View style={estilos.caixaAviso}>
            <Text style={estilos.textoAviso}>{vm.erroValidacao}</Text>
          </View>
        )}

        {vm.erroApi && (
          <View style={estilos.caixaErro}>
            <Text style={estilos.textoErro}>{vm.erroApi}</Text>
            <Text style={estilos.dicaErro}>Toque em Converter para tentar de novo.</Text>
          </View>
        )}

        {resultado && (
          <View style={estilos.resultado}>
            <Text style={estilos.resultadoOriginal}>
              {formatarMoeda(resultado.valorOriginal, resultado.moedaOrigem)} =
            </Text>
            <Text style={estilos.resultadoValor}>
              {formatarMoeda(resultado.valorConvertido, resultado.moedaDestino)}
            </Text>
            <Text style={estilos.resultadoDetalhe}>
              Taxa: 1 {resultado.moedaOrigem} = {formatarTaxa(resultado.taxa)}{' '}
              {resultado.moedaDestino}
            </Text>
            <Text style={estilos.resultadoDetalhe}>
              Data de referência: {formatarData(resultado.data)}
            </Text>
            <Text style={estilos.resultadoAviso}>
              Taxa de referência divulgada pela API, não é cotação em tempo real.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#f9fafb' },
  // OBS: nao usei o SafeAreaView do react-native porque ele esta deprecado nas
  // versoes novas (o recomendado e o do react-native-safe-area-context). Pra
  // nao colocar pacote extra so por causa disso, deixei um paddingTop fixo.
  // Num app de verdade eu usaria o pacote.
  conteudo: { padding: 20, paddingTop: 64, paddingBottom: 40 },
  titulo: { fontSize: 26, fontWeight: '700', color: '#111827' },
  subtitulo: { fontSize: 14, color: '#6b7280', marginTop: 2, marginBottom: 22 },
  rotulo: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  campo: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    color: '#111827',
    marginBottom: 14,
  },
  linhaCarregando: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  textoCarregando: { color: '#6b7280' },
  botao: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  botaoDesabilitado: { backgroundColor: '#93c5fd' },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: '600' },
  botaoSecundario: { alignSelf: 'flex-start', paddingVertical: 6, marginBottom: 10 },
  textoBotaoSecundario: { color: '#2563eb', fontSize: 14, fontWeight: '600' },
  caixaAviso: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
  },
  textoAviso: { color: '#92400e' },
  caixaErro: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
  },
  textoErro: { color: '#991b1b' },
  dicaErro: { color: '#991b1b', fontSize: 12, marginTop: 4 },
  resultado: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginTop: 18,
  },
  resultadoOriginal: { fontSize: 15, color: '#6b7280' },
  resultadoValor: { fontSize: 30, fontWeight: '700', color: '#111827', marginVertical: 4 },
  resultadoDetalhe: { fontSize: 14, color: '#374151', marginTop: 4 },
  resultadoAviso: { fontSize: 12, color: '#6b7280', marginTop: 10 },
});
