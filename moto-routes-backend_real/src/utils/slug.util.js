import slugifyPackage from "slugify";

export function generateSlug(value) {
  return slugifyPackage(value, {
    lower: true,
    strict: true,
    trim: true
  });
}
