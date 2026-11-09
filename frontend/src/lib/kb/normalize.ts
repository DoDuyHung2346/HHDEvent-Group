/**
 * Chuẩn hóa text tiếng Việt: bỏ dấu, lowercase, tách từ
 */

const VIETNAMESE_MAP: Record<string, string> = {
  // a
  à: "a", á: "a", ã: "a", ả: "a", ạ: "a",
  ă: "a", ắ: "a", ặ: "a", ằ: "a", ẳ: "a", ẵ: "a",
  â: "a", ấ: "a", ậ: "a", ầ: "a", ẩ: "a", ẫ: "a",
  // e
  è: "e", é: "e", ẹ: "e", ẻ: "e", ẽ: "e",
  ê: "e", ề: "e", ế: "e", ệ: "e", ể: "e", ễ: "e",
  // i
  ì: "i", í: "i", ị: "i", ỉ: "i", ĩ: "i",
  // o
  ò: "o", ó: "o", õ: "o", ọ: "o", ỏ: "o",
  ô: "o", ồ: "o", ố: "o", ộ: "o", ổ: "o", ỗ: "o",
  ơ: "o", ờ: "o", ớ: "o", ợ: "o", ở: "o", ỡ: "o",
  // u
  ù: "u", ú: "u", ụ: "u", ủ: "u", ũ: "u",
  ư: "u", ừ: "u", ứ: "u", ự: "u", ử: "u", ữ: "u",
  // y
  ỳ: "y", ý: "y", ỵ: "y", ỷ: "y", ỹ: "y",
  // d
  đ: "d",
  // Uppercase
  À: "a", Á: "a", Ã: "a", Ả: "a", Ạ: "a",
  Ă: "a", Ắ: "a", Ặ: "a", Ằ: "a", Ẳ: "a", Ẵ: "a",
  Â: "a", Ấ: "a", Ậ: "a", Ầ: "a", Ẩ: "a", Ẫ: "a",
  È: "e", É: "e", Ẹ: "e", Ẻ: "e", Ẽ: "e",
  Ê: "e", Ề: "e", Ế: "e", Ệ: "e", Ể: "e", Ễ: "e",
  Ì: "i", Í: "i", Ị: "i", Ỉ: "i", Ĩ: "i",
  Ò: "o", Ó: "o", Õ: "o", Ọ: "o", Ỏ: "o",
  Ô: "o", Ồ: "o", Ố: "o", Ộ: "o", Ổ: "o", Ỗ: "o",
  Ơ: "o", Ờ: "o", Ớ: "o", Ợ: "o", Ở: "o", Ỡ: "o",
  Ù: "u", Ú: "u", Ụ: "u", Ủ: "u", Ũ: "u",
  Ư: "u", Ừ: "u", Ứ: "u", Ự: "u", Ử: "u", Ữ: "u",
  Ỳ: "y", Ý: "y", Ỵ: "y", Ỷ: "y", Ỹ: "y",
  Đ: "d",
};

export function removeVietnameseTones(text: string): string {
  return text
    .split("")
    .map((char) => VIETNAMESE_MAP[char] ?? char)
    .join("");
}

export function normalizeText(text: string): string {
  return removeVietnameseTones(text).toLowerCase().trim();
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[\s,.!?;:'"()\-\[\]\/\\]+/)
    .filter((t) => t.length > 1);
}
