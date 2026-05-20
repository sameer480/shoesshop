/**
 * Check delivery availability for an Indian pincode.
 * Uses the free India Post API (api.postalpincode.in).
 */

// Pincodes outside these prefixes are treated as non-serviceable.
// First digit of an Indian PIN indicates the region/state group.
// We "deliver" to all 6-digit valid Indian pincodes by default.
const SERVICEABLE_FIRST_DIGITS = new Set(["1", "2", "3", "4", "5", "6", "7", "8"]);

const checkPincode = async (pincode) => {
  if (!/^\d{6}$/.test(pincode)) {
    return { ok: false, message: "Pincode must be 6 digits" };
  }

  if (!SERVICEABLE_FIRST_DIGITS.has(pincode[0])) {
    return { ok: false, message: "Sorry, we don't deliver to this region yet" };
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();

    if (!Array.isArray(data) || data[0]?.Status !== "Success") {
      return { ok: false, message: "Invalid pincode" };
    }

    const postOffice = data[0].PostOffice?.[0];
    if (!postOffice) {
      return { ok: false, message: "Invalid pincode" };
    }

    return {
      ok: true,
      message: `Delivery available — ${postOffice.District}, ${postOffice.State}`,
      city: postOffice.District,
      state: postOffice.State,
      etaDays: postOffice.State === "Delhi" || postOffice.State === "Maharashtra" ? 2 : 4,
    };
  } catch (err) {
    return {
      ok: false,
      message: "Could not verify pincode. Please try again.",
    };
  }
};

module.exports = { checkPincode };
