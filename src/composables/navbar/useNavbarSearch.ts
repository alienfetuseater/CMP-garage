import { computed, ref } from 'vue'
import type { Customer, Ticket, Vessel } from '@/types/mock'
import { filterCustomers, filterTickets, filterVessels } from '@/domain/navbar/search'

type UseNavbarSearchOptions = {
  customers: () => Customer[]
  vessels: () => Vessel[]
  tickets: () => Ticket[]
  maxResults?: number
}

export function useNavbarSearch(options: UseNavbarSearchOptions) {
  const searchQuery = ref('')
  const showResults = ref(false)
  const maxResults = options.maxResults ?? 6

  const filteredCustomers = computed(() =>
    filterCustomers(options.customers(), searchQuery.value, maxResults),
  )

  const filteredVessels = computed(() =>
    filterVessels(options.vessels(), searchQuery.value, maxResults),
  )

  const filteredTickets = computed(() =>
    filterTickets(options.tickets(), searchQuery.value, maxResults),
  )

  const hasAnyResults = computed(
    () =>
      filteredCustomers.value.length > 0 ||
      filteredVessels.value.length > 0 ||
      filteredTickets.value.length > 0,
  )

  function closeSearch() {
    searchQuery.value = ''
    showResults.value = false
  }

  function onSearchBlur() {
    window.setTimeout(() => {
      showResults.value = false
    }, 120)
  }

  return {
    searchQuery,
    showResults,
    filteredCustomers,
    filteredVessels,
    filteredTickets,
    hasAnyResults,
    closeSearch,
    onSearchBlur,
  }
}
