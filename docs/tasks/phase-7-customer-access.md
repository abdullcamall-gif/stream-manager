# PHASE 7 — CUSTOMER ACCESS

## 0. OBJECTIVE
Permitir cliente ver status e credenciais via telefone

---

## 1. CONTRACT
Order + OrderAssignment

---

## 2. DATA
Nenhuma

---

## 3. BACKEND
GET /api/v1/orders/by-phone

---

## 4. FRONTEND
- Input: telefone
- Lista de pedidos

EXIBIÇÃO:
- PENDING → aguardando
- APPROVED → mostrar credenciais
- REJECTED → aviso

---

## 5. VALIDATION
- Nunca mostrar credenciais se:
  - PENDING
  - REJECTED

---

## 6. COMMITS
- feat: customer access panel
- feat: conditional credential display