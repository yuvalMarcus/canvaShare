export interface UseMutationHook {
    onSuccess?: () => void,
    onError?: (error: Error) => void
}