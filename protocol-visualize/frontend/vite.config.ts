import path from 'path'
import react from '@vitejs/plugin-react'
import lostCss from 'lost'
import postCssApply from 'postcss-apply'
import postColorModFunction from 'postcss-color-mod-function'
import postCssImport from 'postcss-import'
import postCssPresetEnv from 'postcss-preset-env'
import { defineConfig } from 'vite'

const SHELL_REMOTE_REAL = path.resolve(__dirname, '../../app/src/redux/shell/remote')
const SHELL_REMOTE_SHIM = path.resolve(__dirname, './src/shims/appShellRemote.ts')

const shimShellRemotePlugin = {
  name: 'shim-shell-remote',
  enforce: 'pre' as const,
  // resolveId runs before Vite resolves the path; handles alias-style ids.
  resolveId(id: string, importer: string | undefined): string | undefined {
    if (id.includes('/shell/remote')) {
      return SHELL_REMOTE_SHIM
    }
    if (importer != null && id.startsWith('.')) {
      const resolved = path.resolve(path.dirname(importer), id)
      if (resolved === SHELL_REMOTE_REAL || resolved === SHELL_REMOTE_REAL + '.ts') {
        return SHELL_REMOTE_SHIM
      }
    }
    return undefined
  },
  // load runs after Vite resolves the path; catches any remaining cases where
  // Vite resolved the import directly to the real remote.ts on disk.
  load(id: string): string | undefined {
    if (id === SHELL_REMOTE_REAL + '.ts' || id === SHELL_REMOTE_REAL) {
      return `export * from '${SHELL_REMOTE_SHIM}'`
    }
    return undefined
  },
}

export default defineConfig({
  base: '',
  plugins: [
    shimShellRemotePlugin,
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
    alias: [
      {
        find: '@opentrons/components/styles/global',
        replacement: path.resolve(
          __dirname,
          '../../components/src/styles/global.css'
        ),
      },
      {
        find: '@opentrons/components/styles',
        replacement: path.resolve(
          __dirname,
          '../../components/src/index.module.css'
        ),
      },
      {
        find: '@opentrons/components',
        replacement: path.resolve(__dirname, '../../components/src/index.ts'),
      },
      {
        find: '@opentrons/shared-data',
        replacement: path.resolve(__dirname, '../../shared-data/js/index.ts'),
      },
      {
        find: '@opentrons/step-generation',
        replacement: path.resolve(
          __dirname,
          '../../step-generation/src/index.ts'
        ),
      },
      {
        find: '@opentrons/labware-library',
        replacement: path.resolve(
          __dirname,
          '../../labware-library/src/labware-creator'
        ),
      },
      {
        find: '@opentrons/react-api-client',
        replacement: path.resolve(
          __dirname,
          '../../react-api-client/src/index.ts'
        ),
      },
      {
        find: /^\/app\//,
        replacement: path.resolve(__dirname, '../../app/src') + '/',
      },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
