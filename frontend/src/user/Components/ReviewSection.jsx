import { useState, useEffect, useRef } from "react";
import { FaStar } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/img/")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE_URL.replace("/api", "")}${url}`;
  return `${API_BASE_URL}/uploads/${url}`;
};

const AUTO_SCROLL_INTERVAL = 3500;

export default function ReviewSection() {
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/reviews`);
        const data = await res.json();
        if (data.success && data.reviews.length > 0) {
          setReviewsData(data.reviews);
        } else {
          // Fallback static reviews if empty or failed
          setReviewsData([
            { name: "Sita Sharma", avatar: "/img/review1.jpg", date: "5 months ago", rating: 5, comment: "Amazing service! The puja was conducted beautifully and on time." },
            { name: "Ramesh Gupta", avatar: "/img/review2.jpg", date: "5 months ago", rating: 5, comment: "Highly recommended! Very easy to book online and trusted pandits." },
            { name: "Anita Singh", avatar: "/img/review3.jpg", date: "5 months ago", rating: 5, comment: "I loved the experience. The pandit guided everything perfectly." },
            { name: "Rajesh Kumar", avatar: "/img/review4.jpg", date: "5 months ago", rating: 5, comment: "Simple, smooth, and professional. Will book again!" }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Responsive: kitne cards ek saath dikhne chahiye
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  const maxIndex = Math.max(0, reviewsData.length - visibleCount);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, AUTO_SCROLL_INTERVAL);
  };

  useEffect(() => {
    if (reviewsData.length > 0) {
      startTimer();
    }
    return () => clearInterval(timerRef.current);
  }, [maxIndex, reviewsData.length]);

  // Index out of bounds fix when visibleCount changes
  useEffect(() => {
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
  }, [maxIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    startTimer();
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    startTimer();
  };

  const cardWidthPercent = 100 / visibleCount;

  if (loading) return null;

  return (
    <section className="bg-[#FFF4E1] py-16">
      {/* Heading + Google Rating */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 text-center mb-10">
        <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#3b2a1a] mb-6">
          What Our Customers Say
        </h2>
        <div className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow">
          <span className="font-bold mr-2">Google Reviews</span>
          <span className="font-bold text-xl mr-1">5.0</span>
          <div className="flex mr-2">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="text-yellow-400" />
            ))}
          </div>
          <span className="text-gray-500">({reviewsData.length}+)</span>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative max-w-7xl mx-auto px-10 md:px-20">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * cardWidthPercent}%)`,
            }}
          >
            {reviewsData.map((review, i) => (
              <div
                key={i}
                className="flex-shrink-0 px-2"
                style={{ width: `${cardWidthPercent}%` }}
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg h-full flex flex-col">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={buildImageUrl(review.avatar) || "/img/review1.jpg"}
                      alt={review.name}
                      loading="lazy"
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{review.name}</h3>
                      <p className="text-gray-400 text-sm">{review.date}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, j) => (
                      <FaStar
                        key={j}
                        className={`text-yellow-400 ${
                          j < review.rating ? "opacity-100" : "opacity-30"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 flex-1">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow Buttons */}
        {reviewsData.length > visibleCount && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 -translate-y-1/2 left-1 md:left-6 bg-white p-2 rounded-full shadow hover:bg-orange-50 transition"
            >
              <IoIosArrowBack size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 -translate-y-1/2 right-1 md:right-6 bg-white p-2 rounded-full shadow hover:bg-orange-50 transition"
            >
              <IoIosArrowForward size={20} />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {reviewsData.length > visibleCount && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <span
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                startTimer();
              }}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                i === currentIndex ? "bg-orange-400 w-6" : "bg-orange-200 w-2"
              }`}
            />
          ))}
        </div>
      )}

      {/* Google Review Button */}
      <div className="text-center mt-8">
        <a
          href="#"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Review us on Google
        </a>
      </div>
    </section>
  );
}
