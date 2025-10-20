import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Nút Prev
function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      className={className}
      style={{
        ...style,
        display: "block",
        left: "-50px",
        zIndex: 1,
        background: "rgba(0,0,0,0.5)",
        borderRadius: "50%",
        border: "none",
        width: "40px",
        height: "40px",
        color: "white",
        fontSize: "20px",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      ‹
    </button>
  );
}

// Nút Next
function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <button
      className={className}
      style={{
        ...style,
        display: "block",
        right: "-50px",
        zIndex: 1,
        background: "rgba(0,0,0,0.5)",
        borderRadius: "50%",
        border: "none",
        width: "40px",
        height: "40px",
        color: "white",
        fontSize: "20px",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      ›
    </button>
  );
}

function CustomSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  const images = [
    "/images/slider/banner1.jpg",
    "/images/slider/banner2.jpg",
    "/images/slider/banner4.jpg",
  ];

  return (
    <div
      style={{ maxWidth: "1000px", margin: "40px auto", position: "relative" }}
    >
      <Slider {...settings}>
        {images.map((src, index) => (
          <div key={index}>
            <img
              src={src}
              alt={`slide-${index}`}
              style={{
                width: "90%",
                height: "600px",
                objectFit: "cover",
                borderRadius: "20px",
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default CustomSlider;
