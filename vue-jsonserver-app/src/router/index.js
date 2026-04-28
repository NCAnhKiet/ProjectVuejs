import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import CreatePost from '../views/CreatePost.vue'
import Profile from '../views/Profile.vue'
import PostDetail from '../views/PostDetail.vue'
import VerifyEmail from '../views/VerifyEmail.vue'
import EditPost from '../views/EditPost.vue'
import Friends from '../views/Friends.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/forgot-password', component: ForgotPassword },
    { path: '/create', component: CreatePost, meta: { auth: true } },
    { path: '/profile', component: Profile, meta: { auth: true } },
    { path: '/user/:id', component: Profile },
    { path: '/post/:id', component: PostDetail },
    { path: '/verify/:id', component: VerifyEmail },
    { path: '/edit/:id', component: EditPost },
    { path: '/friends', component: Friends, meta: { auth: true } },
    { path: '/messages', component: () => import('../views/Messages.vue'), meta: { auth: true } }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const user = localStorage.getItem('user')
    if (to.meta.auth && !user) next('/login')
    else next()
})

export default router
