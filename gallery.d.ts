export type GalleryRowBase<T, U, I> = {
	type: T;
	meta: U;
	items: I[];
};

export type GalleryRowBaseMeta = {
	title: string;
	slug: string;
};

export type GalleryRowSliderMiniItem = {
	background: string;
	icon: string;
	title: string;
	subtitle?: string;
	url?: string;
	external?: boolean;
};

export type GalleryRowSliderFullItem = {
	image: string;
	url?: string;
	external?: boolean;
};

export type GalleryRowButtonListItem = {
	title: string;
	icon: string;
	color: string;
	url: string;
	external?: boolean;
};

export type GalleryRowCampaignListItem = {
	id: string;
	name: string;
	language_code?: string;
	category?: string;
};

export type GalleryRowEntityListItem = {
	id: string;
	chat_id: number;
	name: string;
	username: string;
	members: number;
	category?: string;
	language_code?: string;
	type: "channel" | "supergroup";
};

export type GalleryRowSliderMini = GalleryRowBase<
	"slider-mini",
	{
		autoplayDelay?: number;
	},
	GalleryRowSliderMiniItem
>;

export type GalleryRowSliderFull = GalleryRowBase<
	"slider-full",
	{
		autoplayDelay?: number;
	},
	GalleryRowSliderFullItem
>;

export type GalleryRowButtonList = GalleryRowBase<
	"button-list",
	{},
	GalleryRowButtonListItem
>;

export type GalleryRowCampaignList = GalleryRowBase<
	"campaign-list",
	GalleryRowBaseMeta,
	GalleryRowCampaignListItem
>;

export type GalleryRowEntityList = GalleryRowBase<
	"entity-list",
	GalleryRowBaseMeta,
	GalleryRowEntityListItem
>;

export type GalleryRowSlider = GalleryRowSliderMini | GalleryRowSliderFull;

export type GalleryRow =
	| GalleryRowSlider
	| GalleryRowButtonList
	| GalleryRowCampaignList
	| GalleryRowEntityList;

export type Gallery = GalleryRow[];
