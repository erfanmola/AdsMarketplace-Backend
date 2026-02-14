import { CronJob } from "cron";
import { handleCheckJobs } from "../cron/check-jobs";
import { handleCheckScheduledAds } from "../cron/check-scheduled-ads";
import { handleFinishScheduledAds } from "../cron/finish-scheduled-ads";
import { handleRejectExpiredOffers } from "../cron/reject-expired-offers";
import { handleSendScheduledAds } from "../cron/send-scheduled-ads";
import { handleUpdateStats } from "../cron/update-stats";
import { handleWSCleanup } from "../cron/ws-cleanup";

export const initializeCron = async () => {
	new CronJob("0 * * * * *", handleWSCleanup, null, true); // Every minute
	new CronJob("0 * * * * *", handleSendScheduledAds, null, true); // Every minute
	new CronJob("0 * * * * *", handleFinishScheduledAds, null, true); // Every minute
	new CronJob("0 * * * * *", handleRejectExpiredOffers, null, true); // Every minute
	new CronJob("0 0 * * * *", handleCheckScheduledAds, null, true); // Every hour
	new CronJob("0 0 0 * * *", handleCheckJobs, null, true); // Every day at midnight
	new CronJob("0 0 0 * * 0", handleUpdateStats, null, true); // Every Sunday at midnight
};
