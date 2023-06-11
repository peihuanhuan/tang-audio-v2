import logo from './logo.svg';
import './App.css';
import { hot } from 'react-hot-loader/root';
import BilibiliSubmit from './page/BilibiliSubmit'
import Main from './page/Main'

import Douyin from './page/Douyin'
import WeixinLogin from './page/WeixinLogin'
import BilibiliSubscribe from './page/BilibiliSubscribe'
import AddSubscribe from './page/AddSubscribe'
import BaiduAuthorize from './page/BaiduAuthorize'
import {
    createBrowserRouter,
    RouterProvider,
    Route,
} from "react-router-dom";

import { QueryClient, QueryClientProvider } from "react-query";
import queryString from "query-string";
const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        path: "/",
        element: <Main/>,
    },
    {
        path: "/bilibili-audio",
        element: <BilibiliSubmit/>,
    },
    {
        path: "/baidu-authorization",
        element: <BaiduAuthorize/>,
    },
    {
        path: "/weixin-authorization",
        element: <WeixinLogin/>,
    },
    {
        path: "/douyin-video",
        element: <Douyin/>,
    },
    {
        path: "/bilibili-subscribe",
        element: <BilibiliSubscribe/>,
    },
        {
            path: "/add-subscribe",
            element: <AddSubscribe/>,
        }
    ],
    {
        // nginx subdirectory path
        basename: "/"
    });
function App() {

    return (
        <QueryClientProvider client={queryClient}>
            <div style={{padding: "16px 16px 0"}}>
                <RouterProvider router={router} />
            </div>

        </QueryClientProvider>
  );
}

export default hot(App);
