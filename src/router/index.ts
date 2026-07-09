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
      path: '/TicketWorkOrder',
      name: 'TicketWorkOrder',
      component: () => import('../views/Ticket/TicketWorkOrder.vue'),
    },
    {
      path: '/Ticket',
      name: 'Ticket',
      component: () => import('../views/Ticket/TheTicket.vue'),
    },
    {
      path: '/ToDo',
      name: 'ToDo',
      component: () => import('../views/ToDo/TheToDo.vue'),
    },
  ],
})

export default router
