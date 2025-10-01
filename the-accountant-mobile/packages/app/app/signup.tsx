import { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useDstackWallet } from '@dstack/react-native';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isSigningUp } = useDstackWallet();

  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');

  const handleSignup = async () => {
    if (!email || !userId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (userId.length < 3) {
      Alert.alert('Error', 'User ID must be at least 3 characters');
      return;
    }

    try {
      const result = await signup({ email, userId });

      Alert.alert(
        'Success!',
        `Wallet created successfully!\n\nAddress: ${result.user.address.slice(0, 10)}...`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create wallet');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Create Secure Wallet
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Generate your TEE-backed wallet with deterministic keys
          </Text>
        </View>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              disabled={isSigningUp}
              style={styles.input}
              placeholder="alice@example.com"
            />

            <TextInput
              label="User ID"
              value={userId}
              onChangeText={setUserId}
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              disabled={isSigningUp}
              style={styles.input}
              placeholder="alice"
            />

            <Text variant="bodySmall" style={styles.hint}>
              Choose a unique identifier (minimum 3 characters)
            </Text>

            <Divider style={styles.divider} />

            <Button
              mode="contained"
              onPress={handleSignup}
              loading={isSigningUp}
              disabled={isSigningUp}
              icon="wallet-plus"
              style={styles.button}
            >
              {isSigningUp ? 'Creating Wallet...' : 'Create Wallet'}
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard} mode="outlined">
          <Card.Content>
            <Text variant="titleSmall" style={styles.infoTitle}>
              🔐 Security Note
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              Your private key is derived deterministically from your User ID within the
              secure TEE enclave. Save these credentials securely.
            </Text>
          </Card.Content>
        </Card>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#CDFF6A',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#14182E',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
  },
  hint: {
    color: '#94A3B8',
    marginTop: -8,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  button: {
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#14182E',
    borderColor: '#CDFF6A',
  },
  infoTitle: {
    color: '#CDFF6A',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#94A3B8',
  },
});
