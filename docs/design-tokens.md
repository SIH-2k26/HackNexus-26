# Vaultic Design System & Token Reference Specification

> **Purpose**: This standalone design system reference documents the visual identity, CSS variables, typography, component recipes, and signature motifs extracted from Vaultic's Operator Console (`frontend/dashboard.html`). Re-use these exact tokens and component recipes in bank-facing dashboards to maintain complete visual consistency.

---

## 1. Visual Identity & Mood

Vaultic uses a **dark ink-navy fintech console aesthetic** with high-contrast, restrained color accents designed for security-vendor platforms. Monospace typography (`JetBrains Mono`) is deliberately used for all live mathematical metrics, timestamps, hashes, and API key tokens to communicate a strong *"this is real, empirical data"* signal. The sealed-vault node card metaphor reinforces privacy-preserving federated architecture.

**Color Semantics**:
- **Electric Blue (`#3b82f6`)**: Platform identity, primary actions, architecture headers.
- **Emerald Green (`#10b981`)**: Verified privacy states, active node status, high recall/accuracy.
- **Amber Yellow (`#f59e0b`)**: Moderate risk warnings and caution states.
- **Crimson Red (`#ef4444`)**: High fraud risk flags, key revocation, reset operations.
- **Deep Slate/Navy (`#080c14` – `#1a2540`)**: Layered surface hierarchy creating visual depth.

---

## 2. Copy-Pasteable CSS Variables (`:root`)

```css
:root {
  /* Surface Color Hierarchy */
  --bg:        #080c14; /* Deepest navy-black main background */
  --surface:   #0f1623; /* Header, table rows, input backgrounds, sub-tiles */
  --card:      #141d2e; /* Primary container card background */
  --card-hi:   #1a2540; /* Card hover background & ghost button fill */
  --border:    #1e2d45; /* Subtle container borders & row dividers */
  --border-hi: #2a3f5f; /* Interactive hover borders & scrollbar thumbs */

  /* Accent & Semantic Palette */
  --blue:      #3b82f6; /* Brand primary blue, headings, active buttons */
  --blue-dim:  #1d4ed8; /* Darker blue accent variant */
  --green:     #10b981; /* Active status, positive recall metrics, allow badges */
  --red:       #ef4444; /* Revoked status, high risk flags, danger buttons */
  --yellow:    #f59e0b; /* Caution, medium risk badges, warning buttons */
  --purple:    #8b5cf6; /* Secondary metrics (training round counts) */

  /* Neutral Typography */
  --text:      #e2e8f0; /* Primary body text (light slate) */
  --muted:     #64748b; /* Section headers, labels, inactive captions */
  --sub:       #94a3b8; /* Sub-labels, key prefixes, pill text */

  /* Font Families */
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## 3. Typography & Google Fonts

### Font Import URL
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Font Usage Rules

| Context | Font Family | Weight | Size / Style | Purpose |
|---|---|---|---|---|
| **Body & Base** | `var(--font-body)` | 400 | `14px` | Standard page text, UI labels |
| **Brand Title** | `var(--font-body)` | 700 | `1.1rem` (-0.02em spacing) | Header title |
| **Section Titles** | `var(--font-body)` | 600 | `0.7rem` (uppercase, 0.08em spacing) | Card section headers (`var(--muted)`) |
| **KPI / Metric Values** | `var(--font-body)` | 700 | `1.5rem – 1.6rem` (line-height 1) | High-level summary metrics |
| **API Keys & Tokens** | `var(--font-mono)` | 400 | `0.68rem – 0.75rem` | Cryptographic hashes, API keys |
| **Timestamps & Logs** | `var(--font-mono)` | 400 | `0.68rem` (`var(--muted)`) | Audit log timestamps, ISO dates |

---

## 4. Spacing & Layout Architecture

### Border Radius Rules
- **Primary Cards (`.card`)**: `12px`
- **Vault Node Cards (`.vault-card`) & KPI Tiles (`.kpi`)**: `8px` – `10px`
- **Buttons (`.btn`) & Input Fields**: `7px`
- **Badges (`.status-badge`, `.rec-badge`)**: `5px`
- **Pills (`.pill`)**: `8px`
- **Contribution Progress Bars**: `4px`
- **Status Indicators (`.status-dot`)**: `50%` (circle)

### Layout Grid & Gaps
- **Page Container Grid**: Two-column layout (`grid-template-columns: 1fr 340px`) with a `1px solid var(--border)` vertical divider.
- **Main Column Padding**: `1.5rem 1.5rem 1.5rem 2rem` with a `1.25rem` vertical gap between card elements.
- **Sidebar Padding**: `1.5rem` with a `1.25rem` vertical gap.
- **KPI & Vault Card Grid**: 4-column grid (`grid-template-columns: repeat(4, 1fr)`) with `0.75rem` gaps.

### Responsive Breakpoint
```css
@media (max-width: 900px) {
  .page { grid-template-columns: 1fr; }
  .main-col { border-right: none; border-bottom: 1px solid var(--border); }
  .kpi-row, .vault-grid { grid-template-columns: repeat(2, 1fr); }
}
```

---

## 5. Component Recipes

### 1. Primary Container Card (`.card`)
```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}
```

### 2. Button Recipes (`.btn`)
- **Primary Button (`.btn-primary`)**:
  `font-family: var(--font-body); font-size: 0.78rem; font-weight: 600; padding: 0.4rem 0.9rem; border-radius: 7px; background: var(--blue); color: #ffffff; border: none; cursor: pointer;`
- **Danger Button (`.btn-danger`)**:
  `background: var(--red); color: #ffffff;`
- **Ghost Button (`.btn-ghost`)**:
  `background: var(--card-hi); color: var(--sub); border: 1px solid var(--border);`
- **Small Button (`.btn-sm`)**:
  `padding: 0.25rem 0.6rem; font-size: 0.72rem;`
- **Hover Micro-interaction**:
  `filter: brightness(1.1); transform: translateY(-1px); transition: all 0.15s;`

### 3. Header Input Pill (`.pill`)
```css
.pill {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  color: var(--sub);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
```

### 4. Metric Tile (`.kpi`)
```css
.kpi {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.9rem 1rem;
}
```

### 5. Status Badges (`.status-badge`)
```css
.status-badge {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 5px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
}
.status-badge.active  { background: #052e16; color: var(--green); }
.status-badge.revoked { background: #450a0a; color: var(--red); }
```

---

## 6. Signature Visual Motifs

### 1. Vault Node Card Pattern
- **Card Structure**:
  ```html
  <div class="vault-card">
    <h3>Bank Name</h3>
    <div class="vault-acc">95.2%</div>
    <div class="vault-sub">accuracy</div>
    <div class="contribution-bar-wrap">
      <div class="contribution-bar" style="width: 25%"></div>
    </div>
    <div class="contribution-label">25.0% of global model</div>
  </div>
  ```
- **CSS Styling**:
  ```css
  .vault-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1rem;
    text-align: center;
    transition: border-color 0.2s;
  }
  .vault-card:hover { border-color: var(--border-hi); }
  .vault-card h3 { font-size: 0.78rem; font-weight: 600; color: var(--blue); margin-bottom: 0.5rem; }
  .vault-acc { font-size: 1.5rem; font-weight: 700; line-height: 1; margin-bottom: 0.15rem; }
  .contribution-bar-wrap { background: var(--border); border-radius: 4px; height: 4px; margin-top: 0.4rem; }
  .contribution-bar { background: var(--blue); border-radius: 4px; height: 4px; transition: width 0.5s ease; }
  ```

### 2. Pulsing Liveness Dot
```css
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 3. Risk Alert Boxes (`.risk-result`)
- **Low Risk (`.LOW`)**: `background: #05231422; border: 1px solid var(--green); color: #6ee7b7;`
- **Medium Risk (`.MEDIUM`)**: `background: #451a0322; border: 1px solid var(--yellow); color: #fde68a;`
- **High Risk (`.HIGH`)**: `background: #450a0a22; border: 1px solid var(--red); color: #fca5a5;`
