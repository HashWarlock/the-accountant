import { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { useDstackSign } from '@dstack/react-native';

export default function VerifyScreen() {
  const { verify, isVerifying, verifyResult } = useDstackSign();

  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [userId, setUserId] = useState('');

  const handleVerify = async () => {
    if (!message || !signature) {
      Alert.alert('Error', 'Please fill in message and signature');
      return;
    }

    try {
      await verify({ message, signature, userId: userId || undefined });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to verify signature');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Verify Signature
            </Text>
            <Divider style={styles.divider} />

            <TextInput
              label="Message"
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              multiline
              numberOfLines={3}
              disabled={isVerifying}
              style={styles.input}
              placeholder="Original message"
            />

            <TextInput
              label="Signature"
              value={signature}
              onChangeText={setSignature}
              mode="outlined"
              disabled={isVerifying}
              style={styles.input}
              placeholder="0x..."
            />

            <TextInput
              label="User ID (Optional)"
              value={userId}
              onChangeText={setUserId}
              mode="outlined"
              disabled={isVerifying}
              style={styles.input}
              placeholder="Verify against specific user"
            />

            <Button
              mode="contained"
              onPress={handleVerify}
              loading={isVerifying}
              disabled={isVerifying}
              icon="shield-check"
              style={styles.button}
            >
              {isVerifying ? 'Verifying...' : 'Verify Signature'}
            </Button>
          </Card.Content>
        </Card>

        {verifyResult && (
          <Card
            style={[
              styles.resultCard,
              verifyResult.valid ? styles.validCard : styles.invalidCard,
            ]}
            mode="elevated"
          >
            <Card.Content>
              <Text variant="titleMedium" style={styles.resultTitle}>
                {verifyResult.valid ? '✅ Valid Signature' : '❌ Invalid Signature'}
              </Text>
              <Divider style={styles.divider} />

              <View style={styles.resultItem}>
                <Text variant="labelMedium" style={styles.label}>
                  Recovered Address
                </Text>
                <Text variant="bodySmall" style={styles.monospace}>
                  {verifyResult.recoveredAddress}
                </Text>
              </View>

              {verifyResult.user && (
                <>
                  <View style={styles.resultItem}>
                    <Text variant="labelMedium" style={styles.label}>
                      User ID
                    </Text>
                    <Text variant="bodyMedium" style={styles.value}>
                      {verifyResult.user.userId}
                    </Text>
                  </View>

                  <View style={styles.resultItem}>
                    <Text variant="labelMedium" style={styles.label}>
                      Email
                    </Text>
                    <Text variant="bodyMedium" style={styles.value}>
                      {verifyResult.user.email}
                    </Text>
                  </View>
                </>
              )}

              {!verifyResult.user && verifyResult.valid && (
                <Text variant="bodySmall" style={styles.warning}>
                  Signature is valid but signer not found in database
                </Text>
              )}
            </Card.Content>
          </Card>
        )}
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
  card: {
    backgroundColor: '#14182E',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#CDFF6A',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
  },
  button: {
    marginTop: 8,
  },
  resultCard: {
    backgroundColor: '#14182E',
  },
  validCard: {
    borderColor: '#10B981',
    borderWidth: 1,
  },
  invalidCard: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  resultTitle: {
    color: '#CDFF6A',
    fontWeight: 'bold',
  },
  resultItem: {
    marginBottom: 16,
  },
  label: {
    color: '#94A3B8',
    marginBottom: 4,
  },
  monospace: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
  },
  value: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  warning: {
    color: '#F59E0B',
    fontStyle: 'italic',
  },
});
