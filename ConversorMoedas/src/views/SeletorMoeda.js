import { Platform, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function SeletorMoeda({ rotulo, valor, moedas, onChange, desabilitado }) {
  return (
    <View style={estilos.bloco}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <View style={[estilos.caixa, desabilitado && estilos.caixaDesabilitada]}>
        <Picker
          selectedValue={valor}
          onValueChange={onChange}
          enabled={!desabilitado}
          mode="dropdown"
          style={estilos.picker}
          itemStyle={estilos.item}
        >
          {moedas.map((m) => (
            <Picker.Item key={m.codigo} label={`${m.codigo} - ${m.nome}`} value={m.codigo} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: { marginBottom: 14 },
  rotulo: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  caixa: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  caixaDesabilitada: { backgroundColor: '#f3f4f6' },
  picker: {
    color: '#111827',
    // No iOS o picker vira uma roda grande; limito a altura pra nao ocupar a tela toda.
    ...(Platform.OS === 'ios' ? { height: 130 } : null),
  },
  item: { fontSize: 16, height: 130, color: '#111827' },
});
