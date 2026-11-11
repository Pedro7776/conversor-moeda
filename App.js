import { StatusBar } from 'expo-status-bar';
import ConversorView from './src/views/ConversorView.js';

export default function App() {
  return (
    <>
      <ConversorView />
      <StatusBar style="dark" />
    </>
  );
}
