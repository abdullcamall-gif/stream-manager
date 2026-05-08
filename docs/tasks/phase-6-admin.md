# PHASE 6 — ADMIN PANEL

## 0. OBJECTIVE
Permitir gestão completa do sistema

---

## 1. CONTRACT
AdminUser + todas entidades

---

## 2. DATA
Nenhuma mudança

---

## 3. BACKEND (Codex)
- POST /admin/login
- GET /admin/orders
- PATCH approve/reject

CRUD:
- services
- plans
- accounts
- admins

---

## 4. FRONTEND
- Login admin
- Dashboard
- Lista de pedidos
- Botões:
  - Aprovar
  - Rejeitar

---

## 5. VALIDATION
- Apenas admin autenticado
- Role-based access

---

## 6. COMMITS
- feat: admin auth
- feat: admin dashboard
- feat: order moderation