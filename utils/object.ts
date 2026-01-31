export const compareObjects = (
	a: any,
	b: any,
	seen?: WeakMap<object, object>,
): boolean => {
	// null == undefined
	if (a == null && b == null) return true;

	// Fast reference / primitive check
	if (a === b) return true;

	// Type mismatch
	if (typeof a !== typeof b) return false;

	// Only objects beyond this point
	if (typeof a !== "object") return false;

	// Circular protection (lazy alloc)
	if (seen) {
		if (seen.get(a) === b) return true;
		seen.set(a, b);
	} else {
		seen = new WeakMap();
		seen.set(a, b);
	}

	// Array vs object
	if ((a as any).length !== undefined || (b as any).length !== undefined) {
		if (!Array.isArray(a) || !Array.isArray(b)) return false;
		if (a.length !== b.length) return false;

		for (let i = 0; i < a.length; i++) {
			if (!compareObjects(a[i], b[i], seen)) return false;
		}
		return true;
	}

	// Plain object path
	const keysA = Object.keys(a);
	const len = keysA.length;

	if (len !== Object.keys(b).length) return false;

	for (let i = 0; i < len; i++) {
		const k = keysA[i];
		if (!(k in b)) return false;
		if (!compareObjects(a[k], b[k], seen)) return false;
	}

	return true;
};
