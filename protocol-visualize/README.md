# Protocol Visualize

`protocol-visualize` is a standalone web app for uploading Python protocols,
running Opentrons analysis, storing the uploaded source and analysis locally,
and visualizing the result with the existing Protocol Visualization UI reused
from the main `app`.

## Components

- `frontend/`
  - React + TypeScript + Vite browser app.
  - Provides upload, saved protocol list, delete, and visualization pages.
- `backend/`
  - FastAPI service.
  - Stores uploaded protocols under local filesystem storage and serves records
    to the frontend.
- `opentrons-robot-analysis/`
  - FastAPI service that proxies analysis through local `robot-server`
    processes and returns a visualization-ready analysis document.

## System Structure

```text
Browser frontend
  -> protocol-visualize/backend
      -> saves source + metadata + analysis under backend/storage
      -> calls opentrons-robot-analysis/analyze
          -> talks to local robot-server OT-2 and Flex instances
          -> returns completed analysis document
```

## Compose Recommended

`backend` and `opentrons-robot-analysis` can be started together with
`docker compose`. The analyzer container internally starts both OT-2 and Flex
`robot-server` processes, so you do not need to run them separately on the host.

From `protocol-visualize/`:

```bash
cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize
make compose-up
```

This starts:

- `analyzer`
  - FastAPI service on `http://127.0.0.1:7860`
  - internal OT-2 `robot-server`
  - internal Flex `robot-server`
- `backend`
  - FastAPI service on `http://127.0.0.1:8000`

Useful commands:

```bash
make compose-logs
make compose-down
make health
```

Then start the frontend on the host:

```bash
cd /Users/koji/Desktop/test_test_test/opentrons
yarn install

cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize/frontend
yarn install
VITE_API_BASE_URL=http://127.0.0.1:8000 yarn dev
```

Open the URL printed by Vite, typically:
- [http://127.0.0.1:5173](http://127.0.0.1:5173)

## Host-Only Development

From `protocol-visualize/`, run setup once:

```bash
cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize
make setup
```

Then start the full stack:

```bash
cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize
make up
```

This host-only path starts:

- OT-2 `robot-server`
- Flex `robot-server`
- `opentrons-robot-analysis`
- `backend`
- `frontend`

Useful commands:

```bash
make help
make health
make dev-ot2
make dev-flex
make dev-analyzer
make dev-backend
make dev-frontend
```

Runtime logs are written to:

- [protocol-visualize/.logs](/Users/koji/Desktop/test_test_test/opentrons/protocol-visualize/.logs)

Stop the full stack with `Ctrl+C` in the terminal running `make up`.

### Manual Startup

1. Set up `robot-server`

```bash
cd /Users/koji/Desktop/test_test_test/opentrons
uv run make -C robot-server setup
```

2. Start OT-2 `robot-server`

```bash
cd /Users/koji/Desktop/test_test_test/opentrons
make -C robot-server dev-ot2 dev_host=127.0.0.1 dev_port=31950
```

3. Start Flex `robot-server`

```bash
cd /Users/koji/Desktop/test_test_test/opentrons
make -C robot-server dev-flex dev_host=127.0.0.1 dev_port=31951
```

4. Start analyzer service

```bash
cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize/opentrons-robot-analysis
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn api:app --host 0.0.0.0 --port 7860
```

Health check:
- [http://127.0.0.1:7860/robot/health](http://127.0.0.1:7860/robot/health)

Expected result:
- both `ot2.ok` and `flex.ok` are `true`

5. Start backend

```bash
cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize/backend
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check:
- [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

6. Start frontend

```bash
cd /Users/koji/Desktop/test_test_test/opentrons
yarn install

cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize/frontend
yarn install
VITE_API_BASE_URL=http://127.0.0.1:8000 yarn dev
```

Open the URL printed by Vite, typically:
- [http://127.0.0.1:5173](http://127.0.0.1:5173)

## Troubleshooting

### Docker compose waits forever

`make compose-logs` uses `docker compose logs -f`, so it continues following
logs until you stop it with `Ctrl+C`.

Check actual service state with:

```bash
cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize
docker compose ps
make health
```

### Analyzer health is not green

Check analyzer logs:

```bash
cd /Users/koji/Desktop/test_test_test/opentrons/protocol-visualize
make compose-logs
```

The analyzer must report both OT-2 and Flex as healthy at:
- [http://127.0.0.1:7860/robot/health](http://127.0.0.1:7860/robot/health)

### Upload fails with robot connection errors

This usually means analyzer cannot reach the required `robot-server`.

- In Docker mode, restart compose services:
```bash
make compose-down
make compose-up
```

- In host-only mode, verify both robot servers are running before uploading.

## Notes

- Upload target is `.py` only.
- Backend storage lives under
  [storage](/Users/koji/Desktop/test_test_test/opentrons/protocol-visualize/backend/storage).
- If OT-2 is not running, protocols without explicit `requirements = {"robotType": "Flex"}` may fail because analyzer defaults to OT-2.
- `docker-compose.yml` is the preferred way to run `backend` and `analyzer`
  together for local development.
