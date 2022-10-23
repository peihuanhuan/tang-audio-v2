import logo from './logo.svg';
import './App.css';
import { hot } from 'react-hot-loader/root';
import Main from './Main'

import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();


function App() {


    return (
        <QueryClientProvider client={queryClient}>

            <div style={{padding: "24px 36px 0"}}>
                <Main></Main>
            </div>

        </QueryClientProvider>
  );
}

export default hot(App);
