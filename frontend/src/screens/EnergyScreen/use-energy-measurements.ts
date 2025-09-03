import { httpClient } from "@/services/httpClient"
import type {
  MeasurableEntityNames,
  Measurement,
} from "@/types/measurement.type"
import { useQuery } from "@tanstack/react-query"
import axios, { type AxiosInstance } from "axios"
import { atom, useAtom, useSetAtom } from "jotai"
import { atomWithImmer } from "jotai-immer"
import { useEffect, useState } from "react"
import type { DateRange } from "react-day-picker"

export const getMeasurementById = async (id: string, client: AxiosInstance) => {
  const { data } = await client.get<Measurement>(`/api/measurements/${id}`)

  return data
}

export const getMeasurementsForType = async (
  type: string,
  client: AxiosInstance
) => {
  const { data } = await client.get<GetMeasurementsListRes>(
    "/api/measurements/",
    {
      params: {
        // clientId: "687b3c78b462e98c6d262157",
        entityType: type,
      },
    }
  )

  return data
}

export const getMeasurementsList = async (
  type: string,
  client: AxiosInstance,
  params: { page: number; limit: number },
  range?: DateRange
) => {
  const { data } = await client.get<GetMeasurementsListRes>(
    "/api/measurements/",
    {
      params: {
        entityType: type,
        page: params.page,
        limit: params.limit,
        startDate: range?.from,
        endDate: range?.from === range?.to ? null : range?.to,
      },
    }
  )

  return data
}

export interface MeasurementsState {
  data: Measurement[]
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  isFetching: boolean
  isFetched: boolean
  hasMore: boolean
  error: Error | null
  fetchNextpage: () => void
}

export const measurementsAtom = atomWithImmer<MeasurementsState>({
  data: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  isFetching: false,
  isFetched: false,
  error: null,
  fetchNextpage: () => {
    throw new Error("function not yet initialized")
  },
  hasMore: false,
})

const setPropAtom = atom(
  null,
  (
    _,
    set,
    update: {
      key: keyof MeasurementsState
      value: MeasurementsState[keyof MeasurementsState]
    }
  ) => {
    const { key, value } = update
    set(measurementsAtom, (state) => ({ ...state, [key]: value }))
  }
)

export const appendMeasurementsAtom = atom(
  null,
  (_, set, update: Measurement[]) => {
    set(measurementsAtom, (state) => ({
      ...state,
      data: state.data.concat(update),
    }))
  }
)

export const updateOneMeasurementAtom = atom(
  null,
  (_, set, update: Measurement) => {
    set(measurementsAtom, (state) => {
      console.log("trying to update state")
      console.log(update)

      for (let i = 0; i < state.data.length; i++) {
        const measurement = state.data[i]
        if (measurement._id === update._id) {
          state.data[i] = update
        }
      }

      return state
    })
  }
)

export interface GetMeasurementsListRes {
  data: Measurement[]
  total: number
}
export const useMeasurement = (type: MeasurableEntityNames) => {
  const [nextPageNo, setNextPageNo] = useState(1)
  const [currPage, setCurrPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const client = httpClient()

  const { data, isSuccess, error, isFetched, isLoading, isError, isFetching } =
    useQuery({
      queryKey: ["measurements", type, nextPageNo],
      queryFn: async () => await getMeasurementsForType(type, client),
      enabled: currPage < nextPageNo,
    })

  const setProp = useSetAtom(setPropAtom)
  const appendItems = useSetAtom(appendMeasurementsAtom)

  useEffect(() => {
    setProp({ key: "isError", value: isError })
  }, [isError, setProp])

  useEffect(() => {
    setProp({ key: "hasMore", value: hasMore })
  }, [hasMore, setProp])

  useEffect(() => {
    setProp({ key: "isSuccess", value: isSuccess })
    if (isSuccess) {
      // if (data.length != 0) {
      // setHasMore(true);
      setProp({ key: "data", value: data.data })
      // setCurrPage(nextPageNo);
      // } else {
      // setHasMore(false);
      // }
    }
  }, [isSuccess, data, setProp, appendItems, type])

  useEffect(() => {
    if (nextPageNo > 1 && isSuccess) {
      if (data.data.length != 0) {
        setHasMore(true)
        appendItems(data.data)
        setCurrPage(nextPageNo)
      } else {
        setCurrPage(nextPageNo)
        setHasMore(false)
      }
    }
  }, [nextPageNo])

  useEffect(() => {
    setProp({ key: "error", value: error })
  }, [error, setProp])

  useEffect(() => {
    setProp({ key: "isFetched", value: isFetched })
  }, [isFetched, setProp])

  useEffect(() => {
    setProp({ key: "isFetching", value: isFetching })
  }, [isFetching, setProp])

  useEffect(() => {
    setProp({ key: "isLoading", value: isLoading })
  }, [isLoading, setProp])

  useEffect(() => {
    setProp({
      key: "fetchNextpage",
      value: () => {
        setCurrPage(nextPageNo)
        setNextPageNo((page) => page + 1)
      },
    })
  }, [setProp])

  return useAtom(measurementsAtom)
}

export const useMeasurementV2 = (
  type: MeasurableEntityNames,
  page: number,
  pageSize: number,
  range?: DateRange
) => {
  const client = httpClient()

  const query = useQuery<GetMeasurementsListRes>({
    queryKey: ["measurements", type, page, pageSize, range?.from, range?.to],
    queryFn: async () =>
      await getMeasurementsList(type, client, { page, limit: pageSize }, range),
    // keepPreviousData: true,
  })

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  }
}
