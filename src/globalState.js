import { createContext, useContext, useRef, useState } from "react";
import GLOBAL from './integration/storage.json'

const GlobalContext = createContext();

export let setMessage;

export function GlobalStateProvider({ children }) {
    const [globalState, setGlobalState] = useState(null);
    const globalMsg = useRef(null);
    return (
        <GlobalContext.Provider value={{ globalState, setGlobalState, globalMsg }}>
            {children}
        </GlobalContext.Provider>
    )
}

export default function useGlobalState() {
    const { globalState, setGlobalState, globalMsg } = useContext(GlobalContext);

    setMessage = (msg) => {
        globalMsg.current.show(msg)
    }

    return { globalState, setGlobalState, globalMsg }
}
