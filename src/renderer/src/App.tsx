import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login/Login';
import AppRoutes from './routes/AppRoutes';
import './styles/variables.scss'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <AppRoutes />
    </>
  )
}

export default App
