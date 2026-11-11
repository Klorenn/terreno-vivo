import { describe, expect, it } from "vitest";
import { precisionDe } from "./geocodificacion";

describe("precisionDe (Nominatim jsonv2)", () => {
  it("número de casa: addresstype house o address.house_number", () => {
    expect(precisionDe({ lat: "0", lon: "0", category: "place", type: "house", addresstype: "place", address: { house_number: "215", road: "Arturo Prat" } })).toBe("numero");
    expect(precisionDe({ lat: "0", lon: "0", category: "building", type: "yes", addresstype: "building" })).toBe("numero");
    expect(precisionDe({ lat: "0", lon: "0", category: "place", type: "house", addresstype: "house" })).toBe("numero");
  });

  it("calle: addresstype road/street o category highway", () => {
    expect(precisionDe({ lat: "0", lon: "0", category: "highway", type: "residential", addresstype: "road" })).toBe("calle");
    expect(precisionDe({ lat: "0", lon: "0", category: "highway", type: "primary", addresstype: "road" })).toBe("calle");
    expect(precisionDe({ lat: "0", lon: "0", category: "place", type: "street", addresstype: "street" })).toBe("calle");
  });

  it("amenity/shop/tourism/office con address.road: ubicación válida sobre una vía → calle", () => {
    expect(precisionDe({ lat: "0", lon: "0", category: "amenity", type: "marketplace", addresstype: "amenity", address: { road: "Aníbal Pinto" } })).toBe("calle");
    expect(precisionDe({ lat: "0", lon: "0", category: "tourism", type: "attraction", addresstype: "tourism", address: { road: "Prat" } })).toBe("calle");
  });

  it("amenity con house_number → numero", () => {
    expect(precisionDe({ lat: "0", lon: "0", category: "amenity", type: "school", addresstype: "amenity", address: { house_number: "12", road: "Lautaro" } })).toBe("numero");
  });

  it("zonas grandes → ninguna", () => {
    expect(precisionDe({ lat: "0", lon: "0", category: "boundary", type: "administrative", addresstype: "city" })).toBe("ninguna");
    expect(precisionDe({ lat: "0", lon: "0", category: "place", type: "suburb", addresstype: "suburb" })).toBe("ninguna");
    expect(precisionDe({ lat: "0", lon: "0", category: "place", type: "neighbourhood", addresstype: "neighbourhood" })).toBe("ninguna");
    expect(precisionDe({ lat: "0", lon: "0", category: "place", type: "city", addresstype: "city" })).toBe("ninguna");
  });

  it("amenity sin road ni número → ninguna (no hay vía que lo ancle)", () => {
    expect(precisionDe({ lat: "0", lon: "0", category: "amenity", type: "park", addresstype: "amenity" })).toBe("ninguna");
  });
});
