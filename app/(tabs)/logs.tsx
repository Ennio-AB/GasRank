import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logger, type LogEntry } from '../../lib/logger';

const COLORS: Record<string, string> = {
  info:  '#1d4ed8',
  warn:  '#b45309',
  error: '#dc2626',
};

const BG: Record<string, string> = {
  info:  '#eff6ff',
  warn:  '#fffbeb',
  error: '#fef2f2',
};

export default function LogsScreen() {
  const [logs,    setLogs]    = useState<LogEntry[]>(() => logger.getLogs());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter,  setFilter]  = useState<'all' | 'error' | 'warn'>('all');

  useEffect(() => {
    const unsub = logger.subscribe(() => setLogs(logger.getLogs()));
    return unsub;
  }, []);

  const visible = filter === 'all' ? logs : logs.filter((l) => l.level === filter);

  function fmt(ts: string) {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}.${d.getMilliseconds().toString().padStart(3,'0')}`;
  }

  return (
    <View style={s.wrap}>
      {/* Toolbar */}
      <View style={s.bar}>
        <View style={s.filters}>
          {(['all', 'error', 'warn'] as const).map((f) => (
            <TouchableOpacity key={f} style={[s.ftag, filter === f && s.ftagOn]} onPress={() => setFilter(f)}>
              <Text style={[s.ftagTxt, filter === f && s.ftagTxtOn]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={s.clearBtn} onPress={() => logger.clear()}>
          <Text style={s.clearTxt}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {visible.length === 0 && (
        <View style={s.empty}>
          <Text style={s.emptyTxt}>Sin logs</Text>
        </View>
      )}

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isOpen = expanded === item.id;
          return (
            <TouchableOpacity
              style={[s.entry, { backgroundColor: BG[item.level] }]}
              onPress={() => setExpanded(isOpen ? null : item.id)}
              activeOpacity={0.8}
            >
              <View style={s.entryHead}>
                <Text style={[s.level, { color: COLORS[item.level] }]}>{item.level.toUpperCase()}</Text>
                <Text style={s.tag}>[{item.tag}]</Text>
                <Text style={s.time}>{fmt(item.ts)}</Text>
              </View>
              <Text style={s.msg}>{item.msg}</Text>
              {isOpen && item.data && (
                <ScrollView horizontal style={s.dataWrap}>
                  <Text style={s.data}>{item.data}</Text>
                </ScrollView>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap:       { flex: 1, backgroundColor: '#f8fafc' },
  bar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: '#1e293b' },
  filters:    { flexDirection: 'row', gap: 6 },
  ftag:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#475569' },
  ftagOn:     { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  ftagTxt:    { color: '#94a3b8', fontSize: 12 },
  ftagTxtOn:  { color: '#fff' },
  clearBtn:   { paddingHorizontal: 10, paddingVertical: 4 },
  clearTxt:   { color: '#ef4444', fontSize: 12 },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyTxt:   { color: '#94a3b8' },
  entry:      { marginHorizontal: 8, marginTop: 4, borderRadius: 6, padding: 8 },
  entryHead:  { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 2 },
  level:      { fontSize: 10, fontWeight: '700' },
  tag:        { fontSize: 11, color: '#475569', fontWeight: '600' },
  time:       { fontSize: 10, color: '#94a3b8', marginLeft: 'auto' },
  msg:        { fontSize: 13, color: '#1e293b' },
  dataWrap:   { marginTop: 4, maxHeight: 120 },
  data:       { fontSize: 11, fontFamily: 'monospace', color: '#374151', backgroundColor: '#e2e8f0', padding: 6, borderRadius: 4 },
});
