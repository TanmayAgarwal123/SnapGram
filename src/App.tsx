import { Routes, Route } from 'react-router-dom';
import './globals.css';
import SigninForm from './_auth/forms/SigninForm';
import { Home } from './_root/pages';
import SignUpForm from './_auth/forms/SignupForm';

const App = () => {
  return (
    <main className='flex h-screen'>
        <Routes>
            {/*public routes*/}
            <Route path="/sign-in" element={<SigninForm/>} />
            <Route path="/sign-up" element={<SignUpForm/>} />
            
            {/*private routes*/}
            <Route index element={<Home/>} />
        </Routes>
    </main>
  )
}

export default App