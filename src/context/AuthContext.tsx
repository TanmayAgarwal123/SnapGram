import { IUser, IcontextType } from '@/types/intex';
import {createContext, useContext, useEffect, useState} from 'react'

export const INITIAL_USER = {
    id: '',
    name: '',
    username: '',
    email: '',
    imageUrl: '',
    bio: ''
};

const INITIAL_STATE = {
    user: INITIAL_USER,
    isLoading: false,
    isAuthenticated: false,
    setUser: () => {},
    setIsAuthenticated: () => {},
    checkAuthUser: async () => false as boolean,
};

const AuthContext = createContext<IcontextType>(INITIAL_STATE);

const AuthProvider = ({ childen }: {children:React.ReactNode}) => {
  const [user, setUser] = useState<IUser>(INITIAL_USER)
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
    
  )
}

export default AuthContext