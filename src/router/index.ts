import { createRouter, createWebHistory } from 'vue-router'
import CMPHome from '../views/CMPHome.vue'
import { fetchAssignmentBoardAccess, fetchUserAccess } from '@/services/users/accounts'
import { fetchWorkspaceAccess, type WorkspaceAccess } from '@/services/access/workspace'

const hasAuthToken = () => Boolean(localStorage.getItem('cmp_auth_token'))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Auth/LoginView.vue'),
      meta: { guestOnly: true, authScreen: true },
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('../views/Auth/ForgotPasswordView.vue'),
      meta: { authScreen: true },
    },
    {
      path: '/reset-password/:token?',
      name: 'ResetPassword',
      component: () => import('../views/Auth/ResetPasswordView.vue'),
      meta: { authScreen: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Auth/RegisterView.vue'),
      meta: { requiresAuth: true, authScreen: true, userManagement: true },
    },
    {
      path: '/users',
      name: 'UserDirectory',
      component: () => import('../views/Auth/UserDirectoryView.vue'),
      meta: { requiresAuth: true, userManagement: true },
    },
    {
      path: '/',
      name: 'CMPHome',
      component: CMPHome,
      meta: { requiresAuth: true },
    },
    {
      path: '/RegisterVessel',
      name: 'RegisterVessel',
      component: () => import('../views/Customer/Vessel/RegisterVessel.vue'),
      meta: { requiresAuth: true, workspaceCapability: 'canManageVessels' },
    },
    {
      path: '/VesselProfile',
      name: 'VesselProfile',
      component: () => import('../views/Customer/Vessel/VesselProfile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/GenerateVesselHistory',
      name: 'GenerateVesselHistory',
      component: () => import('../components/Vessel/GenerateVesselHistory.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/CustomerDirectory',
      name: 'CustomerDirectory',
      component: () => import('../views/Customer/CustomerDirectory.vue'),
      meta: { requiresAuth: true, workspaceCapability: 'canViewDirectory' },
    },
    {
      path: '/CustomerProfile',
      name: 'CustomerProfile',
      component: () => import('../views/Customer/CustomerProfile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/CustomerRegistration',
      name: 'CustomerRegistration',
      component: () => import('../views/Customer/CustomerRegistration.vue'),
      meta: { requiresAuth: true, workspaceCapability: 'canRegisterCustomers' },
    },
    {
      path: '/NewTicket',
      name: 'NewTicket',
      component: () => import('../views/Ticket/NewTicket.vue'),
      meta: { requiresAuth: true, createCapability: 'canCreateTickets' },
    },
    {
      path: '/assignments',
      name: 'AssignmentBoard',
      component: () => import('../views/Assignment/AssignmentBoard.vue'),
      meta: { requiresAuth: true, assignmentBoard: true },
    },
    {
      path: '/Ticket',
      name: 'Ticket',
      component: () => import('../views/Ticket/TheTicket.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/NewMonthlyReport',
      name: 'NewMonthlyReport',
      component: () => import('../views/MonthlyReport/NewMonthlyReport.vue'),
      meta: { requiresAuth: true, createCapability: 'canCreateReports' },
    },
    {
      path: '/MonthlyReport',
      name: 'MonthlyReport',
      component: () => import('../views/MonthlyReport/TheMonthlyReport.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/Reminder',
      name: 'Reminder',
      component: () => import('../views/Reminder/TheReminder.vue'),
      meta: { requiresAuth: true, workspaceCapability: 'canViewReminders' },
    },
    {
      path: '/NewReminder',
      name: 'NewReminder',
      component: () => import('../views/Reminder/NewReminder.vue'),
      meta: { requiresAuth: true, workspaceCapability: 'canManageReminders' },
    },
    {
      path: '/Messages',
      name: 'Messages',
      component: () => import('../views/Messages/MessagesListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/Conversation',
      name: 'Conversation',
      component: () => import('../views/Messages/ConversationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/ArchivedMessages',
      name: 'ArchivedMessages',
      component: () => import('../views/Messages/ArchivedConversationsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const isAuthed = hasAuthToken()

  if (to.meta.requiresAuth && !isAuthed) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && isAuthed) {
    return { name: 'CMPHome' }
  }

  if (to.meta.userManagement) {
    try {
      await fetchUserAccess()
    } catch {
      return { name: hasAuthToken() ? 'CMPHome' : 'Login' }
    }
  }

  if (to.meta.assignmentBoard) {
    try {
      await fetchAssignmentBoardAccess()
    } catch {
      return { name: hasAuthToken() ? 'CMPHome' : 'Login' }
    }
  }

  if (to.meta.workspaceCapability) {
    try {
      const access = await fetchWorkspaceAccess()
      const capability = to.meta.workspaceCapability as keyof WorkspaceAccess
      if (!access[capability]) return { name: 'CMPHome' }
    } catch {
      return { name: hasAuthToken() ? 'CMPHome' : 'Login' }
    }
  }

  if (to.meta.createCapability && !String(to.query.id || '').trim()) {
    try {
      const access = await fetchWorkspaceAccess()
      const capability = to.meta.createCapability as keyof WorkspaceAccess
      if (!access[capability]) return { name: 'CMPHome' }
    } catch {
      return { name: hasAuthToken() ? 'CMPHome' : 'Login' }
    }
  }

  return true
})

export default router
