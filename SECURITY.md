# Security Documentation - The Accountant

## Critical Security Configuration

### APP_NAMESPACE Environment Variable

**⚠️ CRITICAL**: The `APP_NAMESPACE` environment variable is essential for key derivation security.

#### What it does
The `APP_NAMESPACE` is incorporated into the cryptographic key derivation path to ensure that each user receives a unique private key. The derivation path structure is:

```
wallet/{APP_NAMESPACE}/eth/{SHA256(userId)}
```

#### Why it's critical
Without proper namespace configuration:
- Users could potentially receive identical private keys
- Cross-application key collisions could occur
- Security boundaries between environments would be compromised

#### Key derivation process
1. User provides their `userId` (e.g., "alice@example.com")
2. System computes SHA256 hash of the userId
3. Constructs path: `wallet/{namespace}/eth/{hash}`
4. TEE derives a unique private key from this path
5. Same userId + same namespace = same key (deterministic)
6. Different namespace = completely different key

#### Configuration examples

**Production deployment:**
```bash
export APP_NAMESPACE="the-accountant-prod"
```

**Staging environment:**
```bash
export APP_NAMESPACE="the-accountant-staging"
```

**Docker Compose:**
```yaml
environment:
  - APP_NAMESPACE=the-accountant-v1
```

**Kubernetes:**
```yaml
env:
  - name: APP_NAMESPACE
    value: "the-accountant-prod"
```

#### Important considerations

1. **Never share namespaces between environments**
   - Production, staging, and development should use different namespaces
   - This ensures complete key isolation between environments

2. **Namespace changes invalidate all keys**
   - Changing the namespace will cause all users to receive new keys
   - Previous keys become inaccessible
   - Plan namespace changes carefully

3. **Version migrations**
   - Use versioned namespaces for major upgrades: `app-v1`, `app-v2`
   - Allows controlled key rotation during migrations

4. **Multi-tenant deployments**
   - Each tenant should have a unique namespace
   - Example: `tenant-acme-prod`, `tenant-globex-prod`

## Security Best Practices

### 1. Environment Isolation
- **Production**: `APP_NAMESPACE=the-accountant-prod`
- **Staging**: `APP_NAMESPACE=the-accountant-staging`
- **Development**: `APP_NAMESPACE=the-accountant-dev`

### 2. Namespace Naming Convention
Follow a consistent pattern:
```
{application}-{tenant}-{environment}-{version}
```

Examples:
- `accountant-acme-prod-v1`
- `accountant-default-staging-v2`
- `wallet-service-dev-v1`

### 3. Key Rotation Strategy
To rotate all user keys:
1. Deploy with new namespace (e.g., change from `v1` to `v2`)
2. Users will automatically receive new keys
3. Old keys become inaccessible
4. No user data migration needed (keys are deterministic)

### 4. Disaster Recovery
- Document your namespace configuration
- Store namespace values in secure configuration management
- Include namespace in backup documentation
- Test key recovery with correct namespace values

## TEE (Trusted Execution Environment) Security

### Key Derivation Security
The dstack SDK ensures:
- Keys are derived within the TEE's secure enclave
- Derivation uses hardware-backed entropy
- Keys never exist in plaintext outside the TEE
- Remote attestation proves key integrity

### Path Parameter Security
The first parameter to `getKey()` determines the derived key:
```javascript
// Secure - includes unique identifier in path
const path = `wallet/${namespace}/eth/${userHash}`;
await client.getKey(path, subject);

// INSECURE - same path for all users!
await client.getKey('wallet/ethereum', userId); // DON'T DO THIS
```

## Audit Trail

### Key Derivation Logging
The application logs detailed information about key derivation:
```
🔑 [dstack] User ID: alice@example.com
#️⃣ [dstack] User ID Hash: a665a45920422f9d...
🔐 [dstack] Unique Path: wallet/the-accountant-v1/eth/a665a45920422f9d...
📛 [dstack] App Namespace: the-accountant-v1
```

### Verification Logging
Signature verification includes comprehensive logging:
```
🔍 Expected Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
🔍 Recovered Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
✅ Verification result: VALID
```

## Deployment Security Checklist

- [ ] Set unique `APP_NAMESPACE` for deployment
- [ ] Document namespace in deployment configuration
- [ ] Verify namespace is different from other environments
- [ ] Test key derivation with sample users
- [ ] Confirm TEE socket is accessible (`/var/run/dstack.sock`)
- [ ] Enable audit logging for key operations
- [ ] Configure monitoring for failed verifications
- [ ] Document key rotation procedures
- [ ] Test disaster recovery with namespace values

## Incident Response

### If keys are compromised:
1. Immediately change `APP_NAMESPACE` to invalidate all keys
2. Deploy updated configuration
3. Notify users that keys have been rotated
4. Review audit logs for unauthorized access
5. Update security documentation

### If namespace is accidentally changed:
1. Restore original `APP_NAMESPACE` value
2. Users will regain access to original keys
3. Document incident and add safeguards
4. Consider adding namespace validation in CI/CD

## Contact

For security concerns or questions:
- Open an issue (for non-sensitive matters)
- Email security contact (for sensitive issues)

---

*Last updated: 2025-09-09*
*Version: 1.1.0*