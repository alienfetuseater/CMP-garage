import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import NewVessel from '../views/NewVessel.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/new-vessel',
      name: 'new-vessel',
      component: () => import('../views/NewVessel.vue'),
    },
  ],
})

export default router
