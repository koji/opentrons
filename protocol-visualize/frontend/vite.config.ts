import path from 'path'
import react from '@vitejs/plugin-react'
import lostCss from 'lost'
import postCssApply from 'postcss-apply'
import postColorModFunction from 'postcss-color-mod-function'
import postCssImport from 'postcss-import'
import postCssPresetEnv from 'postcss-preset-env'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  plugins: [
    react({
      include: '**/*.tsx',
      babel: {
        configFile: true,
      },
    }),
  ],
  css: {
    postcss: {
      plugins: [
        postCssImport({ root: 'src/' }),
        postCssApply(),
        postColorModFunction(),
        postCssPresetEnv({ stage: 0 }),
        lostCss(),
      ],
    },
  },
  define: {
    global: 'globalThis',
    _PKG_VERSION_: JSON.stringify('protocol-visualizer-dev'),
    _OPENTRONS_PROJECT_: JSON.stringify('protocol-visualizer'),
    _OT_SENTRY_DSN_: JSON.stringify(null),
    _OT_APP_MIXPANEL_ID_: JSON.stringify(''),
    _OT_LL_MIXPANEL_DEV_ID_: JSON.stringify(''),
    _OT_LL_MIXPANEL_ID_: JSON.stringify(''),
    _NODE_ENV_: JSON.stringify(process.env.NODE_ENV ?? 'development'),
    'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
  },
  resolve: {
    alias: {
      '/app/redux/shell/remote': path.resolve(
        __dirname,
        './src/shims/appShellRemote.ts'
      ),
      '@opentrons/components/styles/global': path.resolve(
        __dirname,
        '../../components/src/styles/global.css'
      ),
      '@opentrons/components/styles': path.resolve(
        __dirname,
        '../../components/src/index.module.css'
      ),
      '@opentrons/components': path.resolve(
        __dirname,
        '../../components/src/index.ts'
      ),
      '@opentrons/shared-data': path.resolve(
        __dirname,
        '../../shared-data/js/index.ts'
      ),
      '@opentrons/step-generation': path.resolve(
        __dirname,
        '../../step-generation/src/index.ts'
      ),
      '@opentrons/labware-library': path.resolve(
        __dirname,
        '../../labware-library/src/labware-creator'
      ),
      '@opentrons/react-api-client': path.resolve(
        __dirname,
        '../../react-api-client/src/index.ts'
      ),
      '/app/': path.resolve(__dirname, '../../app/src') + '/',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
