import { createContext, useContext, useEffect, useState } from "react";
import { ApiError, jsonFetch } from "../../utils/http/api";

const initialReasponse: { loading: boolean, offline: boolean, data:any, error: string|null } = {
    
    loading: true,
    offline: false,
    data: null,
    error: null
}

const FormFetchContext = createContext({
        search: { q: '', onSearchChange: (_v: string) => {} },
        response: {
            get: () => {},
            ...initialReasponse
        },
    })

export const useFormFetch = () => {
    return useContext(FormFetchContext)
}

export function FormFetch ({ children, url }: any) {

    const [q, setSearch] = useState('')
    const [response, setResponse] = useState(initialReasponse)

    const onSearchChange = (v: string) => {
        setSearch(v)
    } 

    const get = async () => {
        try {

            if (!window.navigator.onLine) {
                setResponse((r:any) => ({ ...r, offline: true }))
                return
            }

            setResponse((r: any) => ({ ...r, loading: true }))
            const queryParams = q !== '' ? { q } : undefined
            const params = { queryParams }

            const data = await jsonFetch(url, params)
            setResponse({ loading: false, offline: false, error: null, data  })
        } catch (e: any) {
            if (e instanceof ApiError) {
                setResponse((r) => ({ ...r, loading: false, data: null, error: e.message ?? `${e.status} Not found` }))
            } else {
                console.error(e)
                throw e
            }
        }
    }

    useEffect(() => {
        get()
    }, [q])

    const value = {
        search: { q, onSearchChange },
        response: {
            get,
            ...response
        }
    }

    return (
        <FormFetchContext.Provider value={ value }>
            { children }
        </FormFetchContext.Provider>
    )
}