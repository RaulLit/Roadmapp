import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { Roadmap } from '../db/types';

export default function RoadmapsScreen() {
  const [title, setTitle] = useState('');
  const { roadmaps, isLoading, loadRoadmaps, addRoadmap, removeRoadmap } = useRoadmapStore();

  useEffect(() => {
    loadRoadmaps();
  }, [loadRoadmaps]);

  const handleCreate = () => {
    if (!title.trim()) return;
    const created = addRoadmap(title.trim());
    if (created) {
      setTitle('');
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Roadmap',
      `Are you sure you want to delete "${name}"? All associated milestones and tasks will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeRoadmap(id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Roadmap }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/roadmap/${item.id}` as any)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>
          {item.milestones_count || 0} {item.milestones_count === 1 ? 'milestone' : 'milestones'} •{' '}
          {item.tasks_count || 0} {item.tasks_count === 1 ? 'task' : 'tasks'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id, item.title)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Create Roadmap Input Section */}
      <View style={styles.createBox}>
        <TextInput
          style={styles.input}
          placeholder="New roadmap name..."
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleCreate}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addButton, !title.trim() && styles.addButtonDisabled]}
          onPress={handleCreate}
          disabled={!title.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Roadmaps List */}
      {isLoading && roadmaps.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      ) : roadmaps.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No roadmaps created yet.</Text>
          <Text style={styles.emptySubtext}>Type a name above to create your first roadmap.</Text>
        </View>
      ) : (
        <FlatList
          data={roadmaps}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  createBox: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  addButton: {
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
