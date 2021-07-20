"""Protocol engine state management."""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any, Callable, List, Set, Sequence

from opentrons_shared_data.deck.dev_types import DeckDefinitionV2

from .. import commands as cmd
from ..resources import DeckFixedLabware
from .substore import CommandReactive
from .commands import CommandState, CommandStore, CommandView
from .labware import LabwareState, LabwareStore, LabwareView
from .pipettes import PipetteState, PipetteStore, PipetteView
from .geometry import GeometryView
from .motion import MotionView


@dataclass(frozen=True)
class State:
    """Underlying engine state."""

    commands: CommandState
    labware: LabwareState
    pipettes: PipetteState


class StateView:
    """A read-only view of computed state."""

    _state: State
    _commands: CommandView
    _labware: LabwareView
    _pipettes: PipetteView
    _geometry: GeometryView
    _motion: MotionView

    @property
    def commands(self) -> CommandView:
        """Get state view selectors for commands state."""
        return self._commands

    @property
    def labware(self) -> LabwareView:
        """Get state view selectors for labware state."""
        return self._labware

    @property
    def pipettes(self) -> PipetteView:
        """Get state view selectors for pipette state."""
        return self._pipettes

    @property
    def geometry(self) -> GeometryView:
        """Get state view selectors for derived geometry state."""
        return self._geometry

    @property
    def motion(self) -> MotionView:
        """Get state view selectors for derived motion state."""
        return self._motion

    def get_state(self) -> State:
        """Get an immutable copy of the current engine state."""
        return self._state


class StateStore(StateView):
    """ProtocolEngine state store.

    A StateStore manages several substores, which will modify themselves in
    reaction to commands and other protocol events. State instances inside
    stores should be treated as immutable.
    """

    def __init__(
        self,
        deck_definition: DeckDefinitionV2,
        deck_fixed_labware: Sequence[DeckFixedLabware],
    ) -> None:
        """Initialize a StateStore and its substores."""
        self._command_store = CommandStore()
        self._pipette_store = PipetteStore()
        self._labware_store = LabwareStore(
            deck_fixed_labware=deck_fixed_labware,
            deck_definition=deck_definition,
        )

        self._lifecycle_substores: List[CommandReactive] = [
            self._command_store,
            self._pipette_store,
            self._labware_store,
        ]

        self._wait_checkers: Set[Callable[[], None]] = set()
        self._initialize_state()

    def get_state(self) -> State:
        """Get an immutable copy of the current engine state."""
        return self._state

    def handle_command(self, command: cmd.Command) -> None:
        """Modify State in reaction to a Command."""
        for substore in self._lifecycle_substores:
            substore.handle_command(command)

        self._update_state_views()

    async def wait_for(
        self,
        condition: Callable[..., Any],
        *args: Any,
        **kwargs: Any,
    ) -> None:
        """Wait for a condition to become true, checking whenever state changes."""
        result = asyncio.get_running_loop().create_future()

        def _check() -> None:
            try:
                is_done = condition(*args, **kwargs)
                if is_done:
                    self._wait_checkers.remove(_check)
                    result.set_result(None)
            except Exception as e:
                self._wait_checkers.remove(_check)
                result.set_exception(e)

        self._wait_checkers.add(_check)
        _check()
        await result

    def _initialize_state(self) -> None:
        """Initialize state data and view."""
        state = State(
            commands=self._command_store.state,
            labware=self._labware_store.state,
            pipettes=self._pipette_store.state,
        )

        # Base states
        self._state = state
        self._commands = CommandView(state.commands)
        self._labware = LabwareView(state.labware)
        self._pipettes = PipetteView(state.pipettes)

        # Derived states
        self._geometry = GeometryView(labware_view=self._labware)
        self._motion = MotionView(
            labware_view=self._labware,
            pipette_view=self._pipettes,
            geometry_view=self._geometry,
        )

    def _update_state_views(self) -> None:
        """Update state view interfaces to use latest underlying values."""
        state = State(
            commands=self._command_store.state,
            labware=self._labware_store.state,
            pipettes=self._pipette_store.state,
        )

        self._state = state
        self._commands._state = state.commands
        self._labware._state = state.labware
        self._pipettes._state = state.pipettes

        # check for any wait conditions
        for check_done in list(self._wait_checkers):
            check_done()
