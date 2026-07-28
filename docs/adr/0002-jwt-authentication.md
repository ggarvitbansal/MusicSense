# ADR-0002: JWT Authentication Strategy

## Status
Accepted

## Context
MusicSense needs a secure, scalable mechanism to identify users, protect routes (such as upload, configuration, and analysis features), and coordinate sessions.

We considered two primary session patterns:
1. **Stateless Session Tokens (JSON Web Tokens - JWT)**
2. **Stateful Server-Side Sessions (stored in Redis or PostgreSQL)**

## Options Considered

- **Option A: Stateful Session Cookies**: The server stores session identifiers in a database or key-value store (e.g. Redis) and issues a session cookie to the client.
- **Option B: Stateless JWT Tokens**: The server signs a payload containing the `userId` and `email` using a private key (`JWT_SECRET`) and returns it to the client. The client sends this token in subsequent headers.

## Decision
We chose **Option B: Stateless JWT Tokens** with password encryption powered by **BCrypt**.

## Consequences & Rationale

### Why JWT was Selected (Option B)
- **Stateless & Scalable**: Decoupled from session databases. The backend does not need to perform a database lookup to authenticate requests. Token validation is performed in-memory via cryptographic verification.
- **Cross-Service Compatibility**: MusicSense plans to orchestrate independent processes (such as a separate Python ML service). A stateless JWT can be decrypted and validated by any microservice with access to the `JWT_SECRET`, avoiding complex distributed session syncs.

### Why Stateful Sessions Were Not Chosen (Option A)
- **Operational Complexity**: Stateful sessions require running a Redis cache or performing query-blocking lookups in PostgreSQL on every single API request, increasing connection pool exhaustion risks under load.

### Why BCrypt Was Selected for Password Hashing
- **Work Factor (Adaptive Hashing)**: BCrypt implements a configurable iteration log round parameter (we configured 10 rounds). This introduces CPU-bound delay to password generation, making brute-force and rainbow-table attacks computationally impractical.

### Security Considerations & Risk Mitigation
- **XSS & Token Storage**: JWT tokens stored in localStorage or sessionStorage are vulnerable to cross-site scripting (XSS) leaks. For the MVP, token storage is managed on the client, but future production versions will implement secure HTTP-only cookies or double-submit token defenses.
- **Revocation**: Stateless JWTs cannot be revoked before they expire. We set the expiration (`JWT_EXPIRES_IN`) to `7d` for development convenience. In production, short-lived tokens (`15m`) coupled with secure refresh tokens will be implemented.

### Future Refresh Token Strategy
As we scale to production:
1. The server will issue a short-lived access JWT (`15m`) via response body and a long-lived cryptographically random refresh token (`30d`) in a secure, `HttpOnly` cookie.
2. A separate `/auth/refresh` route will parse the cookie, look up the active refresh token in a database revocation table, and issue a fresh access token if valid.
