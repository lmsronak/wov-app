import { httpClient } from "@/services/httpClient";
import type { Entity, MeasurableEntityNames } from "@/types/measurement.type";
import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosAdapter, type AxiosInstance } from "axios";
import { atom, useAtom, useSetAtom } from "jotai";
import { atomWithImmer } from "jotai-immer";
import { useEffect, useState } from "react";

export const getEntitesByType = async (type: string, client: AxiosInstance) => {
  const { data } = await client.get<{ data: Entity[]; message: string }>(
    "/api/measurements/entity",
    {
      params: {
        // clientId: "687b3c78b462e98c6d262157",
        entityType: type,
      },
    }
  );

  return data.data;
};

export interface EntitiesState {
  data: Entity[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isFetching: boolean;
  isFetched: boolean;
  hasMore: boolean;
  error: Error | null;
  fetchNextpage: () => void;
}

export const entitiesAtom = atomWithImmer<EntitiesState>({
  data: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  isFetching: false,
  isFetched: false,
  error: null,
  fetchNextpage: () => {
    throw new Error("Function not initialized yet");
  },
  hasMore: false,
});

const setPropAtom = atom(
  null,
  (
    _,
    set,
    update: {
      key: keyof EntitiesState;
      value: EntitiesState[keyof EntitiesState];
    }
  ) => {
    const { key, value } = update;
    set(entitiesAtom, (state) => ({ ...state, [key]: value }));
  }
);

export const appendEntityAtom = atom(null, (_, set, update: Entity) => {
  set(entitiesAtom, (state) => {
    state.data.push(update);
    return state;
  });
});

export const useEntities = (type: MeasurableEntityNames) => {
  const client = httpClient();

  const { data, isSuccess, isError, isFetching, error, isFetched, isLoading } =
    useQuery<Entity[]>({
      queryKey: ["entities", type],
      queryFn: () => getEntitesByType(type, client),
    });

  const setProp = useSetAtom(setPropAtom);
  //   const append = useSetAtom(appendAtom);

  useEffect(() => {
    setProp({ key: "isError", value: isError });
  }, [isError, setProp]);

  useEffect(() => {
    setProp({ key: "isSuccess", value: isSuccess });
    if (isSuccess) {
      setProp({ key: "data", value: data });
    }
  }, [isSuccess, data, setProp]);

  useEffect(() => {
    setProp({ key: "error", value: error });
  }, [error, setProp]);

  useEffect(() => {
    setProp({ key: "isFetched", value: isFetched });
  }, [isFetched, setProp]);

  useEffect(() => {
    setProp({ key: "isFetching", value: isFetching });
  }, [isFetching, setProp]);

  useEffect(() => {
    setProp({ key: "isLoading", value: isLoading });
  }, [isLoading, setProp]);

  return useAtom(entitiesAtom);
};
