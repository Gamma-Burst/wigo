export interface SavedHotelModel {
    id: string;
    hotelId: string;
    name: string;
    price: number | null;
    imageUrl: string | null;
    vibe: string | null;
    tags: string[];
}

export type GroupedHistory = Record<string, SavedHotelModel[]>;
