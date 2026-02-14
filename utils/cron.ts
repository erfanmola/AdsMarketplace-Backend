import { CronJob } from "cron";
import { handleCheckJobs } from "../cron/check-jobs";
import { handleRejectExpiredOffers } from "../cron/reject-expired-offers";
import { handleUpdateStats } from "../cron/update-stats";
import { handleWSCleanup } from "../cron/ws-cleanup";

export const initializeCron = async () => {
	new CronJob("0 */1 * * * *", handleWSCleanup, null, true); // Every minute
	new CronJob("0 */1 * * * *", handleRejectExpiredOffers, null, true); // Every minute
	new CronJob("0 0 0 * * *", handleCheckJobs, null, true); // Every day at midnight
	new CronJob("0 0 0 * * 0", handleUpdateStats, null, true); // Every Sunday at midnight
};
