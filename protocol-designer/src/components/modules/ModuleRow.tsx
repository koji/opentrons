import * as React from 'react'
import { useDispatch } from 'react-redux'
import upperFirst from 'lodash/upperFirst'
import {
  LabeledValue,
  OutlineButton,
  SlotMap,
  Tooltip,
  useHoverTooltip,
  ModuleIcon,
  C_DARK_GRAY,
  SIZE_1,
  SPACING,
} from '@opentrons/components'
import {
  FLEX_ROBOT_TYPE,
  THERMOCYCLER_MODULE_TYPE,
} from '@opentrons/shared-data'
import { i18n } from '../../localization'
import { actions as stepFormActions, ModuleOnDeck } from '../../step-forms'
import {
  SPAN7_8_10_11_SLOT,
  DEFAULT_MODEL_FOR_MODULE_TYPE,
} from '../../constants'
import { ModuleDiagram } from './ModuleDiagram'
import { isModuleWithCollisionIssue } from './utils'
import styles from './styles.css'

import type { ModuleType, RobotType } from '@opentrons/shared-data'

interface Props {
  robotType?: RobotType
  moduleOnDeck?: ModuleOnDeck
  showCollisionWarnings?: boolean
  type: ModuleType
  openEditModuleModal: (moduleType: ModuleType, moduleId?: string) => unknown
}

export function ModuleRow(props: Props): JSX.Element {
  const {
    moduleOnDeck,
    openEditModuleModal,
    showCollisionWarnings,
    robotType,
  } = props
  const type: ModuleType = moduleOnDeck?.type || props.type
  const isFlex = robotType === FLEX_ROBOT_TYPE

  const model = moduleOnDeck?.model
  const slot = moduleOnDeck?.slot
  /*
  TODO (ka 2020-2-3): This logic is very specific to this individual implementation
  of SlotMap. Kept it here (for now?) because it spells out the different cases.
  */
  let slotDisplayName = null
  let occupiedSlotsForMap: string[] = []
  let collisionSlots: string[] = []
  const moduleHasCollisionIssue = model
    ? isModuleWithCollisionIssue(model)
    : false
  // Populate warnings are enabled (crashable pipette in protocol + !disable module restrictions)
  if (showCollisionWarnings && moduleHasCollisionIssue && slot === '1') {
    collisionSlots = ['4']
  } else if (showCollisionWarnings && moduleHasCollisionIssue && slot === '3') {
    collisionSlots = ['6']
  }

  // If this module is in a deck slot + is not TC spanning Slot
  // add to occupiedSlots
  if (slot && slot !== SPAN7_8_10_11_SLOT) {
    slotDisplayName = `Slot ${slot}`
    occupiedSlotsForMap = [slot]
  }
  // If this Module is a TC deck slot and spanning
  // populate all 4 slots individually
  if (slot === SPAN7_8_10_11_SLOT) {
    slotDisplayName = 'Slot 7'
    occupiedSlotsForMap = ['7', '8', '10', '11']
    //  TC on Flex
  } else if (isFlex && type === THERMOCYCLER_MODULE_TYPE && slot === 'B1') {
    occupiedSlotsForMap = ['A1', 'B1']
  }
  // If collisionSlots are populated, check which slot is occupied
  // and render module specific crash warning. This logic assumes
  // default module slot placement magnet = Slot1 temperature = Slot3
  let collisionTooltipText = null
  if (collisionSlots && collisionSlots.includes('4')) {
    collisionTooltipText = i18n.t(
      `tooltip.edit_module_card.magnetic_module_collision`
    )
  } else if (collisionSlots && collisionSlots.includes('6')) {
    collisionTooltipText = i18n.t(
      `tooltip.edit_module_card.temperature_module_collision`
    )
  }

  const collisionTooltip = collisionTooltipText && (
    <div className={styles.collision_tolltip}>{collisionTooltipText}</div>
  )

  const setCurrentModule = (moduleType: ModuleType, moduleId?: string) => () =>
    openEditModuleModal(moduleType, moduleId)

  const addRemoveText = moduleOnDeck ? 'remove' : 'add'

  const dispatch = useDispatch()

  const handleAddOrRemove = moduleOnDeck
    ? () => dispatch(stepFormActions.deleteModule(moduleOnDeck.id))
    : setCurrentModule(type)

  const handleEditModule =
    moduleOnDeck && setCurrentModule(type, moduleOnDeck.id)

  const [targetProps, tooltipProps] = useHoverTooltip({
    placement: 'bottom',
  })

  return (
    <div>
      <h4 className={styles.row_title}>
        <ModuleIcon
          moduleType={type}
          size={SIZE_1}
          color={C_DARK_GRAY}
          marginRight={SPACING.spacing4}
        />
        {i18n.t(`modules.module_display_names.${type}`)}
      </h4>
      <div className={styles.module_row}>
        <div className={styles.module_diagram_container}>
          <ModuleDiagram
            type={type}
            model={model || DEFAULT_MODEL_FOR_MODULE_TYPE[type]}
          />
        </div>
        <div className={styles.module_col}>
          {model && (
            <LabeledValue
              label="Model"
              value={i18n.t(`modules.model_display_name.${model}`)}
            />
          )}
        </div>
        <div className={styles.module_col}>
          {slot && <LabeledValue label="Position" value={slotDisplayName} />}
        </div>
        <div className={styles.slot_map}>
          {collisionSlots.length > 0 && (
            <Tooltip {...tooltipProps}>{collisionTooltip}</Tooltip>
          )}
          {slot && (
            <div {...targetProps}>
              <SlotMap
                occupiedSlots={occupiedSlotsForMap}
                collisionSlots={collisionSlots}
                robotType={robotType}
              />
            </div>
          )}
        </div>
        <div className={styles.modules_button_group}>
          {moduleOnDeck && (
            <OutlineButton
              className={styles.module_button}
              onClick={handleEditModule}
              name={`edit${upperFirst(type)}`}
            >
              Edit
            </OutlineButton>
          )}
          <OutlineButton
            className={styles.module_button}
            onClick={handleAddOrRemove}
            name={`${addRemoveText}${upperFirst(type)}`}
          >
            {addRemoveText}
          </OutlineButton>
        </div>
      </div>
    </div>
  )
}
