# PHASE 2 — CATALOG (SERVICES & PLANS)

## 0. OBJECTIVE
Exibir serviços e planos disponíveis ao cliente

---

## 1. CONTRACT (ChatGPT)
Entities:
- Service
- Plan

---

## 2. DATA (Cursor)
- Seed inicial:
  - Netflix
  - Spotify
  - Disney+

---

## 3. BACKEND (Codex)
GET /api/v1/services
GET /api/v1/plans

Rules:
- Apenas isActive = true

---

## 4. FRONTEND
- Landing page
- Listagem de planos
- PlanCard component reutilizável

---

## 5. VALIDATION
- Plan deve pertencer a Service
- price > 0
- durationInDays > 0

---

## 6. COMMITS
- feat: services endpoint
- feat: plans endpoint
- feat: landing page plans