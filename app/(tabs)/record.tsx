import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RecordScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Ionicons name="videocam" size={48} color="#0D7377" />
        </View>
        <Text style={styles.title}>Record Video</Text>
        <Text style={styles.subtitle}>Create your video profile</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start Recording</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  icon: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
  button: { backgroundColor: '#0D7377', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
