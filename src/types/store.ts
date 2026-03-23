export interface StoreHours {
  day: string;
  hour: string;
}

export interface FDJStore {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  marker_text: string;
  marker_image: string;
  popin_image_top: string;
  popin_image_bottom: string;
  popin_background_color: string;
  address: string;
  address2: string;
  city: string;
  zip_code: string;
  url_homepage: string;
  phone_home: string;
  phone_fax: string;
  phone_sav: string;
  hours: StoreHours[];
  hours_exceptional: string | null;
  distance_in_km: number;
}
