export interface UseMutationHook {
    onSuccess: () => void;
    onError: () => void;
    onSettled: () => void;
}