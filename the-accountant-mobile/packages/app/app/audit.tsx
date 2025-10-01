import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, Divider, Button } from 'react-native-paper';
import { useAuditLog } from '@dstack/react-native';

export default function AuditScreen() {
  const { logs, isLoading, pagination, refetch } = useAuditLog({ limit: 20 });

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'signup':
        return '#10B981';
      case 'sign':
        return '#3B82F6';
      case 'verify':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const renderLogItem = ({ item }: any) => (
    <Card style={styles.logCard} mode="outlined">
      <Card.Content>
        <View style={styles.logHeader}>
          <Chip
            style={[styles.chip, { backgroundColor: getOperationColor(item.operation) }]}
            textStyle={styles.chipText}
          >
            {item.operation.toUpperCase()}
          </Chip>
          <Text variant="labelSmall" style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {item.message && (
          <View style={styles.logItem}>
            <Text variant="labelSmall" style={styles.label}>
              Message
            </Text>
            <Text variant="bodySmall" style={styles.value}>
              {item.message.slice(0, 50)}
              {item.message.length > 50 ? '...' : ''}
            </Text>
          </View>
        )}

        {item.signature && (
          <View style={styles.logItem}>
            <Text variant="labelSmall" style={styles.label}>
              Signature
            </Text>
            <Text variant="bodySmall" style={styles.monospace}>
              {item.signature.slice(0, 20)}...{item.signature.slice(-18)}
            </Text>
          </View>
        )}

        {item.t16zVerificationUrl && (
          <View style={styles.logItem}>
            <Text variant="labelSmall" style={styles.label}>
              TEE Attestation
            </Text>
            <Text variant="bodySmall" style={styles.attestation}>
              ✅ Verified on blockchain
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading audit logs...
        </Text>
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No Audit Logs
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Start signing messages to see your activity history
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Audit Trail
        </Text>
        <Button mode="text" onPress={() => refetch()} icon="refresh">
          Refresh
        </Button>
      </View>

      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {pagination && pagination.hasMore && (
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            Showing {logs.length} of {pagination.total} logs
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    color: '#CDFF6A',
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#94A3B8',
  },
  emptyTitle: {
    color: '#E2E8F0',
    marginBottom: 8,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  logCard: {
    backgroundColor: '#14182E',
    borderColor: '#1E293B',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timestamp: {
    color: '#94A3B8',
  },
  divider: {
    marginVertical: 12,
  },
  logItem: {
    marginBottom: 8,
  },
  label: {
    color: '#94A3B8',
    marginBottom: 2,
  },
  value: {
    color: '#E2E8F0',
  },
  monospace: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  attestation: {
    color: '#CDFF6A',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#94A3B8',
  },
});
