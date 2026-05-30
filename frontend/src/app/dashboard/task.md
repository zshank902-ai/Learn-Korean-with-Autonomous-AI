# Phase 1 (P0) — Critical Infrastructure

## Step 1 — Restyle Dark-Theme Components
- `[x]` Restyle `NotificationSystem.tsx` → Clay toasts
- `[x]` Restyle `LevelUpModal.tsx` → Clay modal
- `[x]` Restyle `AnimatedXPBar.tsx` → Clay XP bar

## Step 2 — Fix Broken Stores
- `[x]` Fix `SmartCorrector.tsx` (remove `useAIStore`, use `useKMasteryStore`)
- `[x]` Fix `AIChatBox.tsx` (remove `useAIStore`, use `useKMasteryStore` + real WS)

## Step 3 — Create Navbar
- `[x]` Create `components/Navbar.tsx` (floating clay navbar)
- `[x]` Update `app/layout.tsx` to render Navbar globally

## Step 4 — Dashboard Page
- `[x]` Create `app/dashboard/page.tsx`
- `[x]` DailyQuestsPanel subcomponent inside dashboard
- `[x]` GlobalLeaderboard subcomponent inside dashboard

## Step 5 — TypeScript Validation
- `[x]` Run `npx tsc --noEmit` — must return zero errors

## Step 6 — Browser Demo
- `[x]` Capture live screenshots of Navbar + Dashboard
