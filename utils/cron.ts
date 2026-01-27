import { CronJob } from "cron";
import { handleWSCleanup } from "../cron/ws-cleanup";

export const initializeCron = async () => {
	new CronJob("0 */1 * * * *", handleWSCleanup, null, true);
};
