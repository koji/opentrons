import { legacy_createStore } from 'redux'

const initialState = {
  config: {
    isOnDevice: false,
  },
}

function reducer(state = initialState): typeof initialState {
  return state
}

export const store = legacy_createStore(reducer)
