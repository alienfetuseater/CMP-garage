import { createRouter, createWebHistory } from 'vue-router'
import CMPHome from '../views/CMPHome.vue'

const hasAuthToken = () => Boolean(localStorage.getItem('cmp_auth_token'))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('../views/Auth/ForgotPasswordView.vue'),
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('../views/Auth/ResetPasswordView.vue'),
    },
    {
      path: '/reset-password/:token',
      name: 'ResetPasswordTokenPath',
      component: () => import('../views/Auth/ResetPasswordView.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Auth/RegisterView.vue'),
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
    },
    {
      path: '/NewTicket',
      name: 'NewTicket',
      component: () => import('../views/Ticket/NewTicket.vue'),
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
    },
    {
      path: '/NewReminder',
      name: 'NewReminder',
      component: () => import('../views/Reminder/NewReminder.vue'),
      meta: { requiresAuth: true },
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

router.beforeEach((to) => {
  const tokenFromQuery =
    (typeof to.query.token === 'string' ? to.query.token.trim() : '') ||
    (typeof to.query.resetToken === 'string' ? to.query.resetToken.trim() : '') ||
    (typeof to.query.code === 'string' ? to.query.code.trim() : '')

  if (to.name === 'Login' && tokenFromQuery) {
    return {
      name: 'ResetPassword',
      query: { token: tokenFromQuery },
    }
  }

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

  return true
})

export default router
