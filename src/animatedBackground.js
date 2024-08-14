import React, { useRef, useEffect } from "react";

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let dots = [];
    const maxDistance = 100;
    const numDots = 100;
    const dotSpeed = 0.2;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const random = (min, max) => Math.random() * (max - min) + min;

    const createDots = () => {
      dots = [];
      for (let i = 0; i < numDots; i++) {
        dots.push({
          x: random(0, canvas.width),
          y: random(0, canvas.height),
          size: random(2, 4),
          brightness: random(0.7, 1),
          dx: random(-dotSpeed, dotSpeed),
          dy: random(-dotSpeed, dotSpeed),
        });
      }
    };

    const drawDot = (dot) => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2, false);
      ctx.fillStyle = `rgba(200, 200, 200, ${dot.brightness})`;
      ctx.fill();
    };

    const drawLine = (x1, y1, x2, y2, opacity) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(200, 200, 200, ${opacity})`;
      ctx.stroke();
    };

    const animateDots = (mouse) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach((dot, index) => {
        // Move dots
        dot.x += dot.dx;
        dot.y += dot.dy;

        // Bounce dots off edges
        if (dot.x <= 0 || dot.x >= canvas.width) dot.dx *= -1;
        if (dot.y <= 0 || dot.y >= canvas.height) dot.dy *= -1;

        // Draw dot
        drawDot(dot);

        // Draw lines to the mouse
        const distToMouse = Math.hypot(dot.x - mouse.x, dot.y - mouse.y);
        if (distToMouse < maxDistance) {
          drawLine(dot.x, dot.y, mouse.x, mouse.y, (maxDistance - distToMouse) / maxDistance);
        }

        // Draw lines between nearby dots
        for (let j = index + 1; j < dots.length; j++) {
          const otherDot = dots[j];
          const distToDot = Math.hypot(dot.x - otherDot.x, dot.y - otherDot.y);
          if (distToDot < maxDistance) {
            drawLine(dot.x, dot.y, otherDot.x, otherDot.y, (maxDistance - distToDot) / maxDistance);
          }
        }
      });

      requestAnimationFrame(() => animateDots(mouse));
    };

    const mouse = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    resizeCanvas();
    createDots();
    animateDots(mouse);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, zIndex: -1, backgroundColor: '#EEEEEE' }} />;
};

export default AnimatedBackground;
