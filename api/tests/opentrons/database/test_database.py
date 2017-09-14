from opentrons.containers import load as containers_load
from opentrons.containers.placeable import Well, Container
from opentrons.data_storage import database
from opentrons.instruments import Pipette
from opentrons.util.testing.util import build_temp_db, approx
from opentrons.util.vector import Vector

EXPECTED_CONTAINER_COORDS = {
    'tube-rack-5ml-96': (0.00, 0.00, 0.00),
    'wheaton_vial_rack': (9.00, 9.00, 0.00),
    '6-well-plate': (23.16, 24.76, 0.00),
    '10ml_tip_rack': (0.00, 0.00, 0.00),
    '24-well-plate': (13.67, 15.00, 0.00),
    'tiprack-1000ul-H': (11.24, 14.34, 0.00),
    'trough-1row-25ml': (0.00, 0.00, 0.00),
    '96-deep-well': (11.24, 14.34, 0.00),
    'PCR-strip-tall': (11.24, 14.34, 0.00),
    'tube-rack-2ml': (13.00, 16.00, 0.00),
    'T25-flask': (42.75, 63.88, 0.00),
    'tube-rack-15_50ml': (11.00, 19.00, 0.00),
    '5ml-3x4': (18.00, 19.00, 0.00),
    '96-PCR-flat': (11.24, 14.34, 0.00),
    'tube-rack-80well': (0.00, 0.00, 0.00),
    '96-PCR-tall': (11.24, 14.34, 0.00),
    '384-plate': (9.00, 12.13, 0.00),
    'small_vial_rack_16x45': (0.00, 0.00, 0.00),
    '12-well-plate': (16.79, 24.94, 0.00),
    'tiprack-1000ul-chem': (0.00, 0.00, 0.00),
    'rigaku-compact-crystallization-plate': (9.00, 11.00, 0.00),
    '48-well-plate': (10.08, 18.16, 0.00),
    '96-flat': (11.24, 14.34, 0.00),
    'tube-rack-.75ml': (13.50, 15.00, 0.00),
    'trough-12row': (42.75, 14.34, 0.00),
    'tiprack-c250ul': (0.00, 0.00, 0.00),
    'hampton-1ml-deep-block': (11.24, 14.34, 0.00),
    'point': (0.00, 0.00, 0.00),
    '96-well-plate-20mm': (11.24, 14.34, 0.00),
    'trough-12row-short': (42.75, 14.34, 0.00),
    '24-vial-rack': (13.67, 16.00, 0.00),
    'trash-box': (42.75, 63.88, 0.00),
    'tiprack-1000ul': (11.24, 14.34, 0.00),
    '50ml_rack': (0.00, 0.00, 0.00),
    'tiprack-10ul-H': (11.24, 14.34, 0.00),
    '48-vial-plate': (10.50, 18.00, 0.00),
    'tube-rack-2ml-9x9': (0.00, 0.00, 0.00),
    'alum-block-pcr-strips': (0.00, 0.00, 0.00),
    'tiprack-200ul': (11.24, 14.34, 0.00),
    'MALDI-plate': (9.00, 12.00, 0.00),
    'tiprack-10ul': (11.24, 14.34, 0.00),
    'T75-flask': (42.75, 63.88, 0.00),
    'e-gelgol': (11.24, 14.34, 0.00)
}


def test_container_from_container_load(robot, tmpdir):
    build_temp_db(tmpdir)
    plate = containers_load(robot, '96-flat', 'A1')
    assert plate.get_type() == '96-flat'
    assert plate._coordinates == Vector(11.24, 14.34, 0.00)


def test_well_from_container_load(robot):
    plate = containers_load(robot, '96-flat', 'A1')
    assert plate[3].top()[1] == Vector(3.20, 3.20, 10.50)
    assert plate[3].properties == {'depth': 10.5,
                                   'total-liquid-volume': 400,
                                   'diameter': 6.4,
                                   'height': 10.5,
                                   'width': 6.4,
                                   'length': 6.4}


def test_container_parse(robot):
    plate = containers_load(robot, '96-flat', 'A1')
    assert database._parse_container_obj(plate) == Vector(11.24, 14.34, 0.00)


def test_well_parse(robot):
    plate = containers_load(robot, '96-flat', 'A1')
    assert database._parse_well_obj(plate[18]) == (
        'C3', 18.0, 18.0, 0.0, 10.5, 400, 6.4, 6.4, 6.4
    )
    assert database._parse_well_obj(plate[45]) == (
        'F6', 45.0, 45.0, 0.0, 10.5, 400, 6.4, 6.4, 6.4
    )


def test_load_all_containers(tmpdir):
    build_temp_db(tmpdir)

    containers = [database.load_container(container_name)
                  for container_name in database.list_all_containers()]
    containers_and_coords = \
        {container.get_type(): approx(container._coordinates)
         for container in containers}

    assert containers_and_coords == {
        k: approx(v) for k, v in EXPECTED_CONTAINER_COORDS.items()
    }


def test_calibrate_container(robot, tmpdir):
    build_temp_db(tmpdir)

    pt = robot.pose_tracker
    plate1 = containers_load(robot, '96-flat', 'A1')
    plate2 = containers_load(robot, '96-flat', 'B1')
    assert approx(pt[plate1].position) == approx((21.24, 24.34, 0.00))
    assert approx(pt[plate2].position) == approx((112.24, 24.34, 0.00))
    assert plate1._coordinates == Vector(11.24, 14.34, 0.00)
    assert plate2._coordinates == Vector(11.24, 14.34, 0.00)

    p200 = Pipette(robot, 'a')
    robot.move_head(x=100, y=150, z=5)
    robot.calibrate_container_with_instrument(plate1, p200, True)
    assert plate1._coordinates == Vector(90.00, 140.00, 5.00)
    assert plate2._coordinates == Vector(11.24, 14.34, 0.00)
    plate2 = containers_load(robot, '96-flat', 'C1')
    assert plate2._coordinates == Vector(90.00, 140.00, 5.00)


def test_load_persisted_container(tmpdir):
    build_temp_db(tmpdir)
    plate = database.load_container("24-vial-rack")
    assert isinstance(plate, Container)
    assert isinstance(plate, Container)
    assert all([isinstance(w, Well) for w in plate])

    assert plate[0].coordinates() == (5.86, 8.19, 0)
    assert plate[1].coordinates() == (5.86, 27.49, 0)


def test_load_all_persisted_containers(tmpdir):
    build_temp_db(tmpdir)
    assert len(database.list_all_containers()) == 43
