export const convertTitleToSlug = (title: string) => {
  if (!title) {
    return;
  }

  return title
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .normalize("NFD") // Normalize unicode characters (e.g., é → e)
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics/accents
    .replace(/[^\w\s-]/g, "") // Remove special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};
