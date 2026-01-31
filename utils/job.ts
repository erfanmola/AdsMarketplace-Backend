export enum JobResult {
	Ok = "ok",
	Failed = "failed",
}

export type Job<P> =
	| ((params: P) => JobResult)
	| ((params: P) => Promise<JobResult>);

export async function runJobs<P>(
	params: P,
	jobs: readonly Job<P>[],
): Promise<boolean> {
	for (const job of jobs) {
		const result = await job(params);

		if (result !== JobResult.Ok) {
			return false;
		}
	}
	return true;
}
