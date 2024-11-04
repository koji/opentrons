import { useTranslation } from 'react-i18next'
import { InputField, Flex, SPACING } from '@opentrons/components'

interface SearchComponentProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  type: 'device' | 'protocol'
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
  searchTerm,
  setSearchTerm,
  type,
}) => {
  const { t } = useTranslation('shared')

  return (
    <Flex paddingY={SPACING.spacing8}>
      <InputField
        value={searchTerm}
        onChange={(e: any) => {
          setSearchTerm(e.target.value as string)
        }}
        placeholder={
          type === 'device' ? t('search_robots') : t('search_protocols')
        }
        //   marginY={SPACING.spacing8}
      />
    </Flex>
  )
}
