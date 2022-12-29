import logo from './logo.svg';
import './App.css';
import { hot } from 'react-hot-loader/root';
import Main from './Main'
import WeixinLogin from './page/WeixinLogin'
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
        path: "/bilibili-audio",
        element: <Main/>,
    },
    {
        path: "/bilibili-audio/baidu-authorization",
        element: <BaiduAuthorize/>,
    },
    {
        path: "/bilibili-audio/weixin-authorization",
        element: <WeixinLogin/>,
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
