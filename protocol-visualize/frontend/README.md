# Protocol Visualize Frontend

## Overview

This frontend is a standalone browser app built with React, TypeScript, and
Vite. It provides:

- protocol upload
- drag-and-drop upload
- saved protocol list
- protocol deletion
- analysis error view
- protocol visualization using shared UI extracted from the main desktop app

It does not depend on Electron at runtime. Browser-safe shims are used where
shared app code assumes app-shell APIs.

## System Structure

```text
src/
  api/
    HTTP client for backend protocol records
  components/
    upload form, saved list, error view, visualization wrapper
  pages/
    home page and protocol detail page
  shims/
    browser-safe replacements for app-shell remote access
  store.ts
    minimal Redux store required by reused app components
```

The visualization page renders the shared
[SharedVisualizer](/Users/koji/Desktop/test_test_test/opentrons/app/src/organisms/Desktop/ProtocolVisualization/SharedVisualizer/index.tsx)
from the main `app`, while the standalone frontend handles routing and backend
integration.

## Run

From the repo root:

```bash
cd /Users/koji/Desktop/test_test_test/opentrons
yarn install
```

Then start the frontend:

```bash
cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize/frontend
yarn install
VITE_API_BASE_URL=http://127.0.0.1:8000 yarn dev
```

## Key Routes

- `/`
  - upload form
  - drag-and-drop area
  - saved protocol list
- `/protocols/:protocolId`
  - visualization on success
  - dedicated error view on failure

## Backend Contract

The frontend expects backend protocol records with this shape:

```ts
{
  id: string
  filename: string
  uploadedAt: string
  updatedAt: string
  analysisStatus: 'completed' | 'failed'
  robotType: 'ot2' | 'flex' | null
  analysis: object
  errorSummary: {
    message: string
    status_code?: number | null
    errors: string[]
  } | null
}
```
