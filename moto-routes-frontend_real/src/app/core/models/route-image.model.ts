export interface RouteImage {
  _id: string;
  routeId: string;
  imageUrl: string;
  altText: string | null;
  position: number;
  isCover: boolean;
  createdAt: string;
}

export interface RouteImagePayload {
  imageUrl: string;
  altText?: string | null;
  position?: number;
  isCover?: boolean;
}
