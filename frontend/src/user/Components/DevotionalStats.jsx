export default function DevotionalStats() {
  return (
    <section className="bg-[#0a8d64] text-white py-10 md:py-16 px-6">
      {/* items-center add kiya hai taaki dono side vertical barabar dikhein */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
        
        {/* LEFT CONTENT */}
        <div className="text-left">
          <p className="text-xs md:text-sm font-semibold text-orange-100 mb-2 md:mb-3 uppercase tracking-wide">
            Trusted by Over 30 Million Devotees
          </p>

          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-4 md:mb-6">
            India’s Largest <br className="hidden md:block" /> Devotional Platform
          </h2>

          <p className="text-orange-100 text-base md:text-lg leading-relaxed max-w-xl opacity-90">
            We are committed to building the most trusted destination that
            serves the devotional needs of millions of devotees in India and
            abroad.
          </p>
        </div>

        {/* RIGHT STATS */}
        {/* Gap ko grid mein maintain kiya hai taaki upar-niche barabar lage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
          
          {/* CARD 1 */}
          <div className="flex gap-3 md:gap-4 items-start">
            <div className="shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-[#076849] flex items-center justify-center text-lg md:text-xl">
              🙏
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">30M+ Devotees</h3>
              <p className="text-sm md:text-base text-orange-100/80">
                Trusted us in their journey
              </p>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="flex gap-3 md:gap-4 items-start">
            <div className="shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-[#076849] flex items-center justify-center text-lg md:text-xl">
              ⭐
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">4.5 Rating</h3>
              <p className="text-sm md:text-base text-orange-100/80">
                1 Lakh+ reviews
              </p>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="flex gap-3 md:gap-4 items-start">
            <div className="shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-[#076849] flex items-center justify-center text-lg md:text-xl">
              🌍
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">30+ Countries</h3>
              <p className="text-sm md:text-base text-orange-100/80">
                Connecting devotees globally
              </p>
            </div>
          </div>

          {/* CARD 4 */}
          <div className="flex gap-3 md:gap-4 items-start">
            <div className="shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-[#076849] flex items-center justify-center text-lg md:text-xl">
              🔥
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">3M+ Services</h3>
              <p className="text-sm md:text-base text-orange-100/80">
                Pooja and Chadhava completed
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}