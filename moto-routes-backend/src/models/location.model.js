// Tabla: locations. La API usa camelCase; la base de datos usa snake_case.
export const locationModel = {
  table: "locations",
  columns: {
    city: "city",
    region: "region",
    country: "country",
    slug: "slug",
    address: "address",
    postalCode: "postal_code",
    latitude: "latitude",
    longitude: "longitude",
    status: "status",
    isActive: "is_active"
  },
  numeric: ["latitude", "longitude"]
};
