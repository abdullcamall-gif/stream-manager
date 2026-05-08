# PHASE 4 — ORDER MANAGEMENT

## 0. OBJECTIVE
Permitir consulta de pedidos pelo cliente via telefone

---

## 1. CONTRACT
Entity:
- Order

---

## 2. DATA
Nenhuma alteração

---

## 3. BACKEND (Codex)
GET /api/v1/orders/by-phone?phone=...

---

## 4. FRONTEND
- Página de consulta
- Input: telefone
- Lista de pedidos

---

## 5. VALIDATION
- Retornar lista vazia se não houver pedidos
- Sanitizar phone input

---

## 6. COMMITS
- feat: orders by phone endpoint
- feat: customer order list UI