export interface ProviderPair<T> {
	state: T;
	setState: React.Dispatch<React.SetStateAction<T>>;
}
