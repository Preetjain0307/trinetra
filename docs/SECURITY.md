# TRINETRA Defense-in-Depth Security Architecture

## 1. Zero-Trust Security Model

TRINETRA implements a defense-in-depth, zero-trust security architecture designed for tactical command centers and edge deployments:

```
┌──────────────────────────────────────────────────────────────┐
│                    API Gateway / TLS 1.3                     │
└──────────────────────────────┬───────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
   [ JWT Token Verification ]      [ Rate Limiting / DoS Guard ]
                │
                ▼
   [ Role-Based Access Control ]
   • Commander (Full access, QRF dispatch, config updates)
   • Operator (Incident review, verification, tracking)
   • Analyst (Historical search, report export)
   • Auditor (Audit log review, integrity verification)
                │
                ▼
   [ Cryptographic Evidence Store ] + [ Immutable Audit Log ]
   (SHA-256 Hashing of All Media)      (Hash-Chained Action Log)
```

---

## 2. Authentication & Authorization

- **JWT Auth**: High-entropy HMAC-SHA256 tokens with short expiration (60 minutes) and refresh token rotation.
- **Password Hashing**: Direct `bcrypt` algorithm with salt rounds $\ge 12$.
- **Least Privilege Principle**: API endpoints enforce strict dependency injection checks via `get_current_active_user` and `require_role(["commander", "admin"])`.
- **CORS & CSRF Protection**: Explicit origin whitelisting in FastAPI middleware.

---

## 3. Cryptographic Chain-of-Custody

All human interactions (incident verification, dismissal, escalation, evidence exports) produce an immutable audit record:
- User ID and Role
- UTC Timestamp
- Action Descriptor
- Target Entity ID
- Client IP Address
- Previous Record SHA-256 Hash (Merkle-chain compatible)

---

## 4. Operational Classification

- **Status**: Functional (JWT, RBAC, Bcrypt, SHA-256 Chain).
- **Defence Readiness**: Field-ready for air-gapped tactical LANs and mTLS encrypted edge clusters.
