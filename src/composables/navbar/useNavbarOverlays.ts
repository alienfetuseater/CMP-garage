import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type MobileMenuView = 'menu' | 'messages' | 'reminders' | 'tickets'

export function useNavbarOverlays() {
  const showMessagesPopup = ref(false)
  const showNotifications = ref(false)
  const showTicketsPopup = ref(false)
  const showMobileMenu = ref(false)
  const mobileMenuView = ref<MobileMenuView>('menu')

  const messageWrapRef = ref<HTMLElement | null>(null)
  const reminderWrapRef = ref<HTMLElement | null>(null)
  const ticketWrapRef = ref<HTMLElement | null>(null)
  const mobileMenuWrapRef = ref<HTMLElement | null>(null)

  const mobileMenuTitle = computed(() => {
    if (mobileMenuView.value === 'messages') return 'Team Messages'
    if (mobileMenuView.value === 'reminders') return 'Open Reminders'
    if (mobileMenuView.value === 'tickets') return 'Open Tickets'
    return 'Menu'
  })

  function closeAllPopups() {
    showMessagesPopup.value = false
    showNotifications.value = false
    showTicketsPopup.value = false
  }

  function closeMobileMenu() {
    showMobileMenu.value = false
    mobileMenuView.value = 'menu'
  }

  function toggleReminderPopup() {
    showMobileMenu.value = false
    const nextState = !showNotifications.value
    showMessagesPopup.value = false
    showTicketsPopup.value = false
    showNotifications.value = nextState
  }

  function toggleMessagePopup() {
    showMobileMenu.value = false
    const nextState = !showMessagesPopup.value
    showNotifications.value = false
    showTicketsPopup.value = false
    showMessagesPopup.value = nextState
  }

  function toggleTicketPopup() {
    showMobileMenu.value = false
    const nextState = !showTicketsPopup.value
    showMessagesPopup.value = false
    showNotifications.value = false
    showTicketsPopup.value = nextState
  }

  function toggleMobileMenu() {
    const nextState = !showMobileMenu.value
    closeAllPopups()
    mobileMenuView.value = 'menu'
    showMobileMenu.value = nextState
  }

  function openMobileMenuPanel(panel: MobileMenuView) {
    closeAllPopups()
    showMobileMenu.value = true
    mobileMenuView.value = panel
  }

  function closeMessagePopup() {
    showMessagesPopup.value = false
  }

  function closeReminderPopup() {
    showNotifications.value = false
  }

  function closeTicketPopup() {
    showTicketsPopup.value = false
  }

  function onDocumentClick(event: MouseEvent) {
    const targetNode = event.target as Node | null
    if (!targetNode) return

    const inMessageWrap = messageWrapRef.value?.contains(targetNode) ?? false
    const inReminderWrap = reminderWrapRef.value?.contains(targetNode) ?? false
    const inTicketWrap = ticketWrapRef.value?.contains(targetNode) ?? false
    const inMobileMenuWrap = mobileMenuWrapRef.value?.contains(targetNode) ?? false

    if (!inMessageWrap && !inReminderWrap && !inTicketWrap) {
      closeAllPopups()
    }
    if (!inMobileMenuWrap) {
      closeMobileMenu()
    }
  }

  onMounted(() => {
    document.addEventListener('click', onDocumentClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick)
  })

  return {
    showMessagesPopup,
    showNotifications,
    showTicketsPopup,
    showMobileMenu,
    mobileMenuView,
    mobileMenuTitle,
    messageWrapRef,
    reminderWrapRef,
    ticketWrapRef,
    mobileMenuWrapRef,
    toggleReminderPopup,
    toggleMessagePopup,
    toggleTicketPopup,
    toggleMobileMenu,
    openMobileMenuPanel,
    closeMessagePopup,
    closeReminderPopup,
    closeTicketPopup,
    closeAllPopups,
    closeMobileMenu,
  }
}
