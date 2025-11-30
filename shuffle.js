// Shuffle Animation for Logo
class ShuffleText {
  constructor(element, options = {}) {
    this.element = element;
    this.text = element.textContent;
    this.options = {
      shuffleDirection: options.shuffleDirection || 'right',
      duration: options.duration || 0.35,
      ease: options.ease || 'power3.out',
      stagger: options.stagger || 0.03,
      shuffleTimes: options.shuffleTimes || 1,
      animationMode: options.animationMode || 'evenodd',
      triggerOnHover: options.triggerOnHover !== undefined ? options.triggerOnHover : true,
      scrambleCharset: options.scrambleCharset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
      ...options
    };
    
    this.wrappers = [];
    this.timeline = null;
    this.isPlaying = false;
    
    this.init();
  }
  
  init() {
    // Attendre que les fonts soient chargées
    if ('fonts' in document) {
      document.fonts.ready.then(() => this.build());
    } else {
      this.build();
    }
  }
  
  splitTextIntoChars() {
    const text = this.text;
    const chars = [];
    const parent = this.element;
    
    // Vider l'élément
    parent.innerHTML = '';
    
    // Créer un span pour chaque caractère
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement('span');
      span.textContent = char;
      span.className = 'shuffle-char';
      span.style.display = 'inline-block';
      parent.appendChild(span);
      chars.push(span);
    }
    
    return chars;
  }
  
  build() {
    const chars = this.splitTextIntoChars();
    this.wrappers = [];
    
    chars.forEach(char => {
      const parent = char.parentElement;
      if (!parent) return;
      
      const width = char.getBoundingClientRect().width || 15;
      
      // Créer le wrapper
      const wrapper = document.createElement('span');
      wrapper.style.cssText = `
        display: inline-block;
        overflow: hidden;
        width: ${width}px;
        vertical-align: baseline;
      `;
      
      // Créer l'inner strip
      const inner = document.createElement('span');
      inner.style.cssText = `
        display: inline-block;
        white-space: nowrap;
        will-change: transform;
      `;
      
      parent.insertBefore(wrapper, char);
      wrapper.appendChild(inner);
      
      // Créer les caractères pour l'animation
      const rolls = Math.max(1, Math.floor(this.options.shuffleTimes));
      
      // Premier caractère (copie)
      const firstChar = char.cloneNode(true);
      firstChar.style.cssText = `display: inline-block; width: ${width}px; text-align: center;`;
      inner.appendChild(firstChar);
      
      // Caractères scramblés
      for (let i = 0; i < rolls; i++) {
        const scrambled = char.cloneNode(true);
        scrambled.textContent = this.randomChar();
        scrambled.style.cssText = `display: inline-block; width: ${width}px; text-align: center;`;
        inner.appendChild(scrambled);
      }
      
      // Caractère original
      char.setAttribute('data-orig', '1');
      char.style.cssText = `display: inline-block; width: ${width}px; text-align: center;`;
      inner.appendChild(char);
      
      // Calculer les positions
      const steps = rolls + 1;
      let startX = 0;
      let finalX = -steps * width;
      
      if (this.options.shuffleDirection === 'right') {
        const firstCopy = inner.firstElementChild;
        const real = inner.lastElementChild;
        if (real) inner.insertBefore(real, inner.firstChild);
        if (firstCopy) inner.appendChild(firstCopy);
        startX = -steps * width;
        finalX = 0;
      }
      
      gsap.set(inner, { x: startX, force3D: true });
      inner.setAttribute('data-final-x', String(finalX));
      inner.setAttribute('data-start-x', String(startX));
      
      this.wrappers.push({ wrapper, inner, width });
    });
    
    // Déclencher l'animation initiale
    setTimeout(() => this.play(), 100);
    
    // Configurer hover si activé
    if (this.options.triggerOnHover) {
      this.element.addEventListener('mouseenter', () => {
        if (!this.isPlaying) {
          this.randomizeScrambles();
          this.play();
        }
      });
    }
  }
  
  randomChar() {
    const charset = this.options.scrambleCharset;
    return charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  randomizeScrambles() {
    this.wrappers.forEach(({ inner, width }) => {
      const kids = Array.from(inner.children);
      for (let i = 1; i < kids.length - 1; i++) {
        kids[i].textContent = this.randomChar();
      }
    });
  }
  
  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    const strips = this.wrappers.map(w => w.inner);
    
    if (!strips.length) {
      this.isPlaying = false;
      return;
    }
    
    this.timeline = gsap.timeline({
      onComplete: () => {
        this.isPlaying = false;
      }
    });
    
    if (this.options.animationMode === 'evenodd') {
      const odd = strips.filter((_, i) => i % 2 === 1);
      const even = strips.filter((_, i) => i % 2 === 0);
      
      const oddTotal = this.options.duration + Math.max(0, odd.length - 1) * this.options.stagger;
      const evenStart = odd.length ? oddTotal * 0.7 : 0;
      
      if (odd.length) {
        this.timeline.to(odd, {
          x: (i, t) => parseFloat(t.getAttribute('data-final-x') || '0'),
          duration: this.options.duration,
          ease: this.options.ease,
          force3D: true,
          stagger: this.options.stagger
        }, 0);
      }
      
      if (even.length) {
        this.timeline.to(even, {
          x: (i, t) => parseFloat(t.getAttribute('data-final-x') || '0'),
          duration: this.options.duration,
          ease: this.options.ease,
          force3D: true,
          stagger: this.options.stagger
        }, evenStart);
      }
    } else {
      strips.forEach(strip => {
        this.timeline.to(strip, {
          x: parseFloat(strip.getAttribute('data-final-x') || '0'),
          duration: this.options.duration,
          ease: this.options.ease,
          force3D: true
        }, 0);
      });
    }
  }
  
  destroy() {
    if (this.timeline) {
      this.timeline.kill();
    }
  }
}

// Initialiser l'animation sur le logo
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.getElementById('logo-shuffle');
  if (logo && typeof gsap !== 'undefined') {
    new ShuffleText(logo, {
      shuffleDirection: 'right',
      duration: 0.35,
      animationMode: 'evenodd',
      shuffleTimes: 1,
      ease: 'power3.out',
      stagger: 0.03,
      triggerOnHover: true
    });
  }
});
