import { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { useDstackSign } from '@dstack/react-native';

export default function SignScreen() {
  const { sign, isSigning, signResult } = useDstackSign();
  const [message, setMessage] = useState('');

  const handleSign = async () => {
    if (!message) {
      Alert.alert('Error', 'Please enter a message to sign');
      return;
    }

    try {
      await sign(message);
      Alert.alert('Success!', 'Message signed successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign message');
    }
  };

  const copyToClipboard = (text: string) => {
    // In real app, use Clipboard API
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Sign Message
            </Text>
            <Divider style={styles.divider} />

            <TextInput
              label="Message"
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              multiline
              numberOfLines={4}
              disabled={isSigning}
              style={styles.input}
              placeholder="Enter your message here..."
            />

            <Button
              mode="contained"
              onPress={handleSign}
              loading={isSigning}
              disabled={isSigning}
              icon="file-document-edit"
              style={styles.button}
            >
              {isSigning ? 'Signing...' : 'Sign Message'}
            </Button>
          </Card.Content>
        </Card>

        {signResult && (
          <Card style={styles.resultCard} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.resultTitle}>
                ✅ Signature Generated
              </Text>
              <Divider style={styles.divider} />

              <View style={styles.resultItem}>
                <Text variant="labelMedium" style={styles.label}>
                  Signature
                </Text>
                <Text variant="bodySmall" style={styles.monospace}>
                  {signResult.signature.slice(0, 20)}...{signResult.signature.slice(-18)}
                </Text>
                <Button
                  mode="text"
                  onPress={() => copyToClipboard(signResult.signature)}
                  compact
                >
                  Copy
                </Button>
              </View>

              <View style={styles.resultItem}>
                <Text variant="labelMedium" style={styles.label}>
                  Address
                </Text>
                <Text variant="bodySmall" style={styles.monospace}>
                  {signResult.address}
                </Text>
                <Button
                  mode="text"
                  onPress={() => copyToClipboard(signResult.address)}
                  compact
                >
                  Copy
                </Button>
              </View>

              {signResult.attestation?.verificationUrls?.t16z && (
                <View style={styles.resultItem}>
                  <Text variant="labelMedium" style={styles.label}>
                    TEE Attestation
                  </Text>
                  <Text variant="bodySmall" style={styles.attestation}>
                    Verified on t16z blockchain
                  </Text>
                  <Button
                    mode="text"
                    onPress={() => copyToClipboard(signResult.attestation!.verificationUrls!.t16z!)}
                    compact
                  >
                    View Proof
                  </Button>
                </View>
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
    borderColor: '#CDFF6A',
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
    marginBottom: 4,
  },
  attestation: {
    color: '#CDFF6A',
    marginBottom: 4,
  },
});
