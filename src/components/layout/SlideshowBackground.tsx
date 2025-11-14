import React, { useState, useEffect, useMemo } from "react";

const SlideshowBackground: React.FC<{ images: string[] }> = ({ images }) => {
  const [imageBlobs, setImageBlobs] = useState<string[]>([]);

  useEffect(() => {
    let isCancelled = false;
    let createdBlobUrls: string[] = [];

    const loadImages = async () => {
      setImageBlobs([]);

      const blobPromises = images.map(async (src) => {
        try {
          const response = await fetch(src);
          if (!response.ok) return null;
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        } catch {
          return null;
        }
      });

      const urls = (await Promise.all(blobPromises)).filter(Boolean) as string[];
      createdBlobUrls = urls;

      if (!isCancelled) {
        setImageBlobs(urls);
      } else {
        urls.forEach(URL.revokeObjectURL);
      }
    };

    if (images.length > 0) {
      loadImages();
    }

    return () => {
      isCancelled = true;
      createdBlobUrls.forEach(URL.revokeObjectURL);
    };
  }, [images]);

  const shuffledImages = useMemo(() => {
    if (imageBlobs && imageBlobs.length > 0) {
      return [...imageBlobs].sort(() => Math.random() - 0.5);
    }
    return [];
  }, [imageBlobs]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (shuffledImages.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveImageIndex((prevIndex) => (prevIndex + 1) % shuffledImages.length);
        setIsTransitioning(false);
      }, 3000); // This must match the CSS transition duration
    }, 10000); // Change image every 10 seconds

    return () => clearInterval(timer);
  }, [shuffledImages.length]);

  if (shuffledImages.length === 0) {
    return null;
  }

  const currentImage = shuffledImages[activeImageIndex];
  const nextImage = shuffledImages[(activeImageIndex + 1) % shuffledImages.length];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        backgroundColor: "black",
      }}
    >
      <img
        key={currentImage}
        src={currentImage}
        alt=""
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: isTransitioning ? 0 : 1,
          transition: "opacity 3s ease-in-out",
          zIndex: 1,
        }}
      />
      <img
        key={nextImage}
        src={nextImage}
        alt=""
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
    </div>
  );
};

export default SlideshowBackground;
