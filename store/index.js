export const state = () => ({
    auth_token: null
})

export const mutations = {
    set_auth_token(state, token) {
        state.auth_token = token
    }
}


