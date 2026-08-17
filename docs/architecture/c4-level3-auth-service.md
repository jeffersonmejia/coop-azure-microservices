# C4 Level 3 — auth-service Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  auth-service                                                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │  ┌─────────────┐                                               │   │
│  │  │             │                                               │   │
│  │  │  Security   │──── JWT Filter                                │   │
│  │  │  Config     │                                               │   │
│  │  │             │                                               │   │
│  │  └──────┬──────┘                                               │   │
│  │         │                                                       │   │
│  │         ▼                                                       │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │   │
│  │  │             │    │             │    │             │        │   │
│  │  │  Auth       │───►│  User       │───►│  User       │        │   │
│  │  │  Controller │    │  Service    │    │  Repository │        │   │
│  │  │             │    │             │    │             │        │   │
│  │  └─────────────┘    └──────┬──────┘    └──────┬──────┘        │   │
│  │                            │                   │               │   │
│  │                            ▼                   ▼               │   │
│  │                     ┌─────────────┐    ┌─────────────┐        │   │
│  │                     │             │    │             │        │   │
│  │                     │  Jwt        │    │  PostgreSQL │        │   │
│  │                     │  Service    │    │  (auth)     │        │   │
│  │                     │             │    │             │        │   │
│  │                     └─────────────┘    └─────────────┘        │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Components:**
| Component | Responsibility |
|-----------|----------------|
| SecurityConfig | Spring Security configuration, JWT filter chain |
| AuthController | REST endpoints: /register, /login, /me |
| AuthService | Business logic: registration, login, token generation |
| UserRepository | Data access: user CRUD operations |
| JwtService | JWT token creation, validation, parsing |

**Data flow:**
1. Request → SecurityConfig (JWT filter)
2. AuthController receives request
3. AuthService processes business logic
4. UserRepository persists to PostgreSQL
5. JwtService generates/validates tokens
