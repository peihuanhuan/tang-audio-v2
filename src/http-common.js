import axios from "axios";

const instance = axios.create({
    baseURL: "http://wx.peihuan.net/",
    headers: {
        'Content-Type': 'application/json'
    }
});

instance.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

export default instance