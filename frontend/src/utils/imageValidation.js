export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

export function validateImage(file) {
    if (!file) {
        return "Please select an image.";
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return "Please select a JPG, PNG, or WEBP image.";
    }

    if (file.size > MAX_IMAGE_SIZE) {
        return "Image size must be 5 MB or less.";
    }

    return "";
}
