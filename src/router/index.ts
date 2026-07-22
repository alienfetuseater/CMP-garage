import { createRouter, createWebHistory } from 'vue-router'
import CMPHome from '../views/CMPHome.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'CMPHome',
      component: CMPHome,
    },
    {
      path: '/RegisterVessel',
      name: 'RegisterVessel',
      component: () => import('../views/Customer/Vessel/RegisterVessel.vue'),
    },
    {
      path: '/VesselProfile',
      name: 'VesselProfile',
      component: () => import('../views/Customer/Vessel/VesselProfile.vue'),
    },
    {
      path: '/GenerateVesselHistory',
      name: 'GenerateVesselHistory',
      component: () => import('../components/Vessel/GenerateVesselHistory.vue'),
    },
    {
      path: '/CustomerDirectory',
      name: 'CustomerDirectory',
      component: () => import('../views/Customer/CustomerDirectory.vue'),
    },
    {
      path: '/CustomerProfile',
      name: 'CustomerProfile',
      component: () => import('../views/Customer/CustomerProfile.vue'),
    },
    {
      path: '/CustomerRegistration',
      name: 'CustomerRegistration',
      component: () => import('../views/Customer/CustomerRegistration.vue'),
    },
    {
      path: '/NewTicket',
      name: 'NewTicket',
      component: () => import('../views/Ticket/NewTicket.vue'),
    },
    {
      path: '/TicketPopUp',
      name: 'TicketPopUp',
      component: () => import('../components/Ticket/PopUp.vue'),
    },
    {
      path: '/Ticket',
      name: 'Ticket',
      component: () => import('../views/Ticket/TheTicket.vue'),
    },
    {
      path: '/Reminder',
      name: 'Reminder',
      component: () => import('../views/Reminder/TheReminder.vue'),
    },
    {
      path: '/NewReminder',
      name: 'NewReminder',
      component: () => import('../views/Reminder/NewReminder.vue'),
    },
  ],
})

export default router
