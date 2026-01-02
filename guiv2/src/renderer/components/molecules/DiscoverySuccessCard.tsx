/**
 * Discovery Success Card Component
 * Shows discovery success percentage with animated feedback:
 * - >= 80%: Confetti celebration animation (3 seconds)
 * - < 80%: Red card with thumbs-down animation (3 seconds)
 */

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ThumbsDown, Sparkles } from 'lucide-react';

interface DiscoverySuccessCardProps {
  percentage: number;
  received: number;
  total: number;
  showAnimation?: boolean;
}

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; left: number }> = ({ delay, left }) => {
  const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#fbbf24', '#f59e0b'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <div
      className="absolute pointer-events-none animate-confetti"
      style={{
        left: `${left}%`,
        top: '-10px',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        transform: `rotate(${rotation}deg)`,
        animationDelay: `${delay}ms`,
        animationDuration: '2.5s',
      }}
    />
  );
};

// Thumbs down animation component
const ThumbsDownAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-thumbs-bounce"
          style={{
            animationDelay: `${i * 200}ms`,
            left: `${20 + i * 25}%`,
          }}
        >
          <ThumbsDown
            className="w-8 h-8 text-white/80 transform rotate-12"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animationDelay: `${i * 150}ms`
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Sparkle animation for success - floating sparkles that drift upward
const SparkleAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <Sparkles
          key={i}
          className="absolute w-5 h-5 text-yellow-300 animate-sparkle-float"
          style={{
            left: `${5 + i * 12}%`,
            bottom: '10px',
            animationDelay: `${i * 150}ms`,
          }}
        />
      ))}
    </div>
  );
};

export const DiscoverySuccessCard: React.FC<DiscoverySuccessCardProps> = ({
  percentage,
  received,
  total,
  showAnimation = true,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<Array<{ id: number; delay: number; left: number }>>([]);
  const prevPercentageRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isSuccess = percentage >= 80;

  // Trigger animation when percentage changes (discovery completes)
  useEffect(() => {
    if (showAnimation && prevPercentageRef.current !== percentage && percentage > 0) {
      // Clear any existing animation
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      setIsAnimating(true);

      // Generate confetti particles for success
      if (isSuccess) {
        const particles = Array.from({ length: 30 }, (_, i) => ({
          id: i,
          delay: Math.random() * 500,
          left: Math.random() * 100,
        }));
        setConfettiParticles(particles);
      }

      // Stop animation after 3 seconds
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        setConfettiParticles([]);
      }, 3000);
    }
    prevPercentageRef.current = percentage;

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [percentage, showAnimation, isSuccess]);

  const getGradient = () => {
    if (isAnimating && !isSuccess) {
      return 'from-red-600 to-red-700';
    }
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-amber-600';
    if (percentage >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getIcon = () => {
    if (percentage >= 80) return CheckCircle2;
    if (percentage >= 60) return AlertTriangle;
    return XCircle;
  };

  const Icon = getIcon();

  const getMessage = () => {
    if (percentage >= 80) return 'Excellent!';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div
      className={`relative bg-gradient-to-br ${getGradient()} rounded-xl p-4 text-white shadow-lg overflow-hidden transition-all duration-300 ${
        isAnimating ? (isSuccess ? 'ring-4 ring-green-300 ring-opacity-50' : 'ring-4 ring-red-300 ring-opacity-50 animate-shake') : ''
      }`}
    >
      {/* Confetti for success */}
      {isAnimating && isSuccess && (
        <>
          {confettiParticles.map((particle) => (
            <ConfettiParticle key={particle.id} delay={particle.delay} left={particle.left} />
          ))}
          <SparkleAnimation />
        </>
      )}

      {/* Thumbs down for failure */}
      {isAnimating && !isSuccess && <ThumbsDownAnimation />}

      {/* Card content */}
      <div className="relative z-10 flex items-center gap-3">
        <div className={`p-2 bg-white/20 rounded-lg ${isAnimating && isSuccess ? 'animate-bounce' : ''}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs opacity-80">Discovery Success</p>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{getMessage()}</span>
          </div>
          <p className={`text-2xl font-bold ${isAnimating && isSuccess ? 'animate-pulse' : ''}`}>
            {percentage}%
          </p>
          <p className="text-xs opacity-80">{received}/{total} data sources</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 relative z-10">
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full bg-white/60 rounded-full transition-all duration-1000 ${isAnimating ? 'animate-progress-fill' : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscoverySuccessCard;
