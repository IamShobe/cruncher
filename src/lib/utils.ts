
export const measureTime = <T>(id: string, fn: () => T) => {
	const start = Date.now();
	const res = fn();
	console.log(`[Time Measure] [${id}] Time taken: ${Date.now() - start}ms`);
	return res;
}


export function product<T>(elements: T[][]): T[][] {
	if (!Array.isArray(elements)) {
		throw new TypeError();
	}

	const end = elements.length - 1
	const result = [];

	function addTo(curr: T[], start: number) {
		const first = elements[start]
		const last = (start === end);

		for (let i = 0; i < first.length; ++i) {
			const copy = curr.slice();
			copy.push(first[i]);

			if (last) {
				result.push(copy);
			} else {
				addTo(copy, start + 1);
			}
		}
	}

	if (elements.length) {
		addTo([], 0);
	} else {
		result.push([]);
	}
	return result;
}

export const createSignal = <T = void>() => {
	let resolve: (value: T | PromiseLike<T>) => void;
	let promise: Promise<T>;

	const reset = () => {
		promise = new Promise<T>((res) => {
			resolve = res;
		});
	}

	const wait = (opts: {timeout?: number} = {}) => {
		if (opts.timeout) {
			return new Promise<T>((res, rej) => {
				const timer = setTimeout(() => {
					rej(new Error("Signal wait timed out"));
				}, opts.timeout);
				promise.then((value) => {
					clearTimeout(timer);
					res(value);
				}).catch((error) => {
					clearTimeout(timer);
					rej(error);
				});
			});
		}
		return promise;
	}

	reset();  // Initialize the promise

	return {
		reset: reset,  // Reset the signal to a new promise
		wait: wait,  // Await this to wait for the signal
		signal: (value: T | PromiseLike<T>) => resolve(value),  // Call this to resolve the signal
	};
}

export type Signal<T = void> = ReturnType<typeof createSignal<T>>;


export const atLeastOneConnectionSignal = () => {
	const signal = createSignal();

	let connections = 0;
	const increment = () => {
		connections++;
		if (connections === 1) {
			signal.signal();  // Signal that at least one connection is established
		}
	}

	const decrement = () => {
		connections--;
		if (connections <= 0) {
			signal.reset();
			connections = 0;  // Reset connections to 0
		}
	}

	return {
		isReady: () => signal.wait(),
		increment: increment,
		decrement: decrement,
	}
}

