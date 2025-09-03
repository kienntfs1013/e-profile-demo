"use client";

import useSWR from "swr";

import { getById, listTable } from "@/lib/api/crud";

export function useTableList<T>(table: string, params?: Record<string, any>) {
	const key = [table, params] as const;
	const { data, error, isLoading, mutate } = useSWR(key, ([t, p]) => listTable<T>(t, p));
	return { data, error, isLoading, mutate };
}

export function useTableItem<T>(table: string, id?: number | string) {
	const key = id ? [table, id] : null;
	const { data, error, isLoading, mutate } = useSWR(key, ([t, itemId]) => getById<T>(t, itemId));
	return { data, error, isLoading, mutate };
}
