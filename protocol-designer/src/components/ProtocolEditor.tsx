import * as React from 'react'
import cx from 'classnames'
import { DragDropContext } from 'react-dnd'
import MouseBackEnd from 'react-dnd-mouse-backend'
import { ComputingSpinner } from '../components/ComputingSpinner'
import { ConnectedNav } from '../containers/ConnectedNav'
import { ConnectedSidebar } from '../containers/ConnectedSidebar'
import { ConnectedTitleBar } from '../containers/ConnectedTitleBar'
import { ConnectedMainPanel } from '../containers/ConnectedMainPanel'
import { PortalRoot as MainPageModalPortalRoot } from '../components/portals/MainPageModalPortal'
import { MAIN_CONTENT_FORCED_SCROLL_CLASSNAME } from '../ui/steps/utils'
import { PrereleaseModeIndicator } from './PrereleaseModeIndicator'
import { PortalRoot as TopPortalRoot } from './portals/TopPortal'
import { FileUploadMessageModal } from './modals/FileUploadMessageModal'
import { LabwareUploadMessageModal } from './modals/LabwareUploadMessageModal'
import { GateModal } from './modals/GateModal'
import { AnnouncementModal } from './modals/AnnouncementModal'
import styles from './ProtocolEditor.css'
import { CreateFileWizard } from './modals/CreateFileWizard'

const showGateModal =
  process.env.NODE_ENV === 'production' || process.env.OT_PD_SHOW_GATE

function ProtocolEditorComponent(): JSX.Element {
  return (
    <div>
      <ComputingSpinner />
      <TopPortalRoot />
      {showGateModal ? <GateModal /> : null}
      <PrereleaseModeIndicator />
      <div className={styles.wrapper}>
        <ConnectedNav />
        <ConnectedSidebar />
        <div className={styles.main_page_wrapper}>
          <ConnectedTitleBar />

          <div
            id="main-page"
            className={cx(
              styles.main_page_content,
              MAIN_CONTENT_FORCED_SCROLL_CLASSNAME
            )}
          >
            <AnnouncementModal />
            <CreateFileWizard />
            <FileUploadMessageModal />

            <MainPageModalPortalRoot />
            <LabwareUploadMessageModal />
            <ConnectedMainPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

export const ProtocolEditor = DragDropContext(MouseBackEnd)(
  ProtocolEditorComponent
)
