import { useState, useEffect, useCallback } from "react";
import { Zap } from "lucide-react";

// ─── Steps Data ───────────────────────────────────────────────────────────────

const defaultSteps = [
  {
    id: 1,
    title: "Choose Your Puja",
    description:
      "Select your Puja from the list of available sacred ceremonies.",
    icon: "🛕",
  },
  {
    id: 2,
    title: "Your Information",
    description:
      "After selecting the Puja, fill in the information of your Name and Gotra in the provided form.",
    icon: "📝",
  },
  {
    id: 3,
    title: "Puja Video",
    description:
      "The video of your Puja completed with your name and Gotra will be shared on WhatsApp.",
    icon: "🎥",
  },
  {
    id: 4,
    title: "Aashirwad Box",
    description: "Aashirwad Box will be sent to your registered address.",
    icon: "📦",
  },
];

// ─── Slide Mockup UIs ─────────────────────────────────────────────────────────

const Slide1 = () => (
  <div className="flex flex-col gap-3 w-full">
    <p className="text-white font-bold text-sm">Select Puja</p>
    {["Satyanarayan Puja", "Ganesh Puja", "Griha Pravesh", "Navgraha Puja"].map(
      (p) => (
        <div
          key={p}
          className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 text-white text-sm font-medium"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0" />
          {p}
        </div>
      ),
    )}
  </div>
);

const Slide2 = () => (
  <div className="flex flex-col gap-3 w-full">
    <div className="bg-white/15 rounded-xl p-4">
      <p className="text-white font-bold text-xs mb-2 uppercase tracking-wide">
        Member 01
      </p>
      <div className="bg-white/20 rounded-lg px-3 py-2.5 text-white/60 text-xs mb-2">
        Your Full Name
      </div>
      <div className="bg-white/20 rounded-lg px-3 py-2.5 text-white/60 text-xs mb-2">
        Your Gotra
      </div>
      <div className="bg-white/20 rounded-lg px-3 py-2.5 text-white/60 text-xs">
        +91 WhatsApp Number
      </div>
    </div>
    <div className="bg-white/15 rounded-xl p-4">
      <p className="text-white font-bold text-xs mb-2 uppercase tracking-wide">
        Member 02
      </p>
      <div className="bg-white/20 rounded-lg px-3 py-2.5 text-white/60 text-xs">
        Your Full Name
      </div>
    </div>
    <button className="w-full bg-white text-orange-600 font-bold text-sm rounded-xl py-2.5">
      + Add More Members
    </button>
  </div>
);

const Slide3 = () => (
  <div className="flex flex-col gap-4 w-full items-center">
    <div className="w-full bg-white/15 rounded-2xl overflow-hidden">
      <div className="bg-white/20 h-36 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center">
          <span className="text-white text-2xl">▶</span>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-white font-bold text-sm">Your Puja Video</p>
        <p className="text-white/70 text-xs mt-0.5">
          Personalised with your name & gotra
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-3 w-full">
      <span className="text-2xl">📲</span>
      <div>
        <p className="text-white font-bold text-xs">Shared on WhatsApp</p>
        <p className="text-white/70 text-xs">Within 24 hours of Puja</p>
      </div>
    </div>
  </div>
);

const Slide4 = () => (
  <div className="flex flex-col gap-4 w-full items-center">
    <div className="text-7xl leading-none text-center">📦</div>
    <div className="w-full bg-white/15 rounded-2xl px-4 py-4">
      <p className="text-white font-bold text-sm mb-3">
        Aashirwad Box Includes
      </p>
      {["Sacred Prasad", "Puja Samagri", "Deity Photo", "Blessing Letter"].map(
        (item) => (
          <div
            key={item}
            className="flex items-center gap-2 text-white/90 text-xs py-1.5 border-b border-white/10 last:border-0"
          >
            <span className="text-green-300">✓</span> {item}
          </div>
        ),
      )}
    </div>
    <p className="text-white/80 text-xs text-center">
      🏠 Delivered to your registered address
    </p>
  </div>
);

// ─── Slides Config ────────────────────────────────────────────────────────────

const defaultSlides = [
  { id: 1, heading: "Choose Your Puja", content: <Slide1 /> },
  { id: 2, heading: "Fill Your Members Details", content: <Slide2 /> },
  { id: 3, heading: "Receive Puja Video", content: <Slide3 /> },
  { id: 4, heading: "Aashirwad Box", content: <Slide4 /> },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HowItProcess({
  title = "How does This Puja Work?",
  stepsData = defaultSteps,
  slidesData = defaultSlides,
  autoPlay = true,
  autoPlayInterval = 3500,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [direction, setDirection] = useState("next");
  const [visibleIndex, setVisibleIndex] = useState(0);

  const total = slidesData.length;

  const goTo = useCallback(
    (index, dir = "next") => {
      if (sliding) return;
      const next = (index + total) % total;
      setDirection(dir);
      setSliding(true);
      setTimeout(() => {
        setVisibleIndex(next);
        setActiveIndex(next);
        setSliding(false);
      }, 320);
    },
    [sliding, total],
  );

  const goNext = useCallback(
    () => goTo(activeIndex + 1, "next"),
    [activeIndex, goTo],
  );
  const goPrev = useCallback(
    () => goTo(activeIndex - 1, "prev"),
    [activeIndex, goTo],
  );

  const handleStepClick = (i) => {
    if (i === activeIndex) return;
    goTo(i, i > activeIndex ? "next" : "prev");
  };

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(goNext, autoPlayInterval);
    return () => clearInterval(id);
  }, [autoPlay, autoPlayInterval, goNext]);

  return (
    /*
      ✅ NO outer bg/rounded — parent in TemplePujaBooking already wraps this in:
         <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
      ✅ Padding matches other sections: p-5 md:p-7
    */
    <section className="p-5 md:p-7">
      <style>{`
        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideFromLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideToLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-50px); }
        }
        @keyframes slideToRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(50px); }
        }
        .slide-exit-next  { animation: slideToLeft    0.32s ease forwards; }
        .slide-exit-prev  { animation: slideToRight   0.32s ease forwards; }
        .slide-enter-next { animation: slideFromRight 0.32s ease forwards; }
        .slide-enter-prev { animation: slideFromLeft  0.32s ease forwards; }
      `}</style>

      {/* ── Header — same style as About / Benefits / FAQ headers ── */}
      <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest mb-6">
        <Zap size={20} />
        {title}
      </div>

      {/* ── Grid ── */}
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Left: Steps */}
        <div className="flex-1 min-w-0 w-full">
          {stepsData.map((step, i) => (
            <div
              key={step.id}
              onClick={() => handleStepClick(i)}
              className={`flex gap-4 items-start p-4 rounded-xl mb-3 cursor-pointer border transition-all duration-200 hover:translate-x-1 select-none
                ${
                  i === activeIndex
                    ? "bg-orange-50 border-orange-200"
                    : "bg-transparent border-transparent hover:bg-[#FFFDF8]"
                }`}
            >
              {/* Badge */}
              <div
                className={`w-8 h-8 rounded-lg text-white font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200
                  ${i === activeIndex ? "bg-orange-500" : "bg-orange-300"}`}
              >
                {step.id}
              </div>

              <div>
                <p
                  className={`font-bold text-[15px] mb-1 transition-colors duration-200
                    ${i === activeIndex ? "text-orange-600" : "text-gray-800"}`}
                >
                  {step.icon} {step.title}
                </p>
                <p className="text-[13px] md:text-[14px] text-gray-500 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Carousel */}
        <div className="w-full md:w-[360px] shrink-0">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #E8601C, #f5a623)",
              boxShadow: "0 16px 48px rgba(232,96,28,0.30)",
            }}
          >
            {/* Slide area */}
            <div className="relative overflow-hidden min-h-[420px] p-6 pb-4">
              <h3 className="text-white font-bold text-[15px] uppercase tracking-widest mb-4">
                {slidesData[visibleIndex].heading}
              </h3>

              <div
                key={visibleIndex}
                className={
                  sliding
                    ? direction === "next"
                      ? "slide-exit-next"
                      : "slide-exit-prev"
                    : direction === "next"
                      ? "slide-enter-next"
                      : "slide-enter-prev"
                }
              >
                {slidesData[visibleIndex].content}
              </div>

              {/* Prev Arrow */}
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center text-white text-xl font-bold transition-all duration-150 hover:scale-110 z-10"
                aria-label="Previous"
              >
                ‹
              </button>

              {/* Next Arrow */}
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center text-white text-xl font-bold transition-all duration-150 hover:scale-110 z-10"
                aria-label="Next"
              >
                ›
              </button>
            </div>

            {/* Bottom bar */}
            <div className="bg-black/15 px-6 py-3 flex items-center justify-between">
              <span className="text-white/80 text-[11px] font-bold uppercase tracking-wider">
                Step {activeIndex + 1} of {total}
              </span>
              <div className="flex gap-1.5">
                {slidesData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleStepClick(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`rounded-full border-2 border-white/60 transition-all duration-200 cursor-pointer
                      ${i === activeIndex ? "bg-white w-5 h-2" : "bg-transparent w-2 h-2"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
