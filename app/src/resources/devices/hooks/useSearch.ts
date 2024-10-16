import { useState, useMemo } from 'react'
import { getProtocolDisplayName } from '/app/transformations/protocols'

import type { Robot } from '/app/redux/discovery/types'
import type { StoredProtocolData } from '/app/redux/protocol-storage'

export interface UseSearchResult {
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  filteredData: Robot[] | StoredProtocolData[]
  type?: 'device' | 'protocol'
}

export const useSearch = (
  inputData: Robot[] | StoredProtocolData[],
  initialSearchTerm: string = '',
  type = 'device'
): UseSearchResult => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)

  const filteredData = useMemo(() => {
    if (searchTerm === '' || searchTerm.length === 0) return inputData
    if (type === 'device') {
      const robots = inputData as Robot[]
      return robots.filter(robot =>
        robot.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } else {
      const protocols = inputData as StoredProtocolData[]
      return protocols.filter(protocol => {
        const { protocolKey, srcFileNames, mostRecentAnalysis } = protocol
        const protocolName = getProtocolDisplayName(
          protocolKey,
          srcFileNames,
          mostRecentAnalysis
        )
        return protocolName.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }
  }, [inputData, searchTerm, type])

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  }
}
