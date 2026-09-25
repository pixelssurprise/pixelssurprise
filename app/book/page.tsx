"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function BookFormContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Dynamic Options fetched from Supabase (Managed via Admin Dashboard)
  const [dbGames, setDbGames] = useState<any[]>([]);
  const [dbSurpriseModules, setDbSurpriseModules] = useState<any[]>([]);
  const [dbInviteModules, setDbInviteModules] = useState<any[]>([]);
  const [dbEventTypes, setDbEventTypes] = useState<any[]>([]);

  // Form State
  const [orderType, setOrderType] = useState<"surprise" | "invitation">("surprise");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  
  // Real-time error state tracking
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Surprise Specific Options
  const [surpriseEvent, setSurpriseEvent] = useState("Birthday Surprise");
  const [otherSurpriseEvent, setOtherSurpriseEvent] = useState("");
  
  const [selectedGames, setSelectedGames] = useState<string[]>(["Love Quiz"]);

  // Surprise Checklist Modules
  const [surpriseModules, setSurpriseModules] = useState({
    photos: true,
    videos: false,
    jokes: false,
    journey: false,
    specialMoment: false,
    letter: true,
    spotifyMusic: true,
    passwordLock: false,
    envelopeEntry: true,
    confetti: false,
    sideConfetti: false,
    curtainsOpening: false,
    virtualCake: false,
    blowCandles: false,
    makeAWish: false,
  });

  // Admin-added dynamic modules selection
  const [selectedAdminSurpriseModules, setSelectedAdminSurpriseModules] = useState<string[]>([]);
  const [selectedAdminInviteModules, setSelectedAdminInviteModules] = useState<string[]>([]);

  // Surprise Module Inputs
  const [photoCount, setPhotoCount] = useState(5);
  const [videoCount, setVideoCount] = useState(1);
  const [driveLink, setDriveLink] = useState("");
  const [anyLink, setAnyLink] = useState("");
  const [jokesContent, setJokesContent] = useState("");
  const [journeyContent, setJourneyContent] = useState("");
  const [specialMomentContent, setSpecialMomentContent] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [songName, setSongName] = useState("");
  const [passwordIdea, setPasswordIdea] = useState("");

  // Invitation Specific Options
  const [invitationType, setInvitationType] = useState("Royal Wedding Invitation");
  const [otherInvitationType, setOtherInvitationType] = useState("");
  
  // Wedding Specific Inputs
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [weddingStory, setWeddingStory] = useState("");
  
  const availableFunctions = ["Haldi", "Sangeet", "Mehendi", "Wedding Ceremony / Saptapadi", "Reception", "Cocktail Party", "Engagement", "Other Ceremony"];
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(["Wedding Ceremony / Saptapadi", "Reception"]);
  const [functionDetails, setFunctionDetails] = useState<Record<string, { date: string; time: string; venue: string }>>({});

  const [invitationModules, setInvitationModules] = useState({
    familyIntro: false,
    invitors: false,
    schedule: false,
    foodSchedule: false,
    mapAddress: false,
    mediaGallery: false,
  });

  const [familyDetails, setFamilyDetails] = useState("");
  const [invitorsDetails, setInvitorsDetails] = useState("");
  const [scheduleDetails, setScheduleDetails] = useState("");
  const [foodDetails, setFoodDetails] = useState("");
  const [mapAddressDetails, setMapAddressDetails] = useState("");
  const [inviteDriveLink, setInviteDriveLink] = useState("");

  const [visionIdea, setVisionIdea] = useState("");
  const [addonFastDelivery, setAddonFastDelivery] = useState(false);

  // 🔒 AUTH CHECK & FETCH ALL ADMIN OPTIONS ON MOUNT
  useEffect(() => {
    async function checkUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const currentUrl = `${pathname}?${searchParams.toString()}`;
        router.replace(`/auth?next=${encodeURIComponent(currentUrl)}`);
        return;
      }

      setUser(session.user);
      if (session.user.email) {
        setCustomerEmail(session.user.email);
      }
      
      const { data: optionsData } = await supabase.from("book_form_options").select("*");
      if (optionsData) {
        setDbGames(optionsData.filter((o) => o.option_type === "game"));
        setDbSurpriseModules(optionsData.filter((o) => o.option_type === "surprise_module"));
        setDbInviteModules(optionsData.filter((o) => o.option_type === "invitation_module"));
        setDbEventTypes(optionsData.filter((o) => o.option_type === "event_type"));
      }

      setCheckingAuth(false);
    }

    checkUserSession();
  }, [router, pathname, searchParams]);

  const minDeliveryDate = new Date();
  minDeliveryDate.setDate(minDeliveryDate.getDate() + 2);
  const minDateString = minDeliveryDate.toISOString().split("T")[0];

  const handleDateChange = (dateVal: string) => {
    setDeliveryDate(dateVal);
    if (!dateVal) return;

    if (dateVal === minDateString) {
      setAddonFastDelivery(true);
    } else {
      setAddonFastDelivery(false);
    }
  };

  const handleUrgentCheckboxChange = (checked: boolean) => {
    if (!checked && deliveryDate === minDateString) {
      alert("Since your delivery date is set to 2 days from today, urgent priority is required. Please choose a later delivery date (3+ days out) if you wish to remove urgent priority.");
      return;
    }
    setAddonFastDelivery(checked);
  };

  const calculateTotal = () => {
    let base = 649;
    if (orderType === "surprise" && selectedGames.length > 2) {
      base += (selectedGames.length - 2) * 30;
    }
    if (surpriseModules.photos || invitationModules.mediaGallery) {
      if (photoCount > 5) base += (photoCount - 5) * 10;
      if (videoCount > 1) base += (videoCount - 1) * 30;
    }
    if (orderType === "invitation" && invitationType === "Royal Wedding Invitation" && selectedFunctions.length > 2) {
      base += (selectedFunctions.length - 2) * 59;
    }
    if (addonFastDelivery) base += 100;
    return base;
  };

  const totalPrice = calculateTotal();
  const advanceAmount = Math.round(totalPrice / 2);

  const validateName = (val: string) => {
    setCustomerName(val);
    if (!val.trim()) {
      setErrors((prev) => ({ ...prev, name: "Full name is required." }));
    } else if (/\d/.test(val)) {
      setErrors((prev) => ({ ...prev, name: "Name cannot contain numbers or digits." }));
    } else {
      setErrors((prev) => { const copy = { ...prev }; delete copy.name; return copy; });
    }
  };

  const validateBrideName = (val: string) => {
    setBrideName(val);
    if (!val.trim()) {
      setErrors((prev) => ({ ...prev, bride: "Bride's name is required." }));
    } else if (/\d/.test(val)) {
      setErrors((prev) => ({ ...prev, bride: "Bride's name cannot contain numbers." }));
    } else {
      setErrors((prev) => { const copy = { ...prev }; delete copy.bride; return copy; });
    }
  };

  const validateGroomName = (val: string) => {
    setGroomName(val);
    if (!val.trim()) {
      setErrors((prev) => ({ ...prev, groom: "Groom's name is required." }));
    } else if (/\d/.test(val)) {
      setErrors((prev) => ({ ...prev, groom: "Groom's name cannot contain numbers." }));
    } else {
      setErrors((prev) => { const copy = { ...prev }; delete copy.groom; return copy; });
    }
  };

  const validateMapAddress = (val: string) => {
    setMapAddressDetails(val);
    if (!val.trim()) {
      setErrors((prev) => ({ ...prev, map: "Venue address and map link are required." }));
    } else if (val.length < 10) {
      setErrors((prev) => ({ ...prev, map: "Please provide a more detailed venue address." }));
    } else {
      setErrors((prev) => { const copy = { ...prev }; delete copy.map; return copy; });
    }
  };

  const validatePhone = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    setCustomerPhone(cleaned);
    if (!cleaned) {
      setErrors((prev) => ({ ...prev, phone: "WhatsApp number is required." }));
    } else if (cleaned.length < 10) {
      setErrors((prev) => ({ ...prev, phone: "Phone number must be exactly 10 digits." }));
    } else {
      setErrors((prev) => { const copy = { ...prev }; delete copy.phone; return copy; });
    }
  };

  const validateSurpriseDriveUrl = (val: string) => {
    setDriveLink(val);
    if (val.trim() && !val.startsWith("http://") && !val.startsWith("https://")) {
      setErrors((prev) => ({ ...prev, drive: "Link must start with http:// or https://" }));
    } else {
      setErrors((prev) => { const copy = { ...prev }; delete copy.drive; return copy; });
    }
  };

  const validateInviteDriveUrl = (val: string) => {
    setInviteDriveLink(val);
    if (val.trim() && !val.startsWith("http://") && !val.startsWith("https://")) {
      setErrors((prev) => ({ ...prev, inviteDrive: "Link must start with http:// or https://" }));
    } else {
      setErrors((prev) => { const copy = { ...prev }; delete copy.inviteDrive; return copy; });
    }
  };

  const validateAnyLink = (val: string) => {
    setAnyLink(val);
    if (val.trim() && !val.startsWith("http://") && !val.startsWith("https://")) {
      setErrors((prev) => ({ ...prev, anyLink: "Link must start with http:// or https://" }));
    } else {
      setErrors((prev) => { const copy = { ...prev }; delete copy.anyLink; return copy; });
    }
  };

  const handleGameToggle = (game: string) => {
    if (selectedGames.includes(game)) {
      setSelectedGames(selectedGames.filter((g) => g !== game));
    } else {
      setSelectedGames([...selectedGames, game]);
    }
  };

  const handleFunctionToggle = (func: string) => {
    if (selectedFunctions.includes(func)) {
      setSelectedFunctions(selectedFunctions.filter((f) => f !== func));
    } else {
      setSelectedFunctions([...selectedFunctions, func]);
    }
  };

  const handleFunctionDetailChange = (func: string, field: "date" | "time" | "venue", val: string) => {
    setFunctionDetails({
      ...functionDetails,
      [func]: {
        ...(functionDetails[func] || { date: "", time: "", venue: "" }),
        [field]: val,
      },
    });
  };

  const handleSurpriseModuleToggle = (key: keyof typeof surpriseModules) => {
    setSurpriseModules({ ...surpriseModules, [key]: !surpriseModules[key] });
  };

  const handleAdminSurpriseModuleToggle = (label: string) => {
    if (selectedAdminSurpriseModules.includes(label)) {
      setSelectedAdminSurpriseModules(selectedAdminSurpriseModules.filter((m) => m !== label));
    } else {
      setSelectedAdminSurpriseModules([...selectedAdminSurpriseModules, label]);
    }
  };

  const handleAdminInviteModuleToggle = (label: string) => {
    if (selectedAdminInviteModules.includes(label)) {
      setSelectedAdminInviteModules(selectedAdminInviteModules.filter((m) => m !== label));
    } else {
      setSelectedAdminInviteModules([...selectedAdminInviteModules, label]);
    }
  };

  const handleInvitationModuleToggle = (key: keyof typeof invitationModules) => {
    setInvitationModules({ ...invitationModules, [key]: !invitationModules[key] });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      const currentUrl = `${pathname}?${searchParams.toString()}`;
      router.replace(`/auth?next=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (Object.keys(errors).length > 0 || !customerName || !customerPhone || !deliveryDate) {
      alert("Please fix all validation errors before proceeding.");
      return;
    }

    setLoading(true);
    const trackingNumber = "PX-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    const orderPayload = {
      user_id: user.id,
      tracking_number: trackingNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      user_email: customerEmail || user.email,
      order_type: "custom_booking",
      total_amount: totalPrice,
      advance_paid: advanceAmount,
      balance_due: totalPrice - advanceAmount,
      payment_status: "pending_advance",
      delivery_status: "processing",
      items: {
        type: orderType,
        delivery_date: deliveryDate,
        urgent_delivery: addonFastDelivery,
        surprise_details: orderType === "surprise" ? {
          event: surpriseEvent === "Other" ? otherSurpriseEvent : surpriseEvent,
          games: selectedGames,
          modules: surpriseModules,
          admin_modules: selectedAdminSurpriseModules,
          photo_count: surpriseModules.photos ? photoCount : 0,
          video_count: surpriseModules.videos ? videoCount : 0,
          drive_link: surpriseModules.photos || surpriseModules.videos ? driveLink : null,
          any_link: anyLink || null,
          jokes: surpriseModules.jokes ? jokesContent : null,
          journey: surpriseModules.journey ? journeyContent : null,
          special_moment: surpriseModules.specialMoment ? specialMomentContent : null,
          letter: surpriseModules.letter ? letterContent : null,
          song_name: surpriseModules.spotifyMusic ? songName : null,
          password_lock_idea: surpriseModules.passwordLock ? passwordIdea : null,
        } : null,
        invitation_details: orderType === "invitation" ? {
          invitation_type: invitationType === "Other" ? otherInvitationType : invitationType,
          wedding_info: invitationType === "Royal Wedding Invitation" ? {
            bride_name: brideName,
            groom_name: groomName,
            story: weddingStory,
            selected_functions: selectedFunctions,
            functions_breakdown: functionDetails,
          } : null,
          modules: invitationModules,
          admin_modules: selectedAdminInviteModules,
          photo_count: invitationModules.mediaGallery ? photoCount : 0,
          video_count: invitationModules.mediaGallery ? videoCount : 0,
          drive_link: invitationModules.mediaGallery ? inviteDriveLink : null,
          any_link: anyLink || null,
          family_intro: invitationModules.familyIntro ? familyDetails : null,
          invitors: invitationModules.invitors ? invitorsDetails : null,
          schedule: invitationModules.schedule ? scheduleDetails : null,
          food_schedule: invitationModules.foodSchedule ? foodDetails : null,
          map_address: invitationModules.mapAddress ? mapAddressDetails : null,
        } : null,
        vision_idea: visionIdea,
      },
    };

    const { error } = await supabase.from("orders").insert([orderPayload]);

    if (error) {
      alert("Error submitting booking: " + error.message);
      setLoading(false);
    } else {
      router.push(`/payment?tracking=${trackingNumber}&amount=${advanceAmount}`);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#050811] text-white flex items-center justify-center font-serif text-lg">
        Verifying secure user session... ✨
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050811] text-[#fcebed] px-4 sm:px-6 py-10 max-w-4xl mx-auto space-y-10">
      
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#131b2e] border border-[#3b5078] text-rose-200 text-[11px] font-mono uppercase tracking-widest mx-auto">
          ✨ Logged in as: {user?.email}
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
          Book Your Custom Website
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto leading-relaxed">
          Select your event, custom mini-games, and interactive features with instant real-time validation.
        </p>
      </div>

      <form onSubmit={handleSubmitBooking} className="space-y-8">
        
        {/* Step 1: Category Selector */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <label className="block font-serif text-lg text-rose-100 font-medium">1. Select Keepsake Category</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setOrderType("surprise")}
              className={`p-5 rounded-xl text-left transition cursor-pointer border ${
                orderType === "surprise"
                  ? "bg-rose-gradient text-stone-950 font-bold border-transparent shadow-lg"
                  : "bg-[#050811] border-brand-border text-stone-400 hover:text-white"
              }`}
            >
              <span className="text-lg block mb-1 font-serif">🎁 Interactive Surprise Website</span>
              <p className="text-xs font-normal opacity-90">Birthdays, Proposals, Apologies & Anniversaries. (Base: ₹649)</p>
            </button>

            <button
              type="button"
              onClick={() => setOrderType("invitation")}
              className={`p-5 rounded-xl text-left transition cursor-pointer border ${
                orderType === "invitation"
                  ? "bg-rose-gradient text-stone-950 font-bold border-transparent shadow-lg"
                  : "bg-[#050811] border-brand-border text-stone-400 hover:text-white"
              }`}
            >
              <span className="text-lg block mb-1 font-serif">💌 Royal Digital Invitation</span>
              <p className="text-xs font-normal opacity-90">Weddings, Engagements, Baby Showers & Ceremonies. (Base: ₹649)</p>
            </button>
          </div>
        </div>

        {/* Step 2A: Surprise Options */}
        {orderType === "surprise" && (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
            <h3 className="font-serif text-lg text-rose-100 font-medium">2. Surprise Occasion & Features</h3>
            
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 font-mono">
                Select Occasion / Event Type
              </label>
              <select
                value={surpriseEvent}
                onChange={(e) => setSurpriseEvent(e.target.value)}
                className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-400 cursor-pointer"
              >
                <option value="Birthday Surprise">Birthday Surprise</option>
                <option value="Proposal Website">Proposal Website</option>
                <option value="Apology Website">Apology Website</option>
                <option value="Father's Day / Mother's Day">Father's Day / Mother's Day</option>
                <option value="Friendship Day">Friendship Day</option>
                <option value="Valentine's Day">Valentine's Day</option>
                <option value="Anniversary Wish">Anniversary Wish</option>
                {dbEventTypes.map((et) => (
                  <option key={et.id} value={et.label}>{et.label}</option>
                ))}
                <option value="Other">Other (Custom Occasion)</option>
              </select>

              {surpriseEvent === "Other" && (
                <input
                  type="text"
                  placeholder="Specify custom occasion..."
                  value={otherSurpriseEvent}
                  onChange={(e) => setOtherSurpriseEvent(e.target.value)}
                  className="w-full mt-3 bg-[#050811] border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white"
                  required
                />
              )}
            </div>

            {/* Mini Games */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider font-mono">
                Select Mini-Games (First 2 included free, +₹30 per extra game)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Love Quiz", "Memory Match", "Catch the Gift", "Tic Tac Toe", "Archery to Heart", "Balloon Pop"].map((game) => (
                  <button
                    type="button"
                    key={game}
                    onClick={() => handleGameToggle(game)}
                    className={`p-3 rounded-xl text-xs font-medium transition text-center cursor-pointer border ${
                      selectedGames.includes(game)
                        ? "bg-rose-gradient text-stone-950 font-bold border-transparent"
                        : "bg-[#050811] border-brand-border text-stone-400 hover:text-white"
                    }`}
                  >
                    {game} {selectedGames.includes(game) && "✓"}
                  </button>
                ))}
                {dbGames.map((g) => (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => handleGameToggle(g.label)}
                    className={`p-3 rounded-xl text-xs font-medium transition text-center cursor-pointer border ${
                      selectedGames.includes(g.label)
                        ? "bg-rose-gradient text-stone-950 font-bold border-transparent"
                        : "bg-[#050811] border-brand-border text-stone-400 hover:text-white"
                    }`}
                  >
                    {g.label} {selectedGames.includes(g.label) && "✓"}
                  </button>
                ))}
              </div>
            </div>

            {/* Surprise Modules Checklist */}
            <div className="pt-2 border-t border-brand-border space-y-4">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider font-mono">
                Select Interactive Modules & Animations to Include
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { key: "photos", label: "Photo Gallery (First 5 free, max 12)" },
                  { key: "videos", label: "Video Showcase (First 1 free, max 4)" },
                  { key: "jokes", label: "Inside Jokes Section" },
                  { key: "journey", label: "Our Journey / Timeline" },
                  { key: "specialMoment", label: "Special Memory Highlight" },
                  { key: "letter", label: "Secret Letter / Love Note" },
                  { key: "spotifyMusic", label: "Spotify Music Dedication Player" },
                  { key: "passwordLock", label: "Password, Lock or Special Unlock Idea" },
                  { key: "envelopeEntry", label: "Envelope Opening Entry" },
                  { key: "confetti", label: "Confetti Burst Animation" },
                  { key: "sideConfetti", label: "2-Side Confetti Cannons" },
                  { key: "curtainsOpening", label: "Curtains Opening Reveal" },
                  { key: "virtualCake", label: "Virtual Cake Cutting" },
                  { key: "blowCandles", label: "Blow Out Candles Interactive" },
                  { key: "makeAWish", label: "Make a Wish Feature" },
                ].map((mod) => (
                  <label key={mod.key} className="flex items-center gap-2.5 p-3 bg-[#050811] border border-brand-border rounded-xl cursor-pointer hover:border-rose-400 transition">
                    <input
                      type="checkbox"
                      checked={surpriseModules[mod.key as keyof typeof surpriseModules]}
                      onChange={() => handleSurpriseModuleToggle(mod.key as keyof typeof surpriseModules)}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <span className="text-stone-300 font-medium">{mod.label}</span>
                  </label>
                ))}

                {dbSurpriseModules.map((admMod) => (
                  <label key={admMod.id} className="flex items-center gap-2.5 p-3 bg-[#050811] border border-brand-border rounded-xl cursor-pointer hover:border-rose-400 transition">
                    <input
                      type="checkbox"
                      checked={selectedAdminSurpriseModules.includes(admMod.label)}
                      onChange={() => handleAdminSurpriseModuleToggle(admMod.label)}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <span className="text-stone-300 font-medium">{admMod.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Inputs */}
            <div className="space-y-4 pt-2">
              {(surpriseModules.photos || surpriseModules.videos) && (
                <div className="p-4 bg-[#050811] border border-brand-border rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    {surpriseModules.photos && (
                      <div>
                        <label className="block text-stone-400 text-xs mb-1">Total Photos (Max 12)</label>
                        <input type="number" min="1" max="12" value={photoCount} onChange={(e) => setPhotoCount(Math.min(12, Math.max(1, Number(e.target.value))))} className="w-full bg-brand-card border border-brand-border rounded-xl p-2 text-xs text-white" />
                      </div>
                    )}
                    {surpriseModules.videos && (
                      <div>
                        <label className="block text-stone-400 text-xs mb-1">Total Videos (Max 4)</label>
                        <input type="number" min="1" max="4" value={videoCount} onChange={(e) => setVideoCount(Math.min(4, Math.max(1, Number(e.target.value))))} className="w-full bg-brand-card border border-brand-border rounded-xl p-2 text-xs text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-stone-400 text-xs mb-1">Google Drive Link for Photos & Videos <span className="text-rose-400">*</span></label>
                    <input type="text" placeholder="https://drive.google.com/..." value={driveLink} onChange={(e) => validateSurpriseDriveUrl(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-xl p-2.5 text-xs text-white" required={surpriseModules.photos || surpriseModules.videos} />
                    {errors.drive && <p className="text-rose-400 text-[11px] mt-1">⚠️ {errors.drive}</p>}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-stone-400 text-xs mb-1">Any Other Reference Link (Optional)</label>
                <input type="text" placeholder="https://instagram.com/..." value={anyLink} onChange={(e) => validateAnyLink(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-2.5 text-xs text-white" />
                {errors.anyLink && <p className="text-rose-400 text-[11px] mt-1">⚠️ {errors.anyLink}</p>}
              </div>

              {surpriseModules.jokes && (
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Inside Jokes Content <span className="text-rose-400">*</span></label>
                  <textarea rows={2} placeholder="Write your funny inside jokes here..." value={jokesContent} onChange={(e) => setJokesContent(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}

              {surpriseModules.journey && (
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Journey / Timeline Milestones <span className="text-rose-400">*</span></label>
                  <textarea rows={2} placeholder="2023 - Met at college, 2024 - First trip..." value={journeyContent} onChange={(e) => setJourneyContent(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}

              {surpriseModules.specialMoment && (
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Special Memory Details <span className="text-rose-400">*</span></label>
                  <textarea rows={2} placeholder="Describe your most treasured moment together..." value={specialMomentContent} onChange={(e) => setSpecialMomentContent(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}

              {surpriseModules.letter && (
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Secret Letter Content <span className="text-rose-400">*</span></label>
                  <textarea rows={3} placeholder="Write your heartfelt note here..." value={letterContent} onChange={(e) => setLetterContent(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}

              {surpriseModules.spotifyMusic && (
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Custom Song Name / Spotify Link <span className="text-rose-400">*</span></label>
                  <input type="text" placeholder="Song Name & Artist / Spotify URL" value={songName} onChange={(e) => setSongName(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-2.5 text-xs text-white" required />
                </div>
              )}

              {surpriseModules.passwordLock && (
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Password, Lock or Special Unlock Idea <span className="text-rose-400">*</span></label>
                  <input type="text" placeholder="e.g., Unlock code is our anniversary date" value={passwordIdea} onChange={(e) => setPasswordIdea(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-2.5 text-xs text-white" required />
                </div>
              )}
            </div>

          </div>
        )}

        {/* Step 2B: Invitation Options */}
        {orderType === "invitation" && (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
            <h3 className="font-serif text-lg text-rose-100 font-medium">2. Invitation Category & Sections</h3>
            
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 font-mono">
                Select Invitation Category
              </label>
              <select
                value={invitationType}
                onChange={(e) => setInvitationType(e.target.value)}
                className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white cursor-pointer"
              >
                <option value="Royal Wedding Invitation">Royal Wedding Invitation</option>
                <option value="Engagement">Engagement</option>
                <option value="Baby Shower">Baby Shower</option>
                <option value="Naming Ceremony">Naming Ceremony</option>
                <option value="Office / Shop Inauguration">Office / Shop Inauguration</option>
                <option value="Other">Other (Custom Invitation)</option>
              </select>

              {invitationType === "Other" && (
                <input
                  type="text"
                  placeholder="Specify custom requirement..."
                  value={otherInvitationType}
                  onChange={(e) => setOtherInvitationType(e.target.value)}
                  className="w-full mt-3 bg-[#050811] border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white"
                  required
                />
              )}
            </div>

            {/* Wedding Specific Section */}
            {invitationType === "Royal Wedding Invitation" && (
              <div className="p-4 bg-[#050811] border border-brand-border rounded-xl space-y-4">
                <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider font-mono">Wedding Details & Ceremonies</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-400 mb-1">Bride's Name <span className="text-rose-400">*</span></label>
                    <input type="text" placeholder="Priya Sharma" value={brideName} onChange={(e) => validateBrideName(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-xl p-2.5 text-white" required />
                    {errors.bride && <p className="text-rose-400 text-[11px] mt-1">⚠️ {errors.bride}</p>}
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">Groom's Name <span className="text-rose-400">*</span></label>
                    <input type="text" placeholder="Rohan Verma" value={groomName} onChange={(e) => validateGroomName(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-xl p-2.5 text-white" required />
                    {errors.groom && <p className="text-rose-400 text-[11px] mt-1">⚠️ {errors.groom}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Our Love Story / Background</label>
                  <textarea rows={2} placeholder="How you met..." value={weddingStory} onChange={(e) => setWeddingStory(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-xl p-2.5 text-xs text-white" />
                </div>

                {/* Wedding Functions Multi-Select */}
                <div className="space-y-3 pt-2 border-t border-brand-border">
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider font-mono">
                    Select Wedding Functions (First 2 included free, +₹59 per extra)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {availableFunctions.map((func) => (
                      <button
                        type="button"
                        key={func}
                        onClick={() => handleFunctionToggle(func)}
                        className={`p-2.5 rounded-xl text-xs font-medium transition text-center cursor-pointer border ${
                          selectedFunctions.includes(func)
                            ? "bg-rose-gradient text-stone-950 font-bold border-transparent"
                            : "bg-brand-card border-brand-border text-stone-400 hover:text-white"
                        }`}
                      >
                        {func} {selectedFunctions.includes(func) && "✓"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Inputs for Each Selected Function */}
                {selectedFunctions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-semibold text-rose-300 uppercase tracking-wider font-mono">
                      Provide Date, Time & Venue for Selected Ceremonies:
                    </label>
                    {selectedFunctions.map((func) => (
                      <div key={func} className="p-3 bg-brand-card border border-brand-border rounded-xl space-y-2">
                        <span className="text-xs font-bold text-white block uppercase tracking-wider font-serif">✨ {func}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <input
                            type="date"
                            min={minDateString}
                            value={functionDetails[func]?.date || ""}
                            onChange={(e) => handleFunctionDetailChange(func, "date", e.target.value)}
                            className="bg-[#050811] border border-brand-border rounded-lg p-2 text-white accent-rose-400"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Time (e.g. 11:00 AM)"
                            value={functionDetails[func]?.time || ""}
                            onChange={(e) => handleFunctionDetailChange(func, "time", e.target.value)}
                            className="bg-[#050811] border border-brand-border rounded-lg p-2 text-white"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Venue Name & City"
                            value={functionDetails[func]?.venue || ""}
                            onChange={(e) => handleFunctionDetailChange(func, "venue", e.target.value)}
                            className="bg-[#050811] border border-brand-border rounded-lg p-2 text-white"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Invitation Modules Checklist */}
            <div className="pt-2 border-t border-brand-border space-y-4">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider font-mono">
                Select Required Sections to Include
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { key: "familyIntro", label: "Family Introduction" },
                  { key: "invitors", label: "Invitors / Hosts List" },
                  { key: "schedule", label: "Day Schedule Timeline" },
                  { key: "foodSchedule", label: "Lunch / Dinner / Snacks" },
                  { key: "mapAddress", label: "Google Map Venue Address" },
                  { key: "mediaGallery", label: "Photo & Video Gallery (Max 12 photos, max 4 videos)" },
                ].map((mod) => (
                  <label key={mod.key} className="flex items-center gap-2.5 p-3 bg-[#050811] border border-brand-border rounded-xl cursor-pointer hover:border-rose-400 transition">
                    <input
                      type="checkbox"
                      checked={invitationModules[mod.key as keyof typeof invitationModules]}
                      onChange={() => handleInvitationModuleToggle(mod.key as keyof typeof invitationModules)}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <span className="text-stone-300 font-medium">{mod.label}</span>
                  </label>
                ))}

                {dbInviteModules.map((admInv) => (
                  <label key={admInv.id} className="flex items-center gap-2.5 p-3 bg-[#050811] border border-brand-border rounded-xl cursor-pointer hover:border-rose-400 transition">
                    <input
                      type="checkbox"
                      checked={selectedAdminInviteModules.includes(admInv.label)}
                      onChange={() => handleAdminInviteModuleToggle(admInv.label)}
                      className="w-4 h-4 accent-rose-500 rounded"
                    />
                    <span className="text-stone-300 font-medium">{admInv.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Conditional Inputs for Invitation */}
            <div className="space-y-4 pt-2">
              {invitationModules.familyIntro && (
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Family Introduction Details <span className="text-rose-400">*</span></label>
                  <textarea rows={2} placeholder="Son of... Grandson of..." value={familyDetails} onChange={(e) => setFamilyDetails(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}
              {invitationModules.invitors && (
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Invitors Names & Relations <span className="text-rose-400">*</span></label>
                  <textarea rows={2} placeholder="Awaiting your gracious presence..." value={invitorsDetails} onChange={(e) => setInvitorsDetails(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}
              {invitationModules.schedule && (
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Full Day Schedule Timeline Details <span className="text-rose-400">*</span></label>
                  <textarea rows={2} placeholder="10:00 AM - Ceremony, 1:00 PM - Lunch..." value={scheduleDetails} onChange={(e) => setScheduleDetails(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}
              {invitationModules.foodSchedule && (
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Lunch / Dinner / Snacks Menu Details <span className="text-rose-400">*</span></label>
                  <textarea rows={2} placeholder="Traditional Thali / High Tea..." value={foodDetails} onChange={(e) => setFoodDetails(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}
              {invitationModules.mapAddress && (
                <div>
                  <label className="block text-stone-400 text-xs mb-1">Full Venue Address & Map Link <span className="text-rose-400">*</span></label>
                  <textarea rows={2} placeholder="Hotel Grandeur, City + Map Link..." value={mapAddressDetails} onChange={(e) => validateMapAddress(e.target.value)} className="w-full bg-[#050811] border border-brand-border rounded-xl p-3 text-xs text-white" required />
                  {errors.map && <p className="text-rose-400 text-[11px] mt-1">⚠️ {errors.map}</p>}
                </div>
              )}
              {invitationModules.mediaGallery && (
                <div className="p-4 bg-[#050811] border border-brand-border rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-400 text-xs mb-1">Total Photos (Max 12)</label>
                      <input type="number" min="1" max="12" value={photoCount} onChange={(e) => setPhotoCount(Math.min(12, Math.max(1, Number(e.target.value))))} className="w-full bg-brand-card border border-brand-border rounded-xl p-2 text-xs text-white" />
                    </div>
                    <div>
                      <label className="block text-stone-400 text-xs mb-1">Total Videos (Max 4)</label>
                      <input type="number" min="1" max="4" value={videoCount} onChange={(e) => setVideoCount(Math.min(4, Math.max(1, Number(e.target.value))))} className="w-full bg-brand-card border border-brand-border rounded-xl p-2 text-xs text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-stone-400 text-xs mb-1">Google Drive Link for Gallery <span className="text-rose-400">*</span></label>
                    <input type="text" placeholder="https://drive.google.com/..." value={inviteDriveLink} onChange={(e) => validateInviteDriveUrl(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-xl p-2.5 text-xs text-white" required />
                    {errors.inviteDrive && <p className="text-rose-400 text-[11px] mt-1">⚠️ {errors.inviteDrive}</p>}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Step 3: Vision */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <h3 className="font-serif text-lg text-rose-100 font-medium">3. Describe Your Whole Vision</h3>
          <textarea
            rows={4}
            placeholder="Tell us what style, tone, color palette, or specific flow you want..."
            value={visionIdea}
            onChange={(e) => setVisionIdea(e.target.value)}
            className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-400 resize-none"
            required
          />
        </div>

        {/* Step 4: Contact & Target Delivery Date */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <h3 className="font-serif text-lg text-rose-100 font-medium">4. Contact & Target Delivery Date</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-stone-400 mb-1">Your Full Name <span className="text-rose-400">*</span></label>
              <input
                type="text"
                placeholder="Aarav Sharma"
                value={customerName}
                onChange={(e) => validateName(e.target.value)}
                className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-2.5 text-white"
                required
              />
              {errors.name && <p className="text-rose-400 text-[11px] mt-1">⚠️ {errors.name}</p>}
            </div>

            <div>
              <label className="block text-stone-400 mb-1">WhatsApp Phone Number (10 Digits) <span className="text-rose-400">*</span></label>
              <input
                type="tel"
                placeholder="9876543210"
                value={customerPhone}
                onChange={(e) => validatePhone(e.target.value)}
                className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-2.5 text-white"
                required
              />
              {errors.phone && <p className="text-rose-400 text-[11px] mt-1">⚠️ {errors.phone}</p>}
            </div>

            <div>
              <label className="block text-stone-400 mb-1">Account Email (Linked)</label>
              <input
                type="email"
                value={customerEmail}
                disabled
                className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-2.5 text-stone-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-stone-400 mb-1">Target Delivery Date (Min 2 Days Lead Time) <span className="text-rose-400">*</span></label>
              <input
                type="date"
                min={minDateString}
                value={deliveryDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-2.5 text-white accent-rose-400"
                required
              />
              <p className="text-stone-500 text-[10px] mt-1">💡 Selecting delivery in exactly 2 days automatically triggers urgent priority delivery.</p>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-200 font-medium bg-[#1d120e] border border-[#3d2720] p-3 rounded-xl">
              <input
                type="checkbox"
                checked={addonFastDelivery}
                onChange={(e) => handleUrgentCheckboxChange(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded"
              />
              ⚡ Urgent Priority Delivery (Within 2 Days) — Add +₹100
            </label>
          </div>
        </div>

        {/* Pricing & Submission Bar */}
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold font-mono block">Calculated Total</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-serif text-white font-bold">₹{totalPrice}</span>
              <span className="text-xs text-rose-300">✨ Pay 50% advance (₹{advanceAmount}) to start</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-rose-gradient text-stone-950 font-bold uppercase tracking-widest text-xs hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? "Redirecting..." : `Proceed to Pay ₹{advanceAmount} Advance →`}
          </button>
        </div>

      </form>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050811] text-white flex items-center justify-center">Loading Booking Form...</div>}>
      <BookFormContent />
    </Suspense>
  );
}