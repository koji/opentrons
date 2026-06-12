"""Run `opentrons analyze` with command -> source-line instrumentation.

This script is executed by the analyzer service inside the interpreter that
has the `opentrons` package installed (see OPENTRONS_PYTHON in api.py). In
addition to the normal analysis JSON it writes a mapping file that associates
each protocol-engine command id with the protocol source line that produced
it, so the frontend can highlight the matching code when a step is selected.

How the mapping is captured:

* `ChildThreadTransport.execute_command*` runs on the protocol thread, so the
  user's protocol frames are on its call stack. A patched wrapper records the
  innermost protocol-file line for each outgoing command request.
* `ProtocolEngine.add_and_execute_command*` sees the resulting `Command`
  (including its id) and joins it with the line recorded for the request.

Commands that are not issued from user code (e.g. the implicit `home`) never
pass through the transport with a protocol frame on the stack, so they simply
have no entry in the mapping.
"""

import argparse
import ast
import json
import sys
from pathlib import Path
from typing import Any, Dict, Optional


def _install_tracker(protocol_filename: str) -> Dict[str, int]:
    """Patch protocol-engine entry points; returns the live command-id -> line map."""
    from opentrons.protocol_engine.clients.transports import ChildThreadTransport
    from opentrons.protocol_engine.protocol_engine import ProtocolEngine

    command_lines: Dict[str, int] = {}
    # Keyed by id(request): the request object stays alive (held by the engine
    # coroutine's closure) between the transport hook and the engine hook, and
    # the engine hook pops the entry on entry, so ids cannot be reused against us.
    pending_lines: Dict[int, int] = {}

    def _protocol_line() -> Optional[int]:
        frame = sys._getframe(1)
        while frame is not None:
            # Python protocols are compiled with filename=<basename>, see
            # opentrons.protocol_runner.python_protocol_wrappers.
            if Path(frame.f_code.co_filename).name == protocol_filename:
                return frame.f_lineno
            frame = frame.f_back
        return None

    def _capturing(original):  # type: ignore[no-untyped-def]
        def wrapper(self, request):  # type: ignore[no-untyped-def]
            line = _protocol_line()
            if line is not None:
                pending_lines[id(request)] = line
            return original(self, request)

        return wrapper

    ChildThreadTransport.execute_command = _capturing(  # type: ignore[method-assign]
        ChildThreadTransport.execute_command
    )
    ChildThreadTransport.execute_command_wait_for_recovery = _capturing(  # type: ignore[method-assign]
        ChildThreadTransport.execute_command_wait_for_recovery
    )

    def _recording(original):  # type: ignore[no-untyped-def]
        async def wrapper(self, request):  # type: ignore[no-untyped-def]
            line = pending_lines.pop(id(request), None)
            command = await original(self, request=request)
            if line is not None and command is not None:
                command_lines[command.id] = line
            return command

        return wrapper

    ProtocolEngine.add_and_execute_command = _recording(  # type: ignore[method-assign]
        ProtocolEngine.add_and_execute_command
    )
    ProtocolEngine.add_and_execute_command_wait_for_recovery = _recording(  # type: ignore[method-assign]
        ProtocolEngine.add_and_execute_command_wait_for_recovery
    )

    return command_lines


def _statement_spans(source: str, lines: set) -> Dict[int, tuple]:
    """Map each captured line to the (start, end) of its innermost enclosing statement.

    A call that is formatted across several lines should highlight the whole
    statement, not just the line the CALL instruction reports.
    """
    spans: Dict[int, tuple] = {}
    if not lines:
        return spans
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return spans

    for node in ast.walk(tree):
        if not isinstance(node, ast.stmt):
            continue
        start = getattr(node, "lineno", None)
        end = getattr(node, "end_lineno", None)
        if start is None or end is None:
            continue
        for line in lines:
            if start <= line <= end:
                previous = spans.get(line)
                if previous is None or (end - start) < (previous[1] - previous[0]):
                    spans[line] = (start, end)
    return spans


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json-output", required=True)
    parser.add_argument("--map-output", required=True)
    parser.add_argument("protocol_file")
    args = parser.parse_args()

    protocol_path = Path(args.protocol_file)
    command_lines = _install_tracker(protocol_path.name)

    from opentrons.cli.analyze import analyze

    try:
        analyze.main(
            ["--json-output", args.json_output, str(protocol_path)],
            standalone_mode=False,
        )
    except SystemExit:
        # `analyze` exits non-zero for protocols with errors; the analysis
        # JSON (and our mapping) is still written and still useful.
        pass
    except Exception as exc:
        print(f"instrumented analyze failed: {exc}", file=sys.stderr)

    source = protocol_path.read_text(encoding="utf-8")
    spans = _statement_spans(source, set(command_lines.values()))
    mapping: Dict[str, Any] = {
        command_id: {
            "line": line,
            "startLine": spans.get(line, (line, line))[0],
            "endLine": spans.get(line, (line, line))[1],
        }
        for command_id, line in command_lines.items()
    }
    Path(args.map_output).write_text(
        json.dumps({"commands": mapping}), encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
