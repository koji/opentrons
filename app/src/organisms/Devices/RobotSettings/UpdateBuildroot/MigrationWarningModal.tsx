import * as React from 'react'

import { AlertModal } from '@opentrons/components'
import { UPGRADE } from '../../../../redux/robot-update'
import styles from './styles.css'

import type { ButtonProps } from '@opentrons/components'
import type { RobotUpdateType } from '../../../../redux/robot-update/types'

export interface MigrationWarningModalProps {
  notNowButton: ButtonProps
  updateType: RobotUpdateType | null
  proceed: () => unknown
}

type MaybeButtonProps = ButtonProps | null | undefined

const HEADING = 'Robot Operating System Update Available'

export function MigrationWarningModal(
  props: MigrationWarningModalProps
): JSX.Element {
  const { notNowButton, updateType, proceed } = props

  const buttons: MaybeButtonProps[] = [
    notNowButton,
    {
      children: updateType === UPGRADE ? 'view robot update' : 'update robot',
      className: styles.view_update_button,
      onClick: proceed,
    },
  ]

  return (
    <AlertModal
      heading={HEADING}
      buttons={buttons}
      restrictOuterScroll={false}
      alertOverlay
    >
      <div className={styles.system_update_modal}>
        <p className={styles.system_update_warning}>
          This update is a little different than previous updates.
        </p>

        <p>
          In addition to delivering new features, this update changes the
          robot’s operating system to improve robot stability and support.
        </p>

        <p>
          Please note that this update will take up to 10 minutes, will reboot
          your robot two times, and requires your OT-2 to remain discoverable
          via USB or Wi-Fi throughout the entire migration process.
        </p>
      </div>
    </AlertModal>
  )
}
