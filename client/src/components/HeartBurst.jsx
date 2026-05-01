import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

const HeartBurst = ({ trigger }) => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    if (trigger) {
      const newElements = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        angle: Math.random() * 360,
        distance: 30 + Math.random() * 50,
        size: 8 + Math.random() * 8,
        duration: 0.6 + Math.random() * 0.4,
        delay: Math.random() * 0.1
      }));
      setElements(newElements);
      
      const timer = setTimeout(() => setElements([]), 1500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence>
        {elements.map((el) => {
          const x = Math.cos(el.angle * (Math.PI / 180)) * el.distance;
          const y = Math.sin(el.angle * (Math.PI / 180)) * el.distance - 20; // Float slightly up

          return (
            <motion.div
              key={el.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{ 
                x: x, 
                y: y - 40, // Float up further
                opacity: 0, 
                scale: [0, 1.2, 0.8, 0],
                rotate: el.angle 
              }}
              transition={{ duration: el.duration, delay: el.delay, ease: "easeOut" }}
              style={{ position: 'absolute' }}
            >
              <Heart size={el.size} fill="#ec4899" color="#ec4899" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default HeartBurst;
