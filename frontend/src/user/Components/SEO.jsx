import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, ogImage, ogUrl }) => {
  const siteName = "Sri Vedic Puja";
  const fullTitle = `${title} | ${siteName}`;
  const defaultDescription = "Book verified Pandits for your sacred ceremonies. Traditional Vedic Pujas with modern convenience.";
  const defaultKeywords = "Online Puja, Vedic Pandit, Book Pandit Online, Hindu Rituals, Sri Vedic Puja";

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl || window.location.href} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage || "/img/download2.png"} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={ogUrl || window.location.href} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={ogImage || "/img/download2.png"} />

      {/* Canonical Link */}
      <link rel="canonical" href={ogUrl || window.location.href} />
    </Helmet>
  );
};

export default SEO;
