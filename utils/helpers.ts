type NonFunction =
	| string
	| number
	| boolean
	| symbol
	| bigint
	| object
	| null
	| undefined;

type Condition<T extends NonFunction> = T | readonly T[] | ((v: T) => boolean);

type Matcher<T extends NonFunction, R> = readonly [Condition<T>, R];

export function match<T extends NonFunction, R>(
	value: T,
	cases: readonly Matcher<T, R>[],
	defaultValue: R,
): R {
	for (const [cond, result] of cases) {
		if (typeof cond === "function") {
			if (cond(value)) return result;
		} else if (Array.isArray(cond)) {
			if (cond.includes(value)) return result;
		} else {
			if (Object.is(cond, value)) return result;
		}
	}
	return defaultValue;
}
