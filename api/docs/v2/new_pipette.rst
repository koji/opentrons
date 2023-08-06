:og:description: How to load and work with Opentrons pipettes in a Python protocol.

.. _new-pipette:

########
Pipettes
########

When writing a protocol, you must inform the Protocol API about the pipettes you will be using on your OT-2. The Protocol API then creates software objects called :py:class:`.InstrumentContext`, that represent the attached pipettes.

Pipettes are loaded into a specific mount (``'left'`` or ``'right'``) on the OT-2 using the function :py:meth:`.ProtocolContext.load_instrument` from the :py:class:`.ProtocolContext` class. This will return an :py:class:`.InstrumentContext` object. See :ref:`v2-atomic-commands` and :ref:`v2-complex-commands`
for liquid handling commands from the :py:class:`.InstrumentContext` class.

.. _new-create-pipette:

Loading A Pipette
------------------

Specify pipettes in your protocol using the :py:meth:`.ProtocolContext.load_instrument` method. This method requires the model of the instrument to load, the mount to load it in, and (optionally) a list of associated tip racks:

.. code-block:: python
    :substitutions:

    from opentrons import protocol_api

    metadata = {'apiLevel': '|apiLevel|'}

    def run(protocol: protocol_api.ProtocolContext):
        # Load a P50 8-Channel Pipette on the left mount
        left = protocol.load_instrument('p50_multi', 'left')
        # Load a P1000 Single-Channel Pipette on the right mount
        # with two racks of tips
        tiprack1 = protocol.load_labware('opentrons_96_tiprack_1000ul', 1)
        tiprack2 = protocol.load_labware('opentrons_96_tiprack_1000ul', 2)
        right = protocol.load_instrument('p1000_single', 'right',
                                         tip_racks=[tiprack1, tiprack2])

.. versionadded:: 2.0

When you load a pipette in this way, you are declaring that you want the specified pipette to be attached to the robot. Even if you don't use the pipette anywhere else in your protocol, the Opentrons App or the touchscreen on Flex will not let your protocol proceed until all pipettes loaded with ``load_instrument`` are attached.

If you're writing a protocol that uses the Flex Gripper, you might think that this would be the place in your protocol to declare that. However, the gripper doesn't require ``load_instrument``! Whether your gripper requires a protocol is determined by the presence of :py:meth:`.ProtocolContext.move_labware` commands. See :ref:`moving-labware` for more details.

.. _new-multichannel-pipettes:

Multi-Channel Pipettes
======================

All building block and advanced commands work with both single-channel (like
``'p20_single_gen2'``) and multi-channel (like ``'p20_multi_gen2'``) pipettes.
To keep the interface to the Opentrons API consistent between single and
multi-channel pipettes, commands treat the *backmost channel* (furthest from the
door) of a
multi-channel pipette as the location of the pipette. Location arguments to
building block and advanced commands are specified for the backmost channel.
This also means that offset changes (such as :py:meth:`.Well.top` or
:py:meth:`.Well.bottom`) can be applied to the single specified well, and each
channels of the pipette will be at the same position relative to the well
that it is over.

Because there is only one motor in a multi-channel pipette, multi-channel
pipettes will always aspirate and dispense on all channels simultaneously.

For instance, to aspirate from the first column of a 96-well plate you would write:

.. code-block:: python
    :substitutions:

    from opentrons import protocol_api

    metadata = {'apiLevel': '|apiLevel|'}

    def run(protocol: protocol_api.ProtocolContext):
        # Load a tiprack for 300uL tips
        tiprack1 = protocol.load_labware('opentrons_96_tiprack_300ul', 1)
        # Load a wellplate
        plate = protocol.load_labware('corning_96_wellplate_360ul_flat', 4)

        # Load a P300 Multi GEN2 on the right mount
        right = protocol.load_instrument(
            'p300_multi_gen2', 'right',  tip_racks=[tiprack1])

        # Specify well A1 for pick_up_tip. The backmost channel of the
        # pipette moves to A1, which means the rest of the wells are above the
        # rest of the wells in column 1.
        right.pick_up_tip(tiprack1['A1'])

        # Similarly, specifying well A2 for aspirate means the pipette will
        # position its backmost channel over well A2, and the rest of the
        # pipette channels are over the rest of the wells of column 1
        right.aspirate(300, plate['A2'])

        # Dispense into column 3 of the plate with all 8 channels of the
        # pipette at the top of their respective wells
        right.dispense(300, plate['A3'].top())

In general, you should specify wells in the first row of a labware when you are
using multi-channel pipettes. One common exception to this rule is when using
384-well plates. The spacing between the wells in a 384-well plate and the space
between the nozzles of a multi-channel pipette means that a multi-channel
pipette accesses every other well in a column. Specifying well A1 acesses every
other well starting with the first (rows A, C, E, G, I, K, M, and O); specifying well
B1 similarly accesses every other well, but starting with the second (rows B, D,
F, H, J, L, N, and P).

.. code-block:: python
    :substitutions:

    from opentrons import protocol_api

    metadata = {'apiLevel': '|apiLevel|'}

    def run(protocol: protocol_api.ProtocolContext):
        # Load a tiprack for 300uL tips
        tiprack1 = protocol.load_labware('opentrons_96_tiprack_300ul', 1)
        # Load a wellplate
        plate = protocol.load_labware('corning_384_wellplate_112ul_flat', 4)

        # Load a P300 Multi GEN2 on the right mount
        right = protocol.load_instrument(
            'p300_multi_gen2', 'right', tip_racks=[tiprack1])

        # pick up a tip in preparation for aspiration
        right.pick_up_tip()

        # Aspirate from wells A1, C1, E1, G1, I1, K1, M1, and O1
        right.aspirate(300, plate['A1'])
        # Dispense in wells B1, D1, F1, H1, J1, L1, N1, and P1
        right.dispense(300, plate['B1'])


This pattern of access applies to both building block commands and advanced
commands.

.. _new-pipette-models:

Pipette Models
==============

This table lists the model names, which are passed to :py:meth:`.ProtocolContext.load_instrument`, for each model of pipette sold by Opentrons.


+---------------------------------------+-------------------------+
|          Pipette Type                 |     Model Name          |
+=======================================+=========================+
| ``P20 Single GEN2`` (1 - 20 µL)       | ``'p20_single_gen2'``   |
+---------------------------------------+-------------------------+
| ``P300 Single GEN2`` (20 - 300 µL)    | ``'p300_single_gen2'``  |
+---------------------------------------+-------------------------+
| ``P1000 Single GEN2`` (100 - 1000 µL) | ``'p1000_single_gen2'`` |
+---------------------------------------+-------------------------+
| ``P300 Multi GEN2`` (20-300 µL)       | ``'p300_multi_gen2'``   |
+---------------------------------------+-------------------------+
| ``P20 Multi GEN2`` (1-20 µL)          | ``'p20_multi_gen2'``    |
+---------------------------------------+-------------------------+
| ``P10 Single``   (1 - 10 µL)          | ``'p10_single'``        |
+---------------------------------------+-------------------------+
| ``P10 Multi``    (1 - 10 µL)          | ``'p10_multi'``         |
+---------------------------------------+-------------------------+
| ``P50 Single``   (5 - 50 µL)          | ``'p50_single'``        |
+---------------------------------------+-------------------------+
| ``P50 Multi``    (5 - 50 µL)          | ``'p50_multi'``         |
+---------------------------------------+-------------------------+
| ``P300 Single``  (30 - 300 µL)        | ``'p300_single'``       |
+---------------------------------------+-------------------------+
| ``P300 Multi``   (30 - 300 µL)        | ``'p300_multi'``        |
+---------------------------------------+-------------------------+
| ``P1000 Single`` (100 - 1000 µL)      | ``'p1000_single'``      |
+---------------------------------------+-------------------------+


GEN2 Pipette Backward Compatibility
===================================

GEN2 pipettes have different volume ranges than GEN1 pipettes. However, each GEN2 pipette covers one or two GEN1 pipette volume ranges. For instance, with  a range of 1 - 20 µL, the P20 Single GEN2 covers the P10 Single GEN1 (1 - 10 µL). If your protocol specifies a GEN1 pipette but you have a GEN2 pipette attached to your OT-2  with a compatible volume range, you can still run your protocol. The OT-2 will consider the GEN2 pipette to have the same minimum volume as the GEN1 pipette, so any advanced commands have the same behavior as before.

Specifically, the P20 GEN2s (single and multi) cover the entire P10 GEN1 range; the P300 Single GEN2 covers the entire P300 Single GEN1 range; and the P1000 Single GEN2 covers the entire P1000 Single GEN1 range.

If you have a P50 Single specified in your protocol, there is no automatic backward compatibility.
If you want to use a GEN2 Pipette, you must change your protocol to load either a P300 Single GEN2
(if you are using volumes between 20 and 50 µL) or a P20 Single GEN2 (if you are using volumes
below 20 µL).

If your protocol specifies a pipette and you attach a compatible
pipette, the protocol will run, and the pipette will act the same as the pipette
specified in your protocol - altering parameters like its minimum volume if
necessary.

For instance, if your protocol specifies a P300
Multi, and you connect a P300 Multi GEN2, the pipette will act like a P300
Multi - it will set its minimum volume to 30 µL.


Adding Tip Racks
================

When you load a pipette, you can optionally specify a list of tip racks you will use to supply the pipette. This is done with the optional parameter ``tip_racks`` to :py:meth:`.ProtocolContext.load_instrument`.
This parameter accepts a *list* of tiprack labware objects, allowing you to specify as many
tipracks as you want. Associating tipracks with your pipette allows for automatic tip tracking
throughout your protocol. This removes the need to specify tip locations in
:py:meth:`.InstrumentContext.pick_up_tip`.

For instance, in this protocol you can see the effects of specifying tipracks:

.. code-block:: python
    :substitutions:

    from opentrons import protocol_api

    metadata = {'apiLevel': '|apiLevel|'}

    def run(protocol: protocol_api.ProtocolContext):
        tiprack_left = protocol.load_labware('opentrons_96_tiprack_300ul', '1')
        tiprack_right = protocol.load_labware('opentrons_96_tiprack_300ul', '2')
        left_pipette = protocol.load_instrument('p300_single', 'left')
        right_pipette = protocol.load_instrument(
            'p300_multi', 'right', tip_racks=[tiprack_right])

        # You must specify the tip location for the left pipette, which was
        # loaded without specifying tip_racks
        left_pipette.pick_up_tip(tiprack_left['A1'])
        left_pipette.drop_tip()

        # And you have to do it every time you call pick_up_tip, doing all
        # your own tip tracking
        left_pipette.pick_up_tip(tiprack_left['A2'])
        left_pipette.drop_tip()
        left_pipette.pick_up_tip(tiprack_left['A3'])
        left_pipette.drop_tip()

        # Since you specified tip_racks when loading the right pipette, it will
        # automatically pick up from A1 of its associated tiprack
        right_pipette.pick_up_tip()
        right_pipette.drop_tip()

        # And further calls to pick_up_tip will automatically progress through
        # the tips in the rack
        right_pipette.pick_up_tip()
        right_pipette.drop_tip()
        right_pipette.pick_up_tip()
        right_pipette.drop_tip()
       

This is further discussed in :ref:`v2-atomic-commands`
and :ref:`v2-complex-commands`.

.. versionadded:: 2.0



.. _new-plunger-flow-rates:

Plunger Flow Rates
==================

Opentrons pipettes aspirate or dispense at different rates. These flow rates can be changed on a loaded
:py:class:`.InstrumentContext` at any time, in units of µL/sec by altering
:py:obj:`.InstrumentContext.flow_rate`. This has the following attributes:

* ``InstrumentContext.flow_rate.aspirate``: The aspirate flow rate, in µL/s
* ``InstrumentContext.flow_rate.dispense``: The dispense flow rate, in µL/s
* ``InstrumentContext.flow_rate.blow_out``: The blow out flow rate, in µL/s

Each of these attributes can be altered without affecting the others.

.. code-block:: python
    :substitutions:

    from opentrons import protocol_api

    metadata = {'apiLevel': '|apiLevel|'}

    def run(protocol: protocol_api.ProtocolContext):
        tiprack = protocol.load_labware('opentrons_96_tiprack_300ul', '1')
        pipette = protocol.load_instrument(
            'p300_single', 'right', tip_racks=[tiprack])
        plate = protocol.load_labware('corning_384_wellplate_112ul_flat', 3)
        pipette.pick_up_tip()

        # Aspirate at the default flowrate of 150 ul/s
        pipette.aspirate(50, plate['A1'])
        # Dispense at the default flowrate of 300 ul/s
        pipette.dispense(50, plate['A1'])

        # Change default aspirate speed to 50ul/s, 1/3 of the default
        pipette.flow_rate.aspirate = 50
        # this aspirate will be at 50ul/s
        pipette.aspirate(50, plate['A1'])
        # this dispense will be the default 300 ul/s
        pipette.dispense(50, plate['A1'])

        # Slow down dispense too
        pipette.flow_rate.dispense = 50
        # This is still at 50 ul/s
        pipette.aspirate(50, plate['A1'])
        # This is now at 50 ul/s as well
        pipette.dispense(50, plate['A1'])

        # Also slow down the blow out flowrate from its default
        pipette.flow_rate.blow_out = 100
        pipette.aspirate(50, plate['A1'])
        # This will be much slower
        pipette.blow_out()

        pipette.drop_tip()


:py:obj:`.InstrumentContext.speed` offers the same functionality, but controlled in
units of mm/s of plunger speed. This does not have a linear transfer to flow rate and
should only be used if you have a specific need.

For other ways of controlling pipette movement, see :ref:`gantry_speed` and :ref:`axis_speed_limits`.

.. versionadded:: 2.0


.. _defaults:

Defaults
--------

**Head Speed**: 400 mm/s

**Well Bottom Clearances**

- Aspirate default: 1mm above the bottom
- Dispense default: 1mm above the bottom

**p20_single_gen2**

- Aspirate Default:
    - On API Version 2.5 and previous: 3.78 µL/s
    - On API Version 2.6 and subsequent: 7.56 µL/s
- Dispense Default:
    - On API Version 2.5 and previous: 3.78 µL/s
    - On API Version 2.6 and subsequent: 7.56 µL/s
- Blow Out Default:
    - On API Version 2.5 and previous: 3.78 µL/s
    - On API Version 2.6 and subsequent: 7.56 µL/s
- Minimum Volume: 1 µL
- Maximum Volume: 20 µL

**p300_single_gen2**

- Aspirate Default:
    - On API Version 2.5 and previous: 46.43 µL/s
    - On API Version 2.6 and subsequent: 92.86 µL/s
- Dispense Default:
    - On API Version 2.5 and previous: 46.43 µL/s
    - On API Version 2.6 and subsequent: 92.86 µL/s
- Blow Out Default:
    - On API Version 2.5 and previous: 46.43 µL/s
    - On API Version 2.6 and subsequent: 92.86 µL/s
- Minimum Volume: 20 µL
- Maximum Volume: 300 µL

**p1000_single_gen2**

- Aspirate Default:
    - On API Version 2.5 and previous: 137.35 µL/s
    - On API Version 2.6 and subsequent: 274.7 µL/s
- Dispense Default:
    - On API Version 2.5 and previous: 137.35 µL/s
    - On API Version 2.6 and subsequent: 274.7 µL/s
- Blow Out Default:
    - On API Version 2.5 and previous: 137.35 µL/s
    - On API Version 2.6 and subsequent: 274.7 µL/s
- Minimum Volume: 100 µL
- Maximum Volume: 1000 µL

**p20_multi_gen2**

- Aspirate Default: 7.6 µL/s
- Dispense Default: 7.6 µL/s
- Blow Out Default: 7.6 µL/s
- Minimum Volume: 1 µL
- Maximum Volume: 20 µL

**p300_multi_gen2**

- Aspirate Default: 94 µL/s
- Dispense Default: 94 µL/s
- Blow Out Default: 94 µL/s
- Minimum Volume: 20 µL
- Maximum Volume: 300 µL

**p10_single**

- Aspirate Default: 5 µL/s
- Dispense Default: 10 µL/s
- Blow Out Default: 1000 µL/s
- Minimum Volume: 1 µL
- Maximum Volume: 10 µL

**p10_multi**

- Aspirate Default: 5 µL/s
- Dispense Default: 10 µL/s
- Blow Out Default: 1000 µL/s
- Minimum Volume: 1 µL
- Maximum Volume: 10 µL

**p50_single**

- Aspirate Default: 25 µL/s
- Dispense Default: 50 µL/s
- Blow Out Default: 1000 µL/s
- Minimum Volume: 5 µL
- Maximum Volume: 50 µL

**p50_multi**

- Aspirate Default: 25 µL/s
- Dispense Default: 50 µL/s
- Blow Out Default: 1000 µL/s
- Minimum Volume: 5 µL
- Maximum Volume: 50 µL

**p300_single**

- Aspirate Default: 150 µL/s
- Dispense Default: 300 µL/s
- Blow Out Default: 1000 µL/s
- Minimum Volume: 30 µL
- Maximum Volume: 300 µL

**p300_multi**

- Aspirate Default: 150 µL/s
- Dispense Default: 300 µL/s
- Blow Out Default: 1000 µL/s
- Minimum Volume: 30 µL
- Maximum Volume: 300 µL

**p1000_single**

- Aspirate Default: 500 µL/s
- Dispense Default: 1000 µL/s
- Blow Out Default: 1000 µL/s
- Minimum Volume: 100 µL
- Maximum Volume: 1000 µL
