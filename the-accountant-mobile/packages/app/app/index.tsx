import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useDstackWallet } from '@dstack/react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { isConnected, userId, address, disconnect } = useDstackWallet();

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text variant="displaySmall" style={styles.title}>
            The Accountant
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            TEE-backed deterministic key management with hardware-level security
          </Text>
        </View>

        {/* Connection Status */}
        {isConnected && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Connected Wallet
              </Text>
              <Divider style={styles.divider} />
              <View style={styles.walletInfo}>
                <Text variant="bodyMedium" style={styles.label}>
                  User ID
                </Text>
                <Text variant="bodyLarge" style={styles.value}>
                  {userId}
                </Text>

                <Text variant="bodyMedium" style={[styles.label, styles.mt]}>
                  Address
                </Text>
                <Text variant="bodyLarge" style={styles.address}>
                  {address?.slice(0, 8)}...{address?.slice(-6)}
                </Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button mode="outlined" onPress={handleDisconnect}>
                Disconnect
              </Button>
            </Card.Actions>
          </Card>
        )}

        {/* Main Actions */}
        <View style={styles.actions}>
          {!isConnected && (
            <Button
              mode="contained"
              onPress={() => router.push('/signup')}
              style={styles.button}
              icon="wallet-plus"
            >
              Create Wallet
            </Button>
          )}

          {isConnected && (
            <>
              <Button
                mode="contained"
                onPress={() => router.push('/sign')}
                style={styles.button}
                icon="file-document-edit"
              >
                Sign Message
              </Button>

              <Button
                mode="outlined"
                onPress={() => router.push('/audit')}
                style={styles.button}
                icon="history"
              >
                View Audit Logs
              </Button>
            </>
          )}

          <Button
            mode="outlined"
            onPress={() => router.push('/verify')}
            style={styles.button}
            icon="shield-check"
          >
            Verify Signature
          </Button>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Text variant="titleMedium" style={styles.featuresTitle}>
            Key Features
          </Text>

          <Card style={styles.featureCard} mode="outlined">
            <Card.Content>
              <Text variant="titleSmall" style={styles.featureTitle}>
                🔒 TEE-Backed Security
              </Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Keys derived in Trusted Execution Environment with Intel TDX attestation
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.featureCard} mode="outlined">
            <Card.Content>
              <Text variant="titleSmall" style={styles.featureTitle}>
                🔑 Deterministic Wallets
              </Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Same user ID always generates the same wallet address
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.featureCard} mode="outlined">
            <Card.Content>
              <Text variant="titleSmall" style={styles.featureTitle}>
                📜 Remote Attestation
              </Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Verifiable proof of TEE execution with blockchain verification
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  content: {
    padding: 16,
  },
  hero: {
    alignItems: 'center',
    marginVertical: 32,
  },
  title: {
    color: '#CDFF6A',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 24,
    backgroundColor: '#14182E',
  },
  cardTitle: {
    color: '#CDFF6A',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  walletInfo: {
    marginTop: 8,
  },
  label: {
    color: '#94A3B8',
    marginBottom: 4,
  },
  value: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  address: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
  },
  mt: {
    marginTop: 12,
  },
  actions: {
    marginBottom: 32,
  },
  button: {
    marginBottom: 12,
  },
  features: {
    marginBottom: 32,
  },
  featuresTitle: {
    color: '#E2E8F0',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureCard: {
    marginBottom: 12,
    backgroundColor: '#14182E',
    borderColor: '#1E293B',
  },
  featureTitle: {
    color: '#CDFF6A',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureText: {
    color: '#94A3B8',
  },
});
