import { parseAssistantMessage } from "./recommendations";

// Strings below are copied verbatim from the backend so the test fails if the
// contract in chat.service.ts changes: MEDIS and TOKO both end with the contact
// line built by getContactLine(), while AMAN ends with the recommendation line.
const MEDIS_REPLY = "Maaf Mama, untuk pertanyaan seputar kesehatan seperti ini, sebaiknya konsultasi langsung dengan admin MamaBear ya, biar dapat jawaban yang lebih tepat.\n\nKONTAK ADMIN: 6281234567890";

const TOKO_REPLY = "Untuk info soal pesanan, pengiriman, pembayaran, atau promo, Mama bisa langsung tanya admin MamaBear ya.\n\nKONTAK ADMIN: 628888695757";

const OFF_TOPIC_REPLY = "Maaf Mama, aku cuma bisa bantu soal produk MamaBear untuk ibu hamil dan menyusui ya. Ada yang ingin Mama tanyakan soal produknya?";

const AMAN_REPLY = "Almond Mix-nya enak buat nambah ASI ya.\n\nREKOMENDASI PRODUK: almond-mix, asi-booster";

describe("parseAssistantMessage", () => {
  it("extracts the contact number from a MEDIS reply and hides the raw line", () => {
    const result = parseAssistantMessage(MEDIS_REPLY);

    expect(result.contactPhone).toBe("6281234567890");
    expect(result.slugs).toEqual([]);
    expect(result.text).not.toContain("KONTAK ADMIN");
    expect(result.text).toContain("pertanyaan seputar kesehatan");
  });

  it("extracts the contact number from a TOKO reply", () => {
    const result = parseAssistantMessage(TOKO_REPLY);

    expect(result.contactPhone).toBe("628888695757");
    expect(result.text).not.toContain("KONTAK ADMIN");
  });

  it("still parses recommendation slugs from an AMAN reply", () => {
    const result = parseAssistantMessage(AMAN_REPLY);

    expect(result.slugs).toEqual(["almond-mix", "asi-booster"]);
    expect(result.contactPhone).toBeNull();
    expect(result.text).not.toContain("REKOMENDASI PRODUK");
  });

  it("returns the text untouched when the reply carries neither line", () => {
    const result = parseAssistantMessage(OFF_TOPIC_REPLY);

    expect(result).toEqual({ text: OFF_TOPIC_REPLY, slugs: [], contactPhone: null });
  });

  it("rejects a contact number that does not look Indonesian", () => {
    // The AMAN category is free-form LLM output, so the model could invent a
    // phone number. Showing a wrong number to the customer is worse than
    // leaving the line visible.
    const result = parseAssistantMessage("Tukar di 0812 3456 7890 ya.\n\nKONTAK ADMIN: 081234567890");

    expect(result.contactPhone).toBeNull();
    expect(result.text).toContain("KONTAK ADMIN");
  });

  it("collapses the blank lines the backend leaves before the contact line", () => {
    const result = parseAssistantMessage(MEDIS_REPLY);

    expect(result.text).not.toMatch(/\n{3,}/);
    expect(result.text).toBe(result.text.trim());
  });
});
