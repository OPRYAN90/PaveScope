import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export function DroneAnimation() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null; // or return a static image
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let droneX = 0;
    let droneY = canvas.height * 0.2;
    let scanLineY = canvas.height * 0.6;

    const drawRoad = () => {
      const roadY = canvas.height * 0.6;
      const roadHeight = canvas.height * 0.4;
      
      // Draw sky
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, roadY);
      
      // Draw road
      ctx.fillStyle = '#555555';
      ctx.fillRect(0, roadY, canvas.width, roadHeight);
      
      // Draw road markings
      ctx.strokeStyle = '#FFFFFF';
      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(0, roadY + roadHeight / 2);
      ctx.lineTo(canvas.width, roadY + roadHeight / 2);
      ctx.stroke();
    };

    const drawDrone = (x: number, y: number) => {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 10, y + 5);
      ctx.lineTo(x + 10, y + 5);
      ctx.closePath();
      ctx.fill();
    };

    const drawScanLine = (y: number) => {
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawRoad();
      drawDrone(droneX, droneY);
      drawScanLine(scanLineY);
      
      droneX += 2;
      if (droneX > canvas.width) {
        droneX = 0;
      }
      
      scanLineY += 1;
      if (scanLineY > canvas.height) {
        scanLineY = canvas.height * 0.6;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
}