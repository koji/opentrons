import * as React from 'react'
import { action } from '@storybook/addon-actions'
import {
  COLORS,
  PrimaryBtn,
  SPACING,
  StyledText,
  TYPOGRAPHY,
} from '@opentrons/components'
import { Slideout as SlideoutComponent } from './index'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof SlideoutComponent> = {
  title: 'App/Atoms/Slideout',
  component: SlideoutComponent,
  args: {
    onCloseClick: action('clicked'),
  },
}

export default meta

type Story = StoryObj<typeof SlideoutComponent>

const Children = (
  <React.Fragment>
    <StyledText
      fontWeight={TYPOGRAPHY.fontWeightSemiBold}
      fontSize={TYPOGRAPHY.fontSizeP}
      paddingTop={SPACING.spacing4}
    >
      {'this is where the slideout body goes'}
    </StyledText>

    <PrimaryBtn
      backgroundColor={COLORS.blue50}
      marginTop="28rem"
      textTransform={TYPOGRAPHY.textTransformNone}
    >
      <StyledText
        fontWeight={TYPOGRAPHY.fontWeightRegular}
        fontSize={TYPOGRAPHY.fontSizeP}
      >
        {'btn text'}
      </StyledText>
    </PrimaryBtn>
  </React.Fragment>
)

export const Slideout: Story = {
  args: {
    title: 'This is the slideout title with the max width',
    children: Children,
    isExpanded: true,
  },
}
