'use client'

import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export function DroneAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let droneX = 0;
    let droneY = 0;
    let scanLineY = 0;
    let scanAngle = 0;
    let potholes: { x: number; y: number; radius: number; scanned: boolean; scanProgress: number }[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      droneY = canvas.height * 0.3;
      scanLineY = canvas.height;
      generatePotholes();
    };

    const generatePotholes = () => {
      potholes = [
        { x: canvas.width * 0.25, y: canvas.height * 0.8, radius: 15, scanned: false, scanProgress: 0 },
        { x: canvas.width * 0.5, y: canvas.height * 0.75, radius: 20, scanned: false, scanProgress: 0 },
        { x: canvas.width * 0.75, y: canvas.height * 0.85, radius: 18, scanned: false, scanProgress: 0 },
      ];
    };

    const drawSky = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
    };

    const drawRoad = () => {
      const roadY = canvas.height * 0.7;
      const roadHeight = canvas.height * 0.3;
      
      ctx.fillStyle = '#555555';
      ctx.fillRect(0, roadY, canvas.width, roadHeight);
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(0, roadY + roadHeight / 2);
      ctx.lineTo(canvas.width, roadY + roadHeight / 2);
      ctx.stroke();
    };

    const drawDrone = (x: number, y: number) => {
      ctx.fillStyle = '#1E40AF';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 20, y + 15);
      ctx.lineTo(x + 20, y + 15);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(x - 15, y + 15, 30, 20);

      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 25, y + 10, 8, 3);
      ctx.fillRect(x + 17, y + 10, 8, 3);

      // Draw scanning beam
      ctx.save();
      ctx.translate(x, y + 35);
      ctx.rotate(scanAngle);
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height - y - 35);
      gradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.lineTo(15, canvas.height - y - 35);
      ctx.lineTo(-15, canvas.height - y - 35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawPotholes = () => {
      ctx.fillStyle = '#333333';
      potholes.forEach(pothole => {
        ctx.beginPath();
        ctx.arc(pothole.x, pothole.y, pothole.radius, 0, Math.PI * 2);
        ctx.fill();
        if (pothole.scanProgress > 0) {
          ctx.strokeStyle = `rgba(255, 0, 0, ${pothole.scanProgress})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(
            pothole.x - pothole.radius - 5, 
            pothole.y - pothole.radius - 5, 
            (pothole.radius + 5) * 2, 
            (pothole.radius + 5) * 2
          );
        }
        if (pothole.scanned) {
          ctx.fillStyle = 'rgba(139, 0, 0, 0.3)'; // Semi-transparent deep red
          ctx.fillRect(
            pothole.x - pothole.radius - 10, 
            pothole.y - pothole.radius - 10, 
            (pothole.radius + 10) * 2, 
            (pothole.radius + 10) * 2
          );
          ctx.strokeStyle = '#8B0000'; // Deep red color for the border
          ctx.lineWidth = 3;
          ctx.strokeRect(
            pothole.x - pothole.radius - 10, 
            pothole.y - pothole.radius - 10, 
            (pothole.radius + 10) * 2, 
            (pothole.radius + 10) * 2
          );
        }
      });
    };

    const scanPotholes = () => {
      potholes.forEach((pothole, index) => {
        const scanWidth = 50; // Reduced scan width for more precise detection
        
        if (Math.abs(droneX - pothole.x) < scanWidth / 2) {
          pothole.scanProgress = Math.min(pothole.scanProgress + 0.02, 1);
          
          if (pothole.scanProgress >= 1 && !pothole.scanned) {
            pothole.scanned = true;
            console.log(`Pothole ${index + 1} fully scanned at position (${pothole.x.toFixed(2)}, ${pothole.y.toFixed(2)})`);
          }
        }
      });
    };

    const allPotholesScanned = () => {
      return potholes.every(p => p.scanned);
    };

    const resetAnimation = () => {
      droneX = -30;
      potholes.forEach(p => {
        p.scanned = false;
        p.scanProgress = 0;
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawSky();
      drawRoad();
      drawPotholes();
      drawDrone(droneX, droneY);
      
      droneX += 2; // Adjusted drone speed
      scanAngle = Math.sin(Date.now() / 200) * 0.2; // Add some movement to the scan beam
      
      if (droneX > canvas.width) {
        resetAnimation();
      }
      
      scanPotholes();
      
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return null;
  }

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
}