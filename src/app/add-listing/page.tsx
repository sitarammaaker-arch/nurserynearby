"use client";
import { useState } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { CATEGORIES, CITIES } from "@/lib/utils";
import ImageUploader from "@/components/ui/ImageUploader";

export default function AddListingPage() {
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error,   setError]     = useState("");
  const [selCats, setSelCats]   = useState<string[]>([]);
  const [images,  setImages]    = useState<{url:string;publicId:string;thumbnail:string}[]>([]);
  const [locating, setLocating]  = useState(false);
  const [locError, setLocError]  = useState("");
  const [latLng,   setLatLng]    = useState({ lat: "", lng: "" });
  const [pincode,  setPincode]   = useState("");
  const [pinLookup,setPinLookup] = useState<any>(null);
  const [pinLoading,setPinLoading] = useState(false);
  const [pinError,  setPinError]  = useState("");
  const [cityInput, setCityInput] = useState("");
  const [stateInput,setStateInput]= useState("");
  const [distInput, setDistInput] = useState("");

  async function lookupPincode(pin: string) {
    if (pin.length !== 6) return;
    setPinLoading(true); setPinError(""); setPinLookup(null);
    try {
      const res  = await fetch(`/api/pincode-lookup?pin=${pin}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Not found");
      setPinLookup(data);
      if (data.state)    setStateInput(data.state);
      if (data.district) setDistInput(data.district);
      // Use matched city from DB or district name as city
      if (data.cityDb?.name) setCityInput(data.cityDb.name);
      else if (data.district)  setCityInput(data.district);
    } catch (e: any) {
      setPinError(e.message);
    } finally {
      setPinLoading(false);
    }
  }

  const toggleCat = (slug: string) =>
    setSelCats((p) => p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd   = new FormData(e.currentTarget);
    const body = {
      name:         fd.get("name"),
      tagline:      fd.get("tagline"),
      description:  fd.get("description"),
      phone:        fd.get("phone"),
      phone2:       fd.get("phone2"),
      whatsapp:     fd.get("whatsapp"),
      email:        fd.get("email"),
      website:      fd.get("website"),
      address:      fd.get("address"),
      area:         fd.get("area"),
      landmark:     fd.get("landmark"),
      pincode:      fd.get("pincode"),
      cityId:       pinLookup?.cityDb?.id ?? pinLookup?.cityDb?.slug ?? fd.get("cityId") ?? cityInput,
      cityName:     cityInput || distInput,
      stateName:    stateInput,
      districtName: distInput,
      openingHours: fd.get("openingHours"),
      established:  fd.get("established"),
      categories:   selCats,
      images:       images.map((img, i) => ({ url: img.url, isPrimary: i === 0 })),
      latitude:     latLng.lat || null,
      longitude:    latLng.lng || null,
    };

    try {
      const res = await fetch("/api/add-listing", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center gradient-sage px-4">
        <div className="card p-12 text-center max-w-md w-full shadow-lifted">
          <div className="w-20 h-20 gradient-forest rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-green">🎉</div>
          <h1 className="font-display text-3xl font-bold text-forest-900 mb-2">You're Listed!</h1>
          <p className="text-gray-500 mb-6">Your nursery is now live on NurseryNearby. Plant lovers in your city can find you right now!</p>
          <div className="flex flex-col gap-3">
            <a href="/nursery/all" className="btn btn-primary justify-center">Browse All Nurseries</a>
            <a href="/add-listing" className="btn btn-ghost justify-center text-sm text-gray-500" onClick={() => setSuccess(false)}>Add another nursery</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <main className="gradient-sage min-h-screen py-12">
        <div className="container max-w-3xl">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 gradient-forest rounded-2xl mb-5 shadow-green text-3xl">🌿</div>
            <h1 className="font-display text-4xl font-bold text-forest-900 mb-2">List Your Nursery Free</h1>
            <p className="text-gray-500">Fill in the details below — your nursery goes live immediately.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Basic Info ── */}
            <div className="card p-7 space-y-5">
              <h2 className="font-display text-xl font-bold text-forest-900 border-b border-gray-100 pb-3">
                Basic Information
              </h2>

              <div>
                <label className="label">Nursery Name <span className="text-red-500">*</span></label>
                <input name="name" required placeholder="e.g. Green Paradise Nursery" className="input-lg" />
              </div>

              <div>
                <label className="label">Tagline <span className="text-gray-400 normal-case font-normal text-xs">(optional)</span></label>
                <input name="tagline" placeholder="e.g. Where plants find their home" className="input" />
              </div>

              <div>
                <label className="label">About Your Nursery <span className="text-gray-400 normal-case font-normal text-xs">(optional)</span></label>
                <textarea name="description" rows={4}
                  placeholder="Tell customers about your specialties, plant varieties, services offered…"
                  className="textarea" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Opening Hours</label>
                  <input name="openingHours" placeholder="e.g. Mon–Sun 8AM–8PM" className="input" />
                </div>
                <div>
                  <label className="label">Established Year</label>
                  <input name="established" type="number" placeholder="e.g. 1998" min="1900" max="2025" className="input" />
                </div>
              </div>
            </div>

            {/* ── Contact Info ── */}
            <div className="card p-7 space-y-5">
              <h2 className="font-display text-xl font-bold text-forest-900 border-b border-gray-100 pb-3">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone Number <span className="text-red-500">*</span></label>
                  <input name="phone" required type="tel" placeholder="+91 98100 00000" className="input" />
                </div>
                <div>
                  <label className="label">WhatsApp Number</label>
                  <input name="whatsapp" type="tel" placeholder="9810000000 (without +91)" className="input" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email Address</label>
                  <input name="email" type="email" placeholder="nursery@example.com" className="input" />
                </div>
                <div>
                  <label className="label">Alternate Phone</label>
                  <input name="phone2" type="tel" placeholder="+91 98100 00001" className="input" />
                </div>
              </div>

              <div>
                <label className="label">Website</label>
                <input name="website" type="url" placeholder="https://yourwebsite.com" className="input" />
              </div>
            </div>

            {/* ── Location ── */}
            <div className="card p-7 space-y-5">
              <h2 className="font-display text-xl font-bold text-forest-900 border-b border-gray-100 pb-3">
                Location
              </h2>

              {/* STEP 1 — Pincode auto-detect */}
              <div>
                <label className="label">
                  Pincode <span className="text-red-500">*</span>
                  <span className="text-gray-400 normal-case font-normal text-xs ml-1">
                    (6-digit — auto-fills State, District & City)
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    name="pincode"
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g,"").slice(0,6);
                      setPincode(val);
                      if (val.length === 6) lookupPincode(val);
                      else { setPinLookup(null); setPinError(""); }
                    }}
                    placeholder="110001"
                    maxLength={6}
                    className="input flex-1 text-lg font-semibold tracking-widest"
                  />
                  {pinLoading && (
                    <div className="flex items-center px-3">
                      <svg className="animate-spin w-5 h-5 text-forest" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                      </svg>
                    </div>
                  )}
                </div>
                {pinError && <p className="text-xs text-red-500 mt-1">⚠️ {pinError} — please fill manually below</p>}

                {/* Auto-detected location */}
                {pinLookup && (
                  <div className="mt-3 bg-forest-50 border border-forest-100 rounded-xl p-4 space-y-1">
                    <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2">✅ Location Detected</p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-2xs text-gray-400 uppercase tracking-wide">State</p>
                        <p className="font-semibold text-gray-800">{pinLookup.state}</p>
                      </div>
                      <div>
                        <p className="text-2xs text-gray-400 uppercase tracking-wide">District</p>
                        <p className="font-semibold text-gray-800">{pinLookup.district}</p>
                      </div>
                      <div>
                        <p className="text-2xs text-gray-400 uppercase tracking-wide">City/Town</p>
                        <p className="font-semibold text-gray-800">{cityInput}</p>
                      </div>
                    </div>
                    {pinLookup.postOffices?.length > 0 && (
                      <p className="text-2xs text-gray-400 mt-2">
                        Post offices: {pinLookup.postOffices.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 2 — Manual overrides if pincode lookup fails */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">State <span className="text-red-500">*</span></label>
                  <input
                    name="stateName"
                    value={stateInput}
                    onChange={(e) => setStateInput(e.target.value)}
                    required
                    placeholder="e.g. Haryana"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">District <span className="text-red-500">*</span></label>
                  <input
                    name="districtName"
                    value={distInput}
                    onChange={(e) => setDistInput(e.target.value)}
                    required
                    placeholder="e.g. Karnal"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">City / Town <span className="text-red-500">*</span></label>
                  <input
                    name="cityName"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    required
                    placeholder="e.g. Karnal"
                    className="input"
                  />
                </div>
              </div>

              {/* Hidden legacy field for backward compat */}
              <input type="hidden" name="cityId" value={pinLookup?.cityDb?.id ?? cityInput} />

              <div>
                <label className="label">Full Address <span className="text-red-500">*</span></label>
                <input name="address" required placeholder="e.g. 15, Model Town Phase 2, Near Bus Stand" className="input" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Area / Locality</label>
                  <input name="area" placeholder="e.g. Model Town, Sector 10" className="input" />
                </div>
                <div>
                  <label className="label">Landmark</label>
                  <input name="landmark" placeholder="e.g. Near Metro Station" className="input" />
                </div>
              </div>

              {/* Geotagging */}
              <div>
                <label className="label">
                  GPS Location
                  <span className="text-gray-400 normal-case font-normal text-xs ml-1">(optional — helps customers find you on map)</span>
                </label>

                {/* Get location button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!navigator.geolocation) {
                      setLocError("Geolocation not supported by your browser");
                      return;
                    }
                    setLocating(true);
                    setLocError("");
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setLatLng({
                          lat: pos.coords.latitude.toFixed(6),
                          lng: pos.coords.longitude.toFixed(6),
                        });
                        setLocating(false);
                      },
                      (err) => {
                        setLocError("Could not get location. Please enter manually or allow location access.");
                        setLocating(false);
                      },
                      { enableHighAccuracy: true, timeout: 10000 }
                    );
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border-2 transition-all mb-3 ${
                    latLng.lat
                      ? "border-forest bg-forest-50 text-forest"
                      : "border-gray-200 hover:border-forest-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {locating ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-forest" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                      </svg>
                      Getting your location…
                    </>
                  ) : latLng.lat ? (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-forest">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                      </svg>
                      ✓ Location captured — click to update
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                      </svg>
                      📍 Use My Current Location
                    </>
                  )}
                </button>

                {/* Show captured coordinates */}
                {latLng.lat && (
                  <div className="flex items-center gap-2 mb-3 bg-forest-50 border border-forest-100 rounded-xl px-4 py-2.5">
                    <span className="text-forest text-lg">📌</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-forest">Location captured!</p>
                      <p className="text-2xs text-gray-500">Lat: {latLng.lat} · Lng: {latLng.lng}</p>
                    </div>
                    <button type="button" onClick={() => setLatLng({ lat: "", lng: "" })}
                      className="text-gray-400 hover:text-red-500 text-xs font-bold">✕ Clear</button>
                  </div>
                )}

                {/* Error */}
                {locError && (
                  <p className="text-xs text-red-600 mb-3 flex items-center gap-1">
                    <span>⚠️</span> {locError}
                  </p>
                )}

                {/* Manual entry */}
                <details className="group">
                  <summary className="text-xs text-forest cursor-pointer hover:underline select-none list-none flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current transition-transform group-open:rotate-90">
                      <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                    </svg>
                    Or enter coordinates manually
                  </summary>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="label text-2xs">Latitude</label>
                      <input
                        type="number" step="0.000001"
                        value={latLng.lat}
                        onChange={(e) => setLatLng((p) => ({ ...p, lat: e.target.value }))}
                        placeholder="e.g. 28.704060"
                        className="input text-sm"
                      />
                    </div>
                    <div>
                      <label className="label text-2xs">Longitude</label>
                      <input
                        type="number" step="0.000001"
                        value={latLng.lng}
                        onChange={(e) => setLatLng((p) => ({ ...p, lng: e.target.value }))}
                        placeholder="e.g. 77.102493"
                        className="input text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-2xs text-gray-400 mt-2">
                    💡 Find coordinates: Open Google Maps → right-click your location → copy the numbers
                  </p>
                </details>
              </div>
            </div>

            {/* ── Photos ── */}
            <div className="card p-7">
              <h2 className="font-display text-xl font-bold text-forest-900 border-b border-gray-100 pb-3 mb-5">
                Photos <span className="text-gray-400 normal-case font-normal text-sm">(optional but recommended)</span>
              </h2>
              <ImageUploader
                value={images}
                onChange={setImages}
                maxImages={5}
                folder="nurseries"
                label=""
              />
            </div>

            {/* ── Categories ── */}
            <div className="card p-7">
              <h2 className="font-display text-xl font-bold text-forest-900 border-b border-gray-100 pb-3 mb-5">
                Plant Categories
              </h2>
              <p className="text-sm text-gray-500 mb-4">Select all that apply to your nursery:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((c) => {
                  const on = selCats.includes(c.slug);
                  return (
                    <button key={c.slug} type="button" onClick={() => toggleCat(c.slug)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        on ? "border-forest bg-forest-50 shadow-green" : "border-gray-200 hover:border-forest-200 hover:bg-gray-50"
                      }`}>
                      <span className="text-2xl">{c.icon}</span>
                      <span className={`text-sm font-semibold ${on ? "text-forest" : "text-gray-700"}`}>{c.name}</span>
                      {on && <span className="ml-auto text-forest text-lg">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-red-500 text-xl shrink-0">⚠️</span>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn btn-primary w-full justify-center btn-lg disabled:opacity-60 text-base">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                  </svg>
                  Submitting…
                </span>
              ) : (
                <>🌱 Submit Free Listing — Go Live Now</>
              )}
            </button>

            <p className="text-xs text-center text-gray-400 pb-4">
              Free forever · No credit card · Listed immediately · No spam
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
