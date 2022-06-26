import {Message, Notification} from "element-ui";

export default function ({$axios, redirect, app}) {
    $axios.onResponse(response => {
        if (response.data.code !== 200) {
            Message.error(response.data.msg)
        } else if (response.data.msg !== "success" && response.data.msg !== undefined) {
            Message.success(response.data.msg)
        }

        if (response.headers['refresh-access-token'] !== undefined) {
            app.$auth.setUserToken(response.headers['refresh-access-token'])
        }
    })

    $axios.onError(error => {
        Notification.error({
            title: "Failed",
            message: "Oops.. There is something wrong with our remote server, so your action doesn't get a response. Please retry."
        })
    })

    $axios.onRequest(config => {
        if (config.method === "post" || config.method === "POST") {
            if (config.url === "/refresh") {
                let data = JSON.parse(config.data)
                config.headers['Authorization'] = "Bearer " + data.refresh_token
            }
        }
        return config
    })
}
