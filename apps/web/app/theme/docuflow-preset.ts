import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const docuFlowPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{amber.50}',
      100: '{amber.100}',
      200: '{amber.200}',
      300: '{amber.300}',
      400: '{amber.400}',
      500: '{amber.500}',
      600: '{amber.600}',
      700: '{amber.700}',
      800: '{amber.800}',
      900: '{amber.900}',
      950: '{amber.950}',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#fbfaf7',
          100: '#f6f2ea',
          200: '#e8dfd0',
          300: '#d8c9b1',
          400: '#b9a98f',
          500: '#8d7c6b',
          600: '#6f6155',
          700: '#544b43',
          800: '#342e2b',
          900: '#1e1b1a',
          950: '#131111',
        },
        primary: {
          color: '{amber.500}',
          contrastColor: '#1b150f',
          hoverColor: '{amber.400}',
          activeColor: '{amber.300}',
        },
        highlight: {
          background: 'color-mix(in srgb, {amber.500}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {amber.400}, transparent 80%)',
          color: '#3b2a11',
          focusColor: '#25190a',
        },
        formField: {
          background: 'rgba(255,255,255,0.68)',
          disabledBackground: 'rgba(232,223,208,0.5)',
          filledBackground: 'rgba(255,255,255,0.82)',
          filledHoverBackground: 'rgba(255,255,255,0.9)',
          filledFocusBackground: 'rgba(255,255,255,0.96)',
          borderColor: 'rgba(143, 120, 90, 0.18)',
          hoverBorderColor: 'rgba(217, 119, 6, 0.42)',
          focusBorderColor: 'rgba(217, 119, 6, 0.68)',
          invalidBorderColor: 'rgba(220, 38, 38, 0.58)',
          color: '#211d1b',
          disabledColor: 'rgba(84, 75, 67, 0.72)',
          placeholderColor: 'rgba(84, 75, 67, 0.72)',
          invalidPlaceholderColor: '#b91c1c',
          floatLabelColor: 'rgba(84, 75, 67, 0.72)',
          floatLabelFocusColor: '#7c2d12',
          floatLabelActiveColor: 'rgba(84, 75, 67, 0.72)',
          iconColor: 'rgba(84, 75, 67, 0.72)',
          shadow: '0 20px 60px rgba(161, 98, 7, 0.08)',
        },
        text: {
          color: '#211d1b',
          hoverColor: '#120f0e',
          mutedColor: 'rgba(84, 75, 67, 0.78)',
          hoverMutedColor: '#544b43',
        },
        content: {
          background: 'rgba(255,255,255,0.68)',
          hoverBackground: 'rgba(255,255,255,0.88)',
          borderColor: 'rgba(143, 120, 90, 0.14)',
          color: '{text.color}',
          hoverColor: '{text.hover.color}',
        },
        overlay: {
          select: {
            background: 'rgba(255,255,255,0.92)',
            borderColor: 'rgba(143, 120, 90, 0.16)',
            color: '{text.color}',
          },
          popover: {
            background: 'rgba(255,255,255,0.92)',
            borderColor: 'rgba(143, 120, 90, 0.16)',
            color: '{text.color}',
          },
          modal: {
            background: 'rgba(255,255,255,0.9)',
            borderColor: 'rgba(143, 120, 90, 0.16)',
            color: '{text.color}',
          },
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f6f4f1',
          100: '#ece6dd',
          200: '#d9d0c4',
          300: '#b3a799',
          400: '#8f8171',
          500: '#6d6155',
          600: '#51473f',
          700: '#382f2a',
          800: '#201a18',
          900: '#141111',
          950: '#090808',
        },
        primary: {
          color: '{amber.400}',
          contrastColor: '#120f0c',
          hoverColor: '{amber.300}',
          activeColor: '{amber.200}',
        },
        highlight: {
          background: 'color-mix(in srgb, {amber.400}, transparent 78%)',
          focusBackground: 'color-mix(in srgb, {amber.300}, transparent 72%)',
          color: 'rgba(255,255,255,0.92)',
          focusColor: 'rgba(255,255,255,0.96)',
        },
        formField: {
          background: 'rgba(10,10,10,0.58)',
          disabledBackground: 'rgba(32,26,24,0.82)',
          filledBackground: 'rgba(20,17,17,0.72)',
          filledHoverBackground: 'rgba(20,17,17,0.82)',
          filledFocusBackground: 'rgba(20,17,17,0.92)',
          borderColor: 'rgba(255,255,255,0.12)',
          hoverBorderColor: 'rgba(251, 191, 36, 0.38)',
          focusBorderColor: 'rgba(251, 191, 36, 0.55)',
          invalidBorderColor: 'rgba(252, 165, 165, 0.62)',
          color: 'rgba(255,255,255,0.92)',
          disabledColor: 'rgba(255,255,255,0.52)',
          placeholderColor: 'rgba(255,255,255,0.52)',
          invalidPlaceholderColor: '#fca5a5',
          floatLabelColor: 'rgba(255,255,255,0.56)',
          floatLabelFocusColor: '{primary.color}',
          floatLabelActiveColor: 'rgba(255,255,255,0.56)',
          iconColor: 'rgba(255,255,255,0.56)',
          shadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
        },
        text: {
          color: 'rgba(255,255,255,0.92)',
          hoverColor: '#ffffff',
          mutedColor: 'rgba(255,255,255,0.58)',
          hoverMutedColor: 'rgba(255,255,255,0.74)',
        },
        content: {
          background: 'rgba(15,17,22,0.66)',
          hoverBackground: 'rgba(20,22,28,0.78)',
          borderColor: 'rgba(255,255,255,0.1)',
          color: '{text.color}',
          hoverColor: '{text.hover.color}',
        },
        overlay: {
          select: {
            background: 'rgba(16,18,24,0.94)',
            borderColor: 'rgba(255,255,255,0.1)',
            color: '{text.color}',
          },
          popover: {
            background: 'rgba(16,18,24,0.94)',
            borderColor: 'rgba(255,255,255,0.1)',
            color: '{text.color}',
          },
          modal: {
            background: 'rgba(16,18,24,0.94)',
            borderColor: 'rgba(255,255,255,0.1)',
            color: '{text.color}',
          },
        },
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: '999px',
        label: {
          fontWeight: '700',
        },
      },
    },
    card: {
      root: {
        borderRadius: '1.75rem',
      },
      body: {
        padding: '1.5rem',
      },
    },
    message: {
      root: {
        borderRadius: '1.25rem',
      },
    },
  },
})

export default docuFlowPreset
