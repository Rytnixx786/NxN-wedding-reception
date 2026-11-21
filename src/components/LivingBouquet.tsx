import { weddingConfig } from '../config/wedding';

export type BouquetVariant =
  | 'intro-left'
  | 'intro-right'
  | 'envelope'
  | 'ceremony-right'
  | 'reception-left';

interface LivingBouquetProps {
  variant: BouquetVariant;
  className?: string;
}

/**
 * Crisp 3D Living Botanical Bouquet:
 * - High-clarity sculptural 3D botanical layer (continuous organic rotateX/rotateY/rotateZ wind sway)
 * - Clean perspective rig with zero blurry ghost/halo duplicates
 * - Delicate floating golden/rose micro-sparks drifting off the petals
 */
export function LivingBouquet({ variant, className = '' }: LivingBouquetProps) {
  const { assets } = weddingConfig;

  return (
    <div
      className={`living-bouquet living-bouquet--${variant}${className ? ` ${className}` : ''}`}
      data-gsap={`bouquet-${variant}`}
      aria-hidden="true"
    >
      <div className="living-bouquet__rig">
        {/* Primary Crisp Sculptural Living 3D Bouquet */}
        <img
          src={assets.floralBouquet}
          alt=""
          className="living-bouquet__main"
          decoding="async"
        />

        {/* Floating Golden Pollen & Rose-Petal Glints */}
        <span className="living-bouquet__sparks">
          <i className="bq-spark bq-spark--1" />
          <i className="bq-spark bq-spark--2" />
          <i className="bq-spark bq-spark--3" />
          <i className="bq-spark bq-spark--4" />
        </span>
      </div>
    </div>
  );
}
