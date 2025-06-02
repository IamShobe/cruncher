import { parse, parseISO, isValid } from 'date-fns';

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

export const createSignal = () => {
	let resolve: () => void;
	let promise: Promise<void>;

	const reset = () => {
		promise = new Promise<void>((res) => {
			resolve = res;
		});
	}

	const wait = (opts: {timeout?: number} = {}) => {
		if (opts.timeout) {
			return new Promise<void>((res, rej) => {
				const timer = setTimeout(() => {
					rej(new Error("Signal wait timed out"));
				}, opts.timeout);
				promise.then(() => {
					clearTimeout(timer);
					res();
				});
			});
		}
		return promise;
	}

	reset();  // Initialize the promise

	return {
		reset: reset,  // Reset the signal to a new promise
		wait: wait,  // Await this to wait for the signal
		signal: () => resolve(),  // Call this to resolve the signal
	};
}


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


/**
 * Tries to parse a value into a JavaScript Date using date-fns
 * @param {string|number|Date} input
 * @returns {Date|null}
 */
export const parseDate = (input: unknown): Date | null => {
	if (input instanceof Date && isValid(input)) {
		return input;
	}

	// Handle epoch time (number or numeric string)
	if (typeof input === 'number' || (typeof input === 'string' && /^\d+$/.test(input))) {
		const date = new Date(Number(input));
		return isValid(date) ? date : null;
	}

	// Try ISO parsing
	if (typeof input === 'string') {
		let date = parseISO(input);
		if (isValid(date)) return date;

		// Fallback to custom format (e.g. MM/dd/yyyy)
		const knownFormats = [
			'MM/dd/yyyy',
			'yyyy-MM-dd',
			'dd-MM-yyyy',
			'MM-dd-yyyy',
			'yyyy/MM/dd',
			'dd/MM/yyyy',
			'MMM dd, yyyy',
			'MMMM dd, yyyy',
			'EEE MMM dd yyyy HH:mm:ss',
		];

		for (const format of knownFormats) {
			date = parse(input, format, new Date());
			if (isValid(date)) return date;
		}
	}

	// Could not parse
	return null;
}