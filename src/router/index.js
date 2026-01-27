import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    // route level code-splitting
    // this generates a separate chunk (chat.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "chat" */ '../views/ChatView.vue')
  },
  {
    path: '/resume-parse',
    name: 'resume-parse',
    // route level code-splitting
    // this generates a separate chunk (resume-parse.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "resume-parse" */ '../views/ResumeParseView.vue')
  },
  {
    path: '/chat-resume',
    name: 'chat-resume',
    // route level code-splitting
    // this generates a separate chunk (chat-resume.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "chat-resume" */ '../views/ChatResumeView.vue')
  },
  {
    path: '/job-collection',
    name: 'job-collection',
    // route level code-splitting
    // this generates a separate chunk (job-collection.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "job-collection" */ '../views/JobCollectionView.vue')
  },
  {
    path: '/job-import',
    name: 'job-import',
    component: () => import(/* webpackChunkName: "job-import" */ '../views/JobImportView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
