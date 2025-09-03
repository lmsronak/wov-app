import { useAtomValue, useSetAtom } from 'jotai'
import { Navigate, Outlet, useParams } from 'react-router'
import {
  currentClientAtom,
  setCurrentClientAtom,
} from '@/screens/ClientScreen/clientAtom'
import { useEffect } from 'react'

const RequireClient = () => {
  const selectedClient = useAtomValue(currentClientAtom)
  const setCurrentClient = useSetAtom(setCurrentClientAtom)

  const { clientId } = useParams()

  useEffect(() => {
    if (clientId) {
      setCurrentClient(clientId)
    } else {
      setCurrentClient(undefined)
    }
  }, [])

  if (!clientId) {
    return <Navigate to="/clients" replace />
  }

  return <Outlet />
}

export default RequireClient
