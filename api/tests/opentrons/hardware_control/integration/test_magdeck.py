import asyncio

import pytest
from mock import AsyncMock
from opentrons.drivers.rpi_drivers.types import USBPort
from opentrons.hardware_control.emulation.app import MAGDECK_PORT
from opentrons.hardware_control.modules import MagDeck


@pytest.fixture
async def magdeck(loop: asyncio.BaseEventLoop, emulation_app) -> MagDeck:
    td = await MagDeck.build(
        port=f"socket://127.0.0.1:{MAGDECK_PORT}",
        execution_manager=AsyncMock(),
        usb_port=USBPort(name="", port_number=1, sub_names=[], device_path="", hub=1),
        loop=loop
    )
    yield td


def test_device_info(magdeck: MagDeck):
    assert {'model': 'magdeck_emulator', 'serial': 'fake_serial',
            'version': '1'} == magdeck.device_info


async def test_engage_cycle(magdeck: MagDeck):
    """It should cycle engage and disengage"""
    await magdeck.engage(1)
    assert magdeck.current_height == 1

    await magdeck.deactivate()
    assert magdeck.current_height == 0
