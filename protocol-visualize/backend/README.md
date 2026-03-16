# Protocol Visualize Backend

## Overview

This backend is a FastAPI service responsible for:

- receiving uploaded `.py` protocol files
- saving protocol source and metadata locally
- calling `opentrons-robot-analysis`
- storing the latest analysis payload
- serving saved protocol records to the frontend
- deleting saved protocols

It is intentionally filesystem-based. No database is used.

## System Structure

```text
app/
  main.py
    FastAPI app and HTTP routes
  analyzer.py
    HTTP client for opentrons-robot-analysis
  storage.py
    local filesystem persistence
  models.py
    Pydantic models for protocol records and analyzer responses

storage/
  <protocolId>/
    src/
      <original filename>
    analysis/
      <timestamp>.json
    metadata.json
```

## API

- `GET /health`
- `GET /protocols`
- `GET /protocols/{protocolId}`
- `GET /protocols/{protocolId}/source`
- `POST /protocols`
- `DELETE /protocols/{protocolId}`

## Compose Recommended

Preferred local setup is via `docker compose` from
[protocol-visualize](/Users/koji/Desktop/test_test_test/opentrons/protocol-visualize):

```bash
cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize
make compose-up
```

The backend container listens on `http://127.0.0.1:8000` and talks to the
containerized analyzer via `ANALYZER_URL=http://analyzer:7860`.

## Host-Only Development

```bash
cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize/backend
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Troubleshooting

### Backend starts but upload fails

Verify analyzer connectivity:

```bash
curl -s http://127.0.0.1:7860/health
curl -s http://127.0.0.1:7860/robot/health
```

### Backend in docker compose never becomes healthy

Check compose state and logs:

```bash
cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize
docker compose ps
make compose-logs
```

## Storage Behavior

When a protocol is uploaded:

1. backend creates a new `protocolId`
2. source is saved under `storage/<protocolId>/src/`
3. backend calls `opentrons-robot-analysis`
4. returned analysis payload is written under `storage/<protocolId>/analysis/`
5. `metadata.json` is updated with the latest record

When a protocol is deleted:

1. backend removes `storage/<protocolId>/`
2. subsequent list/detail requests no longer return that record
