import { useCurrentClient } from "@/screens/ClientScreen/clientAtom"
import axios from "axios"
import { useParams } from "react-router"

export const httpClient = () => {
  try {
    const [currentClientId] = useCurrentClient()
    const { clientId } = useParams()

    return axios.create({
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Client-Id": clientId ?? undefined,
      },
    })
  } catch (err) {
    throw new Error(err as any)
  }
}
