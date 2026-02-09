import { type Locales, t } from "../utils/i18n";

export const Categories = [
	"general",
	"news",
	"business",
	"crypto",
	"tech",
	"programming",
	"entertainment",
	"memes",
	"gaming",
	"education",
	"lifestyle",
	"adult",
] as const;

export const CategoriesMapped: Record<Locales, { [key: string]: string }> = {
	en: Object.fromEntries(
		Categories.map((category) => [category, t("en", `categories.${category}`)]),
	),
};
