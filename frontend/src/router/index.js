import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '../views/DashboardView.vue'
import BenchmarkView from '../views/BenchmarkWorkspace.vue'
import ResultsView from '../views/ResultsView.vue'
import AboutView from '../views/AboutView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/benchmark', name: 'benchmark', component: BenchmarkView },
    { path: '/results', name: 'results', component: ResultsView },
    { path: '/about', name: 'about', component: AboutView },
  ],
})
