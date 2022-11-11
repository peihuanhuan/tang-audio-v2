import logo from './logo.svg';
import './App.css';
import { hot } from 'react-hot-loader/root';
import Main from './Main'
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
        path: "/baidu-authorization",
        element: <BaiduAuthorize/>,
    }
    ],
    {
        // nginx subdirectory path
        basename: "/bilibili-audio"
    });
function App() {

    let code = queryString.parse(window.location.search)["code"]



    return (
        <QueryClientProvider client={queryClient}>
            <div style={{padding: "16px 16px 0"}}>
                <RouterProvider router={router} />
            </div>

        </QueryClientProvider>
  );
}

export default hot(App);
