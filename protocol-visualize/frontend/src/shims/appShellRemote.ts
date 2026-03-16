import type {
  IPCSafeFormData,
  NotifyResponseData,
  NotifyTopic,
  Remote,
} from '/app/redux/shell/types'

const noop = (): void => {}

export const remote: Remote = {
  ipcRenderer: {
    invoke: async () => undefined,
    send: noop,
    on: noop,
    off: noop,
  },
  getFilePathFrom: async (file: File) => file.name,
}

export async function appShellRequestor<Data>(): Promise<{ data: Data }> {
  throw new Error('appShellRequestor is unavailable in the standalone browser app.')
}

interface CallbackStore {
  [hostname: string]: {
    [topic in NotifyTopic]?: Array<(data: NotifyResponseData) => void>
  }
}

export function appShellListener(): CallbackStore {
  return {}
}

export async function proxyFormData(formData: FormData): Promise<IPCSafeFormData> {
  const result: IPCSafeFormData = []
  for (const [name, value] of formData.entries()) {
    if (value instanceof File) {
      result.push({
        type: 'file',
        name,
        value: await value.arrayBuffer(),
        filename: value.name,
      })
    } else {
      result.push({ type: 'string', name, value })
    }
  }
  return result
}
