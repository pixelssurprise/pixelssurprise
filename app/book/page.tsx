"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function BookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [orderType, setOrderType] = useState<"surprise" | "invitation">("surprise");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  
  // Surprise Specific Options
  const [surpriseEvent, setSurpriseEvent] = useState("Birthday Surprise");
  const [otherSurpriseEvent, setOtherSurpriseEvent] = useState("");
  
  const [selectedGames, setSelectedGames] = useState<string[]>(["Love Quiz"]);
  const [otherGameIdea, setOtherGameIdea] = useState("");

  // Surprise Checklist Modules (Added passwordLock)
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
  
  // Dynamic Wedding Functions Selection
  const availableFunctions = ["Haldi", "Sangeet", "Mehendi", "Wedding Ceremony / Saptapadi", "Reception", "Cocktail Party", "Engagement", "Other Ceremony"];
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(["Wedding Ceremony / Saptapadi", "Reception"]);
  const [functionDetails, setFunctionDetails] = useState<Record<string, { date: string; time: string; venue: string }>>({});

  // Invitation Checklist Modules
  const [invitationModules, setInvitationModules] = useState({
    familyIntro: false,
    invitors: false,
    schedule: false,
    foodSchedule: false,
    mapAddress: false,
    mediaGallery: false,
  });

  // Invitation Module Inputs
  const [familyDetails, setFamilyDetails] = useState("");
  const [invitorsDetails, setInvitorsDetails] = useState("");
  const [scheduleDetails, setScheduleDetails] = useState("");
  const [foodDetails, setFoodDetails] = useState("");
  const [mapAddressDetails, setMapAddressDetails] = useState("");

  // Shared Fields
  const [visionIdea, setVisionIdea] = useState("");
  const [addonFastDelivery, setAddonFastDelivery] = useState(false);

  // Dynamic Pricing Calculation
  const calculateTotal = () => {
    let base = 649; // Base price for both surprise and invitations
    
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

  const handleInvitationModuleToggle = (key: keyof typeof invitationModules) => {
    setInvitationModules({ ...invitationModules, [key]: !invitationModules[key] });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryDate) {
      alert("Please fill in your name, WhatsApp number, and delivery date.");
      return;
    }

    if (surpriseEvent === "Other" && !otherSurpriseEvent) {
      alert("Please specify your surprise occasion.");
      return;
    }

    if (invitationType === "Other" && !otherInvitationType) {
      alert("Please specify your invitation category.");
      return;
    }

    setLoading(true);
    const trackingNumber = "PX-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    const orderPayload = {
      tracking_number: trackingNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      user_email: customerEmail || null,
      order_type: "custom_booking",
      total_amount: totalPrice,
      payment_status: "pending",
      delivery_status: "processing",
      items: {
        type: orderType,
        delivery_date: deliveryDate,
        urgent_delivery: addonFastDelivery,
        surprise_details: orderType === "surprise" ? {
          event: surpriseEvent === "Other" ? otherSurpriseEvent : surpriseEvent,
          games: selectedGames,
          other_game: selectedGames.includes("Other") ? otherGameIdea : null,
          modules: surpriseModules,
          photo_count: surpriseModules.photos ? photoCount : 0,
          video_count: surpriseModules.videos ? videoCount : 0,
          drive_link: (surpriseModules.photos || surpriseModules.videos) ? driveLink : null,
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
          photo_count: invitationModules.mediaGallery ? photoCount : 0,
          video_count: invitationModules.mediaGallery ? videoCount : 0,
          drive_link: invitationModules.mediaGallery ? driveLink : null,
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
      router.push(`/track?tracking=${trackingNumber}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10 text-slate-200">
      
      {/* Header */}
      <div className="text-center space-y-3">
        
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-goldLight">
          Book Your Custom Website
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Select your event, custom mini-games, and interactive features. Pricing adjusts dynamically based on your selections.
        </p>
      </div>

      <form onSubmit={handleSubmitBooking} className="space-y-8">
        
        {/* Step 1: Category Selector */}
        <div className="bg-brand-card border border-brand-border rounded-3xl p-6 space-y-4 shadow-xl">
          <label className="block font-serif text-lg text-brand-goldLight font-medium">1. Select  Category</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setOrderType("surprise")}
              className={`p-5 rounded-2xl text-left transition cursor-pointer border ${
                orderType === "surprise"
                  ? "bg-rose-gradient text-brand-dark shadow-lg shadow-brand-gold/20 font-bold border-transparent"
                  : "bg-brand-card border-brand-border text-slate-400 hover:border-brand-gold/40 hover:text-white"
              }`}
            >
              <span className="text-lg block mb-1 font-serif">🎁 Interactive Surprise Website</span>
              
            </button>

            <button
              type="button"
              onClick={() => setOrderType("invitation")}
              className={`p-5 rounded-2xl text-left transition cursor-pointer border ${
                orderType === "invitation"
                  ? "bg-rose-gradient text-brand-dark shadow-lg shadow-brand-gold/20 font-bold border-transparent"
                  : "bg-brand-card border-brand-border text-slate-400 hover:border-brand-gold/40 hover:text-white"
              }`}
            >
              <span className="text-lg block mb-1 font-serif">💌 Royal Digital Invitation</span>
                         </button>
          </div>
        </div>

        {/* Step 2A: Surprise Options */}
        {orderType === "surprise" && (
          <div className="bg-brand-card border border-brand-border rounded-3xl p-6 space-y-6 shadow-xl">
            <h3 className="font-serif text-lg text-brand-goldLight font-medium">2. Surprise Occasion & Features</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Select Occasion / Event Type
              </label>
              <select
                value={surpriseEvent}
                onChange={(e) => setSurpriseEvent(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold cursor-pointer"
              >
                <option value="Birthday Surprise">Birthday Surprise</option>
                <option value="Proposal Website">Proposal Website</option>
                <option value="Apology Website">Apology Website</option>
                <option value="Father's Day / Mother's Day">Father's Day / Mother's Day</option>
                <option value="Friendship Day">Friendship Day</option>
                <option value="Valentine's Day">Valentine's Day</option>
                <option value="Anniversary Wish">Anniversary Wish</option>
                <option value="Other">Other (Custom Occasion)</option>
              </select>

              {surpriseEvent === "Other" && (
                <input
                  type="text"
                  placeholder="Specify custom occasion..."
                  value={otherSurpriseEvent}
                  onChange={(e) => setOtherSurpriseEvent(e.target.value)}
                  className="w-full mt-3 bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold"
                  required
                />
              )}
            </div>

            {/* Mini Games */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Select Mini-Games (First 2 included free, +₹30 per extra game)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  "Love Quiz",
                  "Memory Match",
                  "Catch the Gift",
                  "Tic Tac Toe",
                  "Archery to Heart",
                  "Collect Gifts",
                  "Balloon Pop",
                  "Balloon Reveal",
                  "Other",
                ].map((game) => (
                  <button
                    type="button"
                    key={game}
                    onClick={() => handleGameToggle(game)}
                    className={`p-3 rounded-xl text-xs font-medium transition text-center cursor-pointer border ${
                      selectedGames.includes(game)
                        ? "bg-rose-gradient text-brand-dark font-bold border-transparent shadow-md shadow-brand-gold/20"
                        : "bg-brand-dark border-brand-border text-slate-400 hover:border-brand-gold/40 hover:text-white"
                    }`}
                  >
                    {game} {selectedGames.includes(game) && "✓"}
                  </button>
                ))}
              </div>
              {selectedGames.includes("Other") && (
                <input
                  type="text"
                  placeholder="Describe your custom game idea..."
                  value={otherGameIdea}
                  onChange={(e) => setOtherGameIdea(e.target.value)}
                  className="w-full mt-2 bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              )}
            </div>

            {/* Checklist Modules for Surprise */}
            <div className="pt-2 border-t border-brand-border space-y-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Select Interactive Modules & Animations to Include
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { key: "photos", label: "Photo Gallery (First 5 free, +₹10/extra)" },
                  { key: "videos", label: "Video Showcase (First 1 free, +₹30/extra)" },
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
                  <label key={mod.key} className="flex items-center gap-2.5 p-3 bg-brand-dark border border-brand-border rounded-xl cursor-pointer hover:border-brand-gold/40 transition">
                    <input
                      type="checkbox"
                      checked={surpriseModules[mod.key as keyof typeof surpriseModules]}
                      onChange={() => handleSurpriseModuleToggle(mod.key as keyof typeof surpriseModules)}
                      className="w-4 h-4 accent-brand-gold rounded"
                    />
                    <span className="text-slate-300 font-medium">{mod.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Inputs Based on Surprise Checklist */}
            <div className="space-y-4 pt-2">
              {(surpriseModules.photos || surpriseModules.videos) && (
                <div className="p-4 bg-brand-dark border border-brand-border rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    {surpriseModules.photos && (
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">Total Photos (5 free)</label>
                        <input type="number" min="1" max="50" value={photoCount} onChange={(e) => setPhotoCount(Number(e.target.value))} className="w-full bg-brand-card border border-brand-border rounded-xl p-2 text-xs text-white" />
                      </div>
                    )}
                    {surpriseModules.videos && (
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">Total Videos (1 free)</label>
                        <input type="number" min="0" max="10" value={videoCount} onChange={(e) => setVideoCount(Number(e.target.value))} className="w-full bg-brand-card border border-brand-border rounded-xl p-2 text-xs text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Google Drive Link for Photos & Videos</label>
                    <input type="url" placeholder="https://drive.google.com/..." value={driveLink} onChange={(e) => setDriveLink(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-xl p-2.5 text-xs text-white" required />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 text-xs mb-1">Any Other Reference Link (Optional)</label>
                <input type="url" placeholder="https://instagram.com/... or any website link" value={anyLink} onChange={(e) => setAnyLink(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-2.5 text-xs text-white" />
              </div>

              {surpriseModules.jokes && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Inside Jokes Content</label>
                  <textarea rows={2} placeholder="Write your funny inside jokes here..." value={jokesContent} onChange={(e) => setJokesContent(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}

              {surpriseModules.journey && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Journey / Timeline Milestones</label>
                  <textarea rows={2} placeholder="2023 - Met at college, 2024 - First trip..." value={journeyContent} onChange={(e) => setJourneyContent(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}

              {surpriseModules.specialMoment && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Special Memory Details</label>
                  <textarea rows={2} placeholder="Describe your most treasured moment together..." value={specialMomentContent} onChange={(e) => setSpecialMomentContent(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}

              {surpriseModules.letter && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Secret Letter Content</label>
                  <textarea rows={3} placeholder="Write your heartfelt note here..." value={letterContent} onChange={(e) => setLetterContent(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}

              {surpriseModules.spotifyMusic && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Custom Song Name / Spotify Link</label>
                  <input type="text" placeholder="Song Name & Artist / Spotify URL" value={songName} onChange={(e) => setSongName(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-2.5 text-xs text-white" required />
                </div>
              )}

              {surpriseModules.passwordLock && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Password, Lock or Special Unlock Idea</label>
                  <input type="text" placeholder="e.g., Unlock code is our anniversary date (1210)" value={passwordIdea} onChange={(e) => setPasswordIdea(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-2.5 text-xs text-white" required />
                </div>
              )}
            </div>

          </div>
        )}

        {/* Step 2B: Invitation Options */}
        {orderType === "invitation" && (
          <div className="bg-brand-card border border-brand-border rounded-3xl p-6 space-y-6 shadow-xl">
            <h3 className="font-serif text-lg text-brand-goldLight font-medium">2. Invitation Category & Sections</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Select Invitation Category
              </label>
              <select
                value={invitationType}
                onChange={(e) => setInvitationType(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold cursor-pointer"
              >
                <option value="Royal Wedding Invitation">Royal Wedding Invitation</option>
                <option value="Engagement">Engagement</option>
                <option value="Baby Shower">Baby Shower</option>
                <option value="Naming Ceremony">Naming Ceremony</option>
                <option value="Bappa Agman / Puja">Bappa Agman / Puja</option>
                <option value="Office / Shop Inauguration">Office / Shop Inauguration</option>
                <option value="Other">Other (Custom Invitation)</option>
              </select>

              {invitationType === "Other" && (
                <input
                  type="text"
                  placeholder="Specify your custom invitation requirement..."
                  value={otherInvitationType}
                  onChange={(e) => setOtherInvitationType(e.target.value)}
                  className="w-full mt-3 bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold"
                  required
                />
              )}
            </div>

            {/* Wedding Specific Section with Function Checkboxes */}
            {invitationType === "Royal Wedding Invitation" && (
              <div className="p-4 bg-brand-dark border border-brand-border rounded-xl space-y-4">
                <h4 className="text-xs font-semibold text-brand-gold uppercase tracking-wider font-mono">Wedding Details & Ceremonies</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Bride's Name</label>
                    <input type="text" placeholder="Priya Sharma" value={brideName} onChange={(e) => setBrideName(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-xl p-2.5 text-white" required />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Groom's Name</label>
                    <input type="text" placeholder="Rohan Verma" value={groomName} onChange={(e) => setGroomName(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-xl p-2.5 text-white" required />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Our Love Story / Background</label>
                  <textarea rows={2} placeholder="How you met or your journey together..." value={weddingStory} onChange={(e) => setWeddingStory(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-xl p-2.5 text-xs text-white" />
                </div>

                {/* Wedding Functions Multi-Select */}
                <div className="space-y-3 pt-2 border-t border-brand-border">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Select Wedding Functions (First 2 included free, +₹59 per extra ceremony)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {availableFunctions.map((func) => (
                      <button
                        type="button"
                        key={func}
                        onClick={() => handleFunctionToggle(func)}
                        className={`p-2.5 rounded-xl text-xs font-medium transition text-center cursor-pointer border ${
                          selectedFunctions.includes(func)
                            ? "bg-rose-gradient text-brand-dark font-bold border-transparent shadow-md shadow-brand-gold/20"
                            : "bg-brand-card border-brand-border text-slate-400 hover:border-brand-gold/40 hover:text-white"
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
                    <label className="block text-xs font-semibold text-brand-gold uppercase tracking-wider font-mono">
                      Provide Date, Time & Venue for Selected Ceremonies:
                    </label>
                    {selectedFunctions.map((func) => (
                      <div key={func} className="p-3 bg-brand-card border border-brand-border rounded-xl space-y-2">
                        <span className="text-xs font-bold text-white block uppercase tracking-wider font-serif">✨ {func}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <input
                            type="date"
                            value={functionDetails[func]?.date || ""}
                            onChange={(e) => handleFunctionDetailChange(func, "date", e.target.value)}
                            className="bg-brand-dark border border-brand-border rounded-lg p-2 text-white accent-brand-gold"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Time (e.g. 11:00 AM)"
                            value={functionDetails[func]?.time || ""}
                            onChange={(e) => handleFunctionDetailChange(func, "time", e.target.value)}
                            className="bg-brand-dark border border-brand-border rounded-lg p-2 text-white"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Venue Name & City"
                            value={functionDetails[func]?.venue || ""}
                            onChange={(e) => handleFunctionDetailChange(func, "venue", e.target.value)}
                            className="bg-brand-dark border border-brand-border rounded-lg p-2 text-white"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modular Sections Checkboxes */}
            <div className="pt-2 border-t border-brand-border space-y-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Select Required Sections to Include
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { key: "familyIntro", label: "Family Introduction" },
                  { key: "invitors", label: "Invitors / Hosts List" },
                  { key: "schedule", label: "Day Schedule Timeline" },
                  { key: "foodSchedule", label: "Lunch / Dinner / Snacks" },
                  { key: "mapAddress", label: "Google Map Venue Address" },
                  { key: "mediaGallery", label: "Photo & Video Gallery (First 5 photos and 1 video free)" },
                ].map((mod) => (
                  <label key={mod.key} className="flex items-center gap-2.5 p-3 bg-brand-dark border border-brand-border rounded-xl cursor-pointer hover:border-brand-gold/40 transition">
                    <input
                      type="checkbox"
                      checked={invitationModules[mod.key as keyof typeof invitationModules]}
                      onChange={() => handleInvitationModuleToggle(mod.key as keyof typeof invitationModules)}
                      className="w-4 h-4 accent-brand-gold rounded"
                    />
                    <span className="text-slate-300 font-medium">{mod.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Conditional Inputs for Invitation */}
            <div className="space-y-4 pt-2">
              {invitationModules.familyIntro && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Family Introduction Details</label>
                  <textarea rows={2} placeholder="Son of... Grandson of..." value={familyDetails} onChange={(e) => setFamilyDetails(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}
              {invitationModules.invitors && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Invitors Names & Relations</label>
                  <textarea rows={2} placeholder="Awaiting your gracious presence..." value={invitorsDetails} onChange={(e) => setInvitorsDetails(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}
              {invitationModules.schedule && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Full Day Schedule Timeline Details</label>
                  <textarea rows={2} placeholder="10:00 AM - Ceremony, 1:00 PM - Lunch..." value={scheduleDetails} onChange={(e) => setScheduleDetails(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}
              {invitationModules.foodSchedule && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Lunch / Dinner / Snacks Menu Details</label>
                  <textarea rows={2} placeholder="Traditional Maharashtrian Thali / High Tea..." value={foodDetails} onChange={(e) => setFoodDetails(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}
              {invitationModules.mapAddress && (
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Full Venue Address & Google Map Link</label>
                  <textarea rows={2} placeholder="Hotel Grandeur, City Road + Map Link..." value={mapAddressDetails} onChange={(e) => setMapAddressDetails(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white" required />
                </div>
              )}
              {invitationModules.mediaGallery && (
                <div className="p-4 bg-brand-dark border border-brand-border rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs mb-1">Total Photos (5 free)</label>
                      <input type="number" min="1" max="50" value={photoCount} onChange={(e) => setPhotoCount(Number(e.target.value))} className="w-full bg-brand-card border border-brand-border rounded-xl p-2 text-xs text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs mb-1">Total Videos (1 free)</label>
                      <input type="number" min="0" max="10" value={videoCount} onChange={(e) => setVideoCount(Number(e.target.value))} className="w-full bg-brand-card border border-brand-border rounded-xl p-2 text-xs text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Google Drive Link for Gallery</label>
                    <input type="url" placeholder="https://drive.google.com/..." value={driveLink} onChange={(e) => setDriveLink(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-xl p-2.5 text-xs text-white" required />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-slate-400 text-xs mb-1">Any Other Reference Link (Optional)</label>
                <input type="url" placeholder="https://instagram.com/... or any website link" value={anyLink} onChange={(e) => setAnyLink(e.target.value)} className="w-full bg-brand-dark border border-brand-border rounded-xl p-2.5 text-xs text-white" />
              </div>
            </div>

          </div>
        )}

        {/* Step 3: Overall Vision & Idea */}
        <div className="bg-brand-card border border-brand-border rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-serif text-lg text-brand-goldLight font-medium">3. Describe Your Whole Vision</h3>
          <div>
            <label className="block text-slate-400 text-xs mb-1 font-mono">
              Detailed Idea, Vibe, Colors or Special Requests
            </label>
            <textarea
              rows={4}
              placeholder="Tell us what style, tone, color palette, or specific flow you want..."
              value={visionIdea}
              onChange={(e) => setVisionIdea(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-gold resize-none"
              required
            />
          </div>
        </div>

        {/* Step 4: Contact & Delivery Date */}
        <div className="bg-brand-card border border-brand-border rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-serif text-lg text-brand-goldLight font-medium">4. Contact & Target Delivery Date</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Your Full Name</label>
              <input
                type="text"
                placeholder="Aarav Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">WhatsApp Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Target Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-white accent-brand-gold"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-300 font-medium bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              <input
                type="checkbox"
                checked={addonFastDelivery}
                onChange={(e) => setAddonFastDelivery(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded"
              />
              ⚡ Urgent Priority Delivery (Within 2 Days) — Add +₹100
            </label>
          </div>
        </div>

        {/* Pricing & Submission Bar */}
        <div className="bg-brand-card border border-brand-border rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold font-mono block">Calculated Total</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-serif text-brand-goldLight font-bold">₹{totalPrice}</span>
              <span className="text-xs text-slate-400">✨ 50% advance to start, 50% after approval</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-rose-gradient text-brand-dark font-bold uppercase tracking-widest text-xs hover:opacity-90 transition shadow-lg shadow-brand-gold/20 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Generating Tracking..." : "Confirm & Place Booking →"}
          </button>
        </div>

      </form>
    </div>
  );
}