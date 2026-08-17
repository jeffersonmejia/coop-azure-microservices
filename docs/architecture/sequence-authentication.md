# Sequence Diagram — Authentication

## Login Flow

```
┌──────┐    ┌─────────┐    ┌──────────────┐    ┌────────────┐
│ User │    │ Angular │    │ auth-service │    │ PostgreSQL │
└──┬───┘    └────┬────┘    └──────┬───────┘    └─────┬──────┘
   │             │                │                   │
   │  1. login   │                │                   │
   │  credentials│                │                   │
   ├────────────►│                │                   │
   │             │                │                   │
   │             │  2. POST       │                   │
   │             │  /auth/login   │                   │
   │             ├───────────────►│                   │
   │             │                │                   │
   │             │                │  3. query user    │
   │             │                │  by email         │
   │             │                ├──────────────────►│
   │             │                │                   │
   │             │                │  4. user data     │
   │             │                │◄──────────────────┤
   │             │                │                   │
   │             │                │  5. verify        │
   │             │                │  BCrypt password  │
   │             │                │                   │
   │             │                │  6. generate JWT  │
   │             │                │  (sub, uid, role) │
   │             │                │                   │
   │             │  7. JWT token  │                   │
   │             │◄───────────────┤                   │
   │             │                │                   │
   │  8. token   │                │                   │
   │◄────────────┤                │                   │
   │             │                │                   │
```

## Register Flow

```
┌──────┐    ┌─────────┐    ┌──────────────┐    ┌────────────┐
│ User │    │ Angular │    │ auth-service │    │ PostgreSQL │
└──┬───┘    └────┬────┘    └──────┬───────┘    └─────┬──────┘
   │             │                │                   │
   │  1. register│                │                   │
   │  data       │                │                   │
   ├────────────►│                │                   │
   │             │                │                   │
   │             │  2. POST       │                   │
   │             │  /auth/register                   │
   │             ├───────────────►│                   │
   │             │                │                   │
   │             │                │  3. check email   │
   │             │                │  uniqueness       │
   │             │                ├──────────────────►│
   │             │                │                   │
   │             │                │  4. hash password │
   │             │                │  BCrypt           │
   │             │                │                   │
   │             │                │  5. insert user   │
   │             │                ├──────────────────►│
   │             │                │                   │
   │             │                │  6. success       │
   │             │                │◄──────────────────┤
   │             │                │                   │
   │             │  7. 201 Created│                   │
   │             │◄───────────────┤                   │
   │             │                │                   │
   │  8. success │                │                   │
   │◄────────────┤                │                   │
   │             │                │                   │
```

## JWT Validation (subsequent requests)

```
┌──────┐    ┌─────────┐    ┌──────────────┐
│ User │    │ Angular │    │ auth-service │
└──┬───┘    └────┬────┘    └──────┬───────┘
   │             │                │
   │  1. request │                │
   │  + JWT      │                │
   ├────────────►│                │
   │             │                │
   │             │  2. request    │
   │             │  + Authorization: Bearer JWT
   │             ├───────────────►│
   │             │                │
   │             │                │  3. JWT Filter
   │             │                │  validate token
   │             │                │  extract claims
   │             │                │
   │             │                │  4. set CurrentUser
   │             │                │
   │             │  5. response   │
   │             │◄───────────────┤
   │             │                │
   │  6. response│                │
   │◄────────────┤                │
   │             │                │
```
