// lib/geocoding.ts
// Location validation. Uses Nominatim (free, no API key) by default.
// Switch to Google Places or Mapbox for production if desired.

interface GeocodeResult {
  display_name: string;
  lat: number;
  lng: number;
  country: string;
  region ? : string;
  city ? : string;
}

export async function validateLocation(
  query: string,
  expectedCountry: string
): Promise < { ok: true;result: GeocodeResult } | { ok: false;error: string } > {
  if (!query.trim()) {
    return { ok: false, error: 'Please enter a location' };
  }
  
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=1&addressdetails=1`;
  
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PrimeMart/1.0 (geocoding)' },
    });
    if (!res.ok) return { ok: false, error: 'Could not verify location' };
    
    const data = (await res.json()) as Array < {
      display_name: string;
      lat: string;
      lon: string;
      address: { country_code ? : string;state ? : string;city ? : string;town ? : string;village ? : string };
    } > ;
    
    if (data.length === 0) {
      return { ok: false, error: 'Location not found' };
    }
    
    const first = data[0];
    const countryCode = first.address.country_code?.toUpperCase();
    if (countryCode !== expectedCountry.toUpperCase()) {
      return {
        ok: false,
        error: `This location appears to be in ${countryCode}, not ${expectedCountry}`,
      };
    }
    
    return {
      ok: true,
      result: {
        display_name: first.display_name,
        lat: parseFloat(first.lat),
        lng: parseFloat(first.lon),
        country: countryCode,
        region: first.address.state,
        city: first.address.city || first.address.town || first.address.village,
      },
    };
  } catch {
    return { ok: false, error: 'Location verification failed' };
  }
}