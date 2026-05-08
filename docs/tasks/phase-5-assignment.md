# PHASE 5 — ACCOUNT ASSIGNMENT

## 0. OBJECTIVE
Implementar alocação de contas e slots de forma segura

---

## 1. CONTRACT
Entities:
- Account
- OrderAssignment

---

## 2. DATA
- Garantir:
  - availableSlots <= totalSlots
  - nunca negativo

---

## 3. BACKEND (Codex) ⚠️ CRÍTICO

Implementar:

approveOrder(orderId)

FLOW:

1. Iniciar TRANSAÇÃO
2. Buscar order (status deve ser PENDING)
3. Buscar plan
4. Encontrar Account com:
   - serviceId correto
   - availableSlots > 0
   - isActive = true
5. Selecionar slot disponível
6. Criar OrderAssignment
7. Decrementar availableSlots
8. Atualizar order → APPROVED
9. Commit

FAIL:
- Se não houver account → THROW NO_AVAILABLE_ACCOUNT

---

## 4. FRONTEND
Nenhum (lógica interna)

---

## 5. VALIDATION
- Nunca permitir slots negativos
- Testar concorrência (race condition)
- Garantir idempotência (não aprovar 2x)

---

## 6. COMMITS
- feat: account allocation logic
- feat: transactional approval
- fix: prevent double approval