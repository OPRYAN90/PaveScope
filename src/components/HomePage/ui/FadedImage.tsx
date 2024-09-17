import React, { useState, useEffect } from "react";

interface FadingImageProps {
  images: string[];
  interval?: number;
  height?: string; // Adding a customizable height
}

const FadingImage: React.FC<FadingImageProps> = ({
  images,
  interval = 3000,
  height = "200px",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);

  return (
    <div
      className={`relative w-full rounded-lg overflow-hidden shadow-md`}
      style={{ height }}
    >
      {images.map((src: string, index: number) => (
        <img
          key={src}
          src={src}
          alt={`Image ${index + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectFit: "cover", width: "100%", height: "100%" }} // Ensures image fills the container
        />
      ))}
    </div>
  );
};

export default FadingImage;
