import logo from './logo.svg';
import './App.css';
import { hot } from 'react-hot-loader/root';
import Main from './Main'

function App() {
    return (
    <div style={{padding: "24px 36px 0"}}>
        <Main></Main>
    </div>
  );
}

export default hot(App);
