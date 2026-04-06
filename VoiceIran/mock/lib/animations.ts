// Framer Motion animation presets for Iranian Defense Platform
// All animations are precise and military-like - no bounce or playful springs

export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 }
}

export const slideInRight = {
  // RTL: entrance from right
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
}

export const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
}

export const staggerContainer = {
  animate: { 
    transition: { 
      staggerChildren: 0.1 
    } 
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

export const goldLineExpand = {
  // RTL: expands from right
  initial: { scaleX: 0, originX: 1 },
  animate: { scaleX: 1 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

export const scaleUp = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

// Hover variants for cards
export const cardHover = {
  rest: { 
    y: 0, 
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
  },
  hover: { 
    y: -4, 
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    transition: { duration: 0.2, ease: 'easeOut' }
  }
}

// Image hover for premium feel
export const imageHover = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.04,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

// Page transition
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
}

// Count up animation helper
export const countUpConfig = {
  duration: 2,
  ease: 'easeOut'
}
