const React = require('react');
const { View, Text, StyleSheet } = require('react-native');

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  txt:  { color: '#64748b', fontSize: 15 },
});

function MapView({ style, children }) {
  return React.createElement(View, { style: [s.wrap, style] },
    React.createElement(Text, { style: s.txt }, '⛽ Mapa disponible solo en móvil'),
    children
  );
}

function Marker() { return null; }

module.exports = { default: MapView, Marker };
module.exports.default = MapView;
module.exports.Marker = Marker;
