# PHASE 1 — FOUNDATION

## 0. OBJECTIVE
Estabelecer base técnica do sistema (Next.js + Prisma + DB)

---

## 1. CONTRACT (ChatGPT)
Usar system.contract.md como fonte única de verdade

Sem implementação de regras ainda

---

## 2. DATA (Cursor)
- Setup Prisma
- Criar TODAS as tabelas:
  - AdminUser
  - Customer
  - Service
  - Plan
  - Account
  - Order
  - OrderAssignment

---

## 3. BACKEND (Codex)
- Setup base structure:
  - /lib/services
  - /lib/repositories
  - /lib/db

Sem lógica de negócio ainda

---

## 4. FRONTEND (Stitch → Gemini → Antigravity)
- Setup layout base
- Estrutura de rotas (App Router)

---

## 5. VALIDATION (Cursor / Claude)
- Validar schema vs contract
- Verificar relações FK
- Garantir enums corretos

---

## 6. COMMITS
- feat: init nextjs app
- feat: setup prisma schema
- feat: create base architecture