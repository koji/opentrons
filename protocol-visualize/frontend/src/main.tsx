import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'

import '@fontsource/public-sans'
import '@opentrons/components/styles/global'
import { ApiClientProvider } from '@opentrons/react-api-client'

import { i18n } from '/app/i18n'

import { App } from './App'
import { store } from './store'
import './styles.css'

;(globalThis as typeof globalThis & {
  APP_SHELL_REMOTE?: {
    ipcRenderer: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
      send: (channel: string, ...args: unknown[]) => void
      on: (channel: string, listener: (...args: unknown[]) => void) => void
      off: (channel: string, listener: (...args: unknown[]) => void) => void
    }
    getFilePathFrom: (file: File) => Promise<string>
  }
}).APP_SHELL_REMOTE ??= {
  ipcRenderer: {
    invoke: async () => undefined,
    send: () => {},
    on: () => {},
    off: () => {},
  },
  getFilePathFrom: async (file: File) => file.name,
}

const container = document.getElementById('root')

if (container == null) {
  throw new Error('Failed to find root element')
}

ReactDOM.createRoot(container).render(
  <Provider store={store}>
    <ApiClientProvider>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </I18nextProvider>
    </ApiClientProvider>
  </Provider>
)
