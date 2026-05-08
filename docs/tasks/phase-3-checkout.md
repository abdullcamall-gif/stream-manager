# PHASE 3 — CHECKOUT

## 0. OBJECTIVE
Permitir criação de pedidos com pagamento manual

---

## 1. CONTRACT
Entities:
- Order
- Customer

---

## 2. DATA
- Criar Customer automaticamente usando:
  - name
  - phone

---

## 3. BACKEND (Codex)
POST /api/v1/orders

VALIDATIONS:
- name obrigatório
- phone obrigatório
- planId válido
- paymentMethod válido
- proofImageUrl obrigatório

---

## 4. FRONTEND
Checkout 3 steps:

1. Dados
   - name
   - phone

2. Pagamento
   - seleção (eMola, M-Pesa, banco)
   - instruções claras

3. Upload
   - comprovante

FINAL:
- tela de sucesso (status: PENDING)
- CTA para WhatsApp

---

## 5. VALIDATION
- Não criar order sem comprovante
- Status inicial = PENDING
- Phone deve ser válido (formato básico)

---

## 6. COMMITS
- feat: order creation endpoint
- feat: checkout flow UI
- feat: proof upload