# The Accountant v1.4.0 - Deployment Guide

## Overview

The Accountant v1.4.0 introduces enhanced TEE attestation with rich context and immediate verification links. This version provides comprehensive attestation for all cryptographic operations with structured JSON report data.

## Key Features in v1.4.0

### 🔐 Enhanced Attestation System
- **Rich Context**: Attestation now includes operation type, user ID, public key, address, algorithm, timestamp, and app namespace
- **Message Context**: Sign operations include the message being signed
- **Signature Context**: Verify operations include the signature being verified
- **SHA256 Hashing**: All report data is hashed to fit within Intel TDX's 64-byte limit

### 🔗 Immediate Verification Links
- **t16z Explorer**: Verification links generated and displayed immediately after each operation
- **Phala Cloud**: Alternative verification endpoint for attestation quotes
- **UI Integration**: Links shown directly in response cards and toast notifications
- **Audit Trail**: All verification URLs stored in audit logs

### ✅ Complete Operation Coverage
- **Signup**: Generates attestation with user creation context
- **Sign**: Includes message in attestation report
- **Verify**: Now generates attestation (previously missing)

## Docker Deployment

### Quick Start

```bash
# Pull the latest image
docker pull hashwarlock/the-accountant:v1.4.0

# Run with Docker Compose
docker-compose up -d

# Or run directly
docker run -d \
  --name the-accountant \
  -p 3000:3000 \
  -v /var/run/dstack.sock:/var/run/dstack.sock \
  -v $(pwd)/data:/app/prisma \
  -e NODE_ENV=production \
  -e DATABASE_URL=file:./dev.db \
  -e ENABLE_ATTESTATION_UPLOAD=true \
  -e APP_NAMESPACE=the-accountant-v1 \
  hashwarlock/the-accountant:v1.4.0
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `DATABASE_URL` | `file:./dev.db` | SQLite database location |
| `ENABLE_ATTESTATION_UPLOAD` | `true` | Enable remote attestation |
| `APP_NAMESPACE` | `the-accountant-v1` | Unique namespace for key derivation |
| `EXPOSE_INFO` | `false` | Show system information endpoint |

### Volume Mounts

| Host Path | Container Path | Purpose |
|-----------|---------------|---------|
| `/var/run/dstack.sock` | `/var/run/dstack.sock` | TEE access (required) |
| `./data` | `/app/prisma` | Database persistence |

## Testing Attestation Features

### Manual Testing

1. **Test Signup with Attestation**:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"userId": "alice"}'
```

Expected response includes:
- `t16zVerificationUrl`: Link to t16z Explorer
- `phalaVerificationUrl`: Link to Phala Cloud (if available)

2. **Test Sign with Attestation**:
```bash
curl -X POST http://localhost:3000/api/users/alice/sign \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, TEE!"}'
```

3. **Test Verify with Attestation**:
```bash
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, TEE!",
    "signature": "0x...",
    "address": "0x..."
  }'
```

### Automated Testing

Use the provided test script:

```bash
# Test local deployment
./scripts/test-attestation.sh

# Test remote deployment
API_URL=https://your-server.com ./scripts/test-attestation.sh
```

## Attestation Report Structure

Each attestation includes a SHA256 hash of the following JSON structure:

```json
{
  "operation": "signup|sign|verify",
  "userId": "user-identifier",
  "publicKey": "0x04...",
  "address": "0x...",
  "algorithm": "secp256k1",
  "timestamp": "2025-01-10T19:00:00.000Z",
  "appNamespace": "the-accountant-v1",
  "message": "optional-message-for-sign",
  "signature": "optional-signature-for-verify"
}
```

## Verification Process

### Via t16z Explorer

1. Click the t16z verification link from any operation
2. The explorer will display:
   - TEE environment details
   - Attestation quote
   - Report data (hashed JSON)
   - Verification status

### Via Phala Cloud

1. Access the Phala Cloud verification URL (if provided)
2. View the attestation details including:
   - Checksum
   - Quote data
   - TEE measurements

### Via API

Query audit logs to retrieve verification URLs:

```bash
curl http://localhost:3000/api/audit-logs?userId=alice
```

## Security Considerations

### TEE Requirements
- Intel TDX or compatible TEE environment
- dstack runtime with socket access
- Proper permissions for `/var/run/dstack.sock`

### Data Protection
- All private keys derived deterministically in TEE
- Keys never exposed outside secure enclave
- Report data hashed before inclusion in attestation

### Network Security
- Use HTTPS in production
- Configure firewall rules appropriately
- Monitor audit logs regularly

## Monitoring

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Audit Logs

Monitor all operations through the audit endpoint:

```bash
# Get all logs
curl http://localhost:3000/api/audit-logs

# Filter by user
curl http://localhost:3000/api/audit-logs?userId=alice

# Filter by action
curl http://localhost:3000/api/audit-logs?action=sign
```

### Docker Logs

```bash
# View container logs
docker logs the-accountant

# Follow logs
docker logs -f the-accountant

# With Docker Compose
docker-compose logs -f web
```

## Troubleshooting

### Common Issues

1. **No attestation URLs in response**:
   - Verify `ENABLE_ATTESTATION_UPLOAD=true`
   - Check dstack socket is mounted
   - Ensure TEE environment is available

2. **Database migration errors**:
   - Container automatically runs migrations on startup
   - Check write permissions on volume mount
   - Review logs for Prisma errors

3. **Signature verification failures**:
   - Ensure message format matches exactly
   - Verify address format (lowercase)
   - Check signature encoding (hex with 0x prefix)

### Debug Mode

Enable debug logging:

```bash
docker run -d \
  --name the-accountant-debug \
  -e NODE_ENV=development \
  -e DEBUG=* \
  # ... other options
  hashwarlock/the-accountant:v1.4.0
```

## Migration from Previous Versions

### From v1.3.x to v1.4.0

No database schema changes. Simply update the Docker image:

```bash
# Stop current container
docker-compose down

# Update docker-compose.yml to use v1.4.0
sed -i 's/v1.3.[0-9]/v1.4.0/g' docker-compose.yml

# Start with new version
docker-compose up -d
```

### Verification of Upgrade

After upgrading, test that attestation is working:

```bash
# Create a test user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"userId": "upgrade-test"}'

# Check for t16zVerificationUrl in response
```

## Support

### Documentation
- GitHub: https://github.com/HashWarlock/the-accountant
- dstack SDK: https://github.com/phala/dstack-sdk

### Known Limitations
- Intel TDX report data limited to 64 bytes
- Phala Cloud API is public (no authentication required)
- SQLite database for simplicity (consider PostgreSQL for production scale)

## Version History

- **v1.4.0**: Enhanced attestation with rich context and immediate verification
- **v1.3.6**: Audit UI improvements with attestation links
- **v1.3.5**: Prisma CLI fixes for Docker
- **v1.3.4**: Auto-migration support
- **v1.3.0**: Initial attestation implementation

---

Last Updated: January 10, 2025