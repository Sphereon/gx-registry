import { QueryOptions } from 'mongoose'

export const DEFAULT_UPSERT_OPTIONS: QueryOptions = { upsert: true, setDefaultsOnInsert: true, new: true }
