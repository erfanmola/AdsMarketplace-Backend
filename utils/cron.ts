import { CronJob } from "cron";
import { handleCheckJobs } from "../cron/check-jobs";
import { handleWSCleanup } from "../cron/ws-cleanup";

export const initializeCron = async () => {
	new CronJob("0 */1 * * * *", handleWSCleanup, null, true);
	new CronJob("0 0 0 * * *", handleCheckJobs, null, true);
};
