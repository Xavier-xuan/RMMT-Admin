export default {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    ssr: false,

    // Target: https://go.nuxtjs.dev/config-target
    target: 'static',

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: 'RMMT-Admin',
        htmlAttrs: {
            lang: 'zh-cn'
        },
        meta: [
            {charset: 'utf-8'},
            {name: 'viewport', content: 'width=device-width, initial-scale=1'},
            {hid: 'description', name: 'description', content: ''},
            {name: 'format-detection', content: 'telephone=no'}
        ],
        link: [
            {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
        ]
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [
        'element-ui/lib/theme-chalk/index.css',
        '@/css/no-margin',
        '@/css/grey-background',
        '@/css/default-container'


    ],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
        '@/plugins/element-ui',
        '@/plugins/lodash',
        '@/plugins/axios',
        '@/plugins/vform',
        '@/plugins/umy-ui',
    ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: true,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        '@nuxtjs/axios',
        '@nuxtjs/auth-next'
    ],
    auth: {
        strategies: {
            local: {
                scheme: 'local',
                token: {
                    property: "data.access_token",
                    global: true,
                },
                user: {
                    property: 'data.user'
                },
                endpoints: {
                    login: {url: '/login', method: 'post'},
                    logout: {url: '/logout', method: 'post'},
                    user: {url: '/userinfo', method: 'get'}
                }
            }
        },
        redirect: {
            home: '/dashboard',
            logout: '/'
        }
    },
    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        transpile: [/^element-ui/],
    },
    router: {
        middleware: ['auth']
    },
    axios: {
        baseURL: process.env.NUXT_API_URL + "/api/admin"
    }
}
