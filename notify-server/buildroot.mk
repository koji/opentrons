################################################################################
#
# python-opentrons-notify-server
#
################################################################################

PYTHON_OPENTRONS_NOTIFY_SERVER_DEPENDENCIES = host-python-poetry

define PYTHON_OPENTRONS_NOTIFY_SERVER_get_version
	$(strip $(shell poetry version -s))
endef

define PYTHON_OPENTRONS_NOTIFY_SERVER_build_sdist
	$(shell poetry build --format sdist)
endef

PYTHON_OPENTRONS_NOTIFY_SERVER_VERSION = $(call PYTHON_OPENTRONS_NOTIFY_SERVER_get_version)
PYTHON_OPENTRONS_NOTIFY_SERVER_LICENSE = Apache-2.0
PYTHON_OPENTRONS_NOTIFY_SERVER_LICENSE_FILES = $(BR2_EXTERNAL_OPENTRONS_MONOREPO_PATH)/LICENSE
PYTHON_OPENTRONS_NOTIFY_SERVER_SETUP_TYPE = setuptools
PYTHON_OPENTRONS_NOTIFY_SERVER_SITE_METHOD = file
PYTHON_OPENTRONS_NOTIFY_SERVER_SITE = $(BR2_EXTERNAL_OPENTRONS_MONOREPO_PATH)/notify-server/dist
PYTHON_OPENTRONS_NOTIFY_SERVER_SOURCE = notify_server-$(PYTHON_OPENTRONS_NOTIFY_SERVER_VERSION).tar.gz
PYTHON_OPENTRONS_NOTIFY_SERVER_PRE_DOWNLOAD_HOOKS = PYTHON_OPENTRONS_NOTIFY_SERVER_build_sdist
PYTHON_OPENTRONS_NOTIFY_SERVER_POST_INSTALL_TARGET_HOOKS = PYTHON_OPENTRONS_NOTIFY_SERVER_INSTALL_VERSION
PYTHON_OPENTRONS_NOTIFY_SERVER_SERVICE_FILE_NAME = opentrons-notify-server.service

define OTNOTIFYSERVER_DUMP_BR_VERSION
	$(shell python $(BR2_EXTERNAL_OPENTRONS_MONOREPO_PATH)/scripts/python_build_utils.py notify-server dump_br_version)
endef

define PYTHON_OPENTRONS_NOTIFY_SERVER_INSTALL_VERSION
	echo '$(call OTNOTIFYSERVER_DUMP_BR_VERSION)' > $(BINARIES_DIR)/opentrons-notify-server-version.json
endef

ot_notify_server_name := python-opentrons-notify-server

define PYTHON_OPENTRONS_NOTIFY_SERVER_INSTALL_INIT_SYSTEMD
	$(INSTALL) -D -m 0644 $(BR2_EXTERNAL_OPENTRONS_MONOREPO_PATH)/notify-server/$(PYTHON_OPENTRONS_NOTIFY_SERVER_SERVICE_FILE_NAME) \
	  $(TARGET_DIR)/etc/systemd/system/$(PYTHON_OPENTRONS_NOTIFY_SERVER_SERVICE_FILE_NAME)

  mkdir -p $(TARGET_DIR)/etc/systemd/system/opentrons.target.wants

  ln -sf ../$(PYTHON_OPENTRONS_NOTIFY_SERVER_SERVICE_FILE_NAME) \
    $(TARGET_DIR)/etc/systemd/system/opentrons.target.wants/$(PYTHON_OPENTRONS_NOTIFY_SERVER_SERVICE_FILE_NAME)
endef

# Calling inner-python-package directly instead of using python-package macro
# because our directory layout doesn’t conform to buildroot’s expectation of
# having the directory name be the package name
$(eval $(call inner-python-package,$(ot_notify_server_name),$(call UPPERCASE,$(ot_notify_server_name)),$(call UPPERCASE,$(ot_notify_server_name)),target))
