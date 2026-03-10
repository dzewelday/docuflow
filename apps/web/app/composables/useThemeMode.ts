type ThemeMode = 'dark' | 'light'

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'dark' || value === 'light'
}

export function useThemeMode() {
  const themeMode = useState<ThemeMode>('theme-mode', () => 'dark')
  const isDark = computed(() => themeMode.value === 'dark')

  function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode
  }

  function toggleThemeMode() {
    setThemeMode(isDark.value ? 'light' : 'dark')
  }

  if (import.meta.client) {
    const initialized = useState('theme-mode-initialized', () => false)
    const synced = useState('theme-mode-synced', () => false)

    if (!initialized.value) {
      initialized.value = true

      const storedTheme = window.localStorage.getItem('docuflow-theme-mode')

      if (isThemeMode(storedTheme)) {
        themeMode.value = storedTheme
      }
    }

    if (!synced.value) {
      synced.value = true

      watch(
        themeMode,
        (value) => {
          document.documentElement.classList.toggle('dark', value === 'dark')
          document.documentElement.style.colorScheme = value
          window.localStorage.setItem('docuflow-theme-mode', value)
        },
        { immediate: true },
      )
    }
  }

  return {
    themeMode,
    isDark,
    setThemeMode,
    toggleThemeMode,
  }
}
