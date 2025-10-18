// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser GSAP
    gsap.registerPlugin(ScrollTrigger);
    
    // Animation du header au scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Mobile Navigation
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    
    // Toggle du menu mobile
    mobileNavToggle.addEventListener('click', () => {
        mobileNavToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
    
    // Fermer le menu mobile quand un lien est cliqué
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });
    
    // Animation de la section hero
    gsap.to('.hero h1', {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.2
    });
    
    gsap.to('.hero p', {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.4
    });
    
    gsap.to('.scroll-indicator', {
        opacity: 0.6,
        duration: 1,
        delay: 1
    });
    
    // Animation des projets au scroll
    gsap.utils.toArray('.project').forEach((project, i) => {
        gsap.to(project, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
                trigger: project,
                start: 'top bottom-=100',
                toggleActions: 'play none none none'
            },
            delay: i * 0.2
        });
    });
    
    // Animation des compétences au scroll
    gsap.utils.toArray('.skill-category').forEach((category, i) => {
        gsap.from(category, {
            opacity: 0,
            x: i % 2 === 0 ? -50 : 50,
            duration: 0.8,
            scrollTrigger: {
                trigger: category,
                start: 'top bottom-=100',
                toggleActions: 'play none none none'
            },
            delay: i * 0.2
        });
    });
    
    // Bouton retour en haut
    const backToTop = document.createElement('div');
    backToTop.classList.add('back-to-top');
    backToTop.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Target Cursor - Animation de curseur avec coins (Desktop uniquement)
    // Détecter si l'appareil a un écran tactile
    const isTouchDevice = () => {
        return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
    };
    
    // Détecter si l'écran est trop petit (mobile/tablette)
    const isMobileScreen = () => {
        return window.innerWidth <= 1024;
    };
    
    // N'activer le curseur personnalisé que sur desktop avec souris
    if (!isTouchDevice() && !isMobileScreen()) {
        console.log('✅ Curseur personnalisé activé (Desktop)');
        const targetCursor = document.createElement('div');
        targetCursor.className = 'target-cursor-wrapper';
        
        // Créer le point central
        const cursorDot = document.createElement('div');
        cursorDot.className = 'target-cursor-dot';
        targetCursor.appendChild(cursorDot);
        
        // Créer les 4 coins
        const corners = ['tl', 'tr', 'br', 'bl'].map(pos => {
            const corner = document.createElement('div');
            corner.className = `target-cursor-corner corner-${pos}`;
            targetCursor.appendChild(corner);
            return corner;
        });
        
        document.body.appendChild(targetCursor);
        
        // Cacher le curseur par défaut
        document.body.style.cursor = 'none';
        
        // Variables pour l'animation
        let activeTarget = null;
        let spinAnimation = null;
        const constants = {
            borderWidth: 3,
            cornerSize: 12,
            parallaxStrength: 0.00005
        };
        
        // Position initiale
        gsap.set(targetCursor, {
            xPercent: -50,
            yPercent: -50,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        });
        
        // Animation de rotation continue
        const startSpinning = () => {
            if (spinAnimation) spinAnimation.kill();
            spinAnimation = gsap.to(targetCursor, {
                rotation: '+=360',
                duration: 2,
                ease: 'none',
                repeat: -1
            });
        };
        
        startSpinning();
        
        // Suivre la souris
        window.addEventListener('mousemove', (e) => {
            gsap.to(targetCursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power3.out'
            });
        });
        
        // Animation au clic
        window.addEventListener('mousedown', () => {
            gsap.to(cursorDot, { scale: 0.7, duration: 0.3 });
            gsap.to(targetCursor, { scale: 0.9, duration: 0.2 });
        });
        
        window.addEventListener('mouseup', () => {
            gsap.to(cursorDot, { scale: 1, duration: 0.3 });
            gsap.to(targetCursor, { scale: 1, duration: 0.2 });
        });
        
        // Fonction pour mettre à jour les coins
        const updateCorners = (target, mouseX, mouseY) => {
            const rect = target.getBoundingClientRect();
            const cursorRect = targetCursor.getBoundingClientRect();
            
            const cursorCenterX = cursorRect.left + cursorRect.width / 2;
            const cursorCenterY = cursorRect.top + cursorRect.height / 2;
            
            const [tlc, trc, brc, blc] = corners;
            const { borderWidth, cornerSize, parallaxStrength } = constants;
            
            let offsets = [
                { x: rect.left - cursorCenterX - borderWidth, y: rect.top - cursorCenterY - borderWidth },
                { x: rect.right - cursorCenterX + borderWidth - cornerSize, y: rect.top - cursorCenterY - borderWidth },
                { x: rect.right - cursorCenterX + borderWidth - cornerSize, y: rect.bottom - cursorCenterY + borderWidth - cornerSize },
                { x: rect.left - cursorCenterX - borderWidth, y: rect.bottom - cursorCenterY + borderWidth - cornerSize }
            ];
            
            // Effet parallaxe
            if (mouseX !== undefined && mouseY !== undefined) {
                const targetCenterX = rect.left + rect.width / 2;
                const targetCenterY = rect.top + rect.height / 2;
                const mouseOffsetX = (mouseX - targetCenterX) * parallaxStrength;
                const mouseOffsetY = (mouseY - targetCenterY) * parallaxStrength;
                
                offsets.forEach(offset => {
                    offset.x += mouseOffsetX;
                    offset.y += mouseOffsetY;
                });
            }
            
            corners.forEach((corner, index) => {
                gsap.to(corner, {
                    x: offsets[index].x,
                    y: offsets[index].y,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            });
        };
        
        // Réinitialiser les coins
        const resetCorners = () => {
            const { cornerSize } = constants;
            const positions = [
                { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
                { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
                { x: cornerSize * 0.5, y: cornerSize * 0.5 },
                { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
            ];
            
            corners.forEach((corner, index) => {
                gsap.to(corner, {
                    x: positions[index].x,
                    y: positions[index].y,
                    duration: 0.3,
                    ease: 'power3.out'
                });
            });
        };
        
        // Gérer les éléments cliquables
        const clickableSelector = 'a, button, .project, .back-to-top, .mobile-nav-toggle, [role="button"]';
        
        window.addEventListener('mouseover', (e) => {
            const target = e.target.closest(clickableSelector);
            
            if (target && target !== activeTarget) {
                activeTarget = target;
                
                // Arrêter la rotation
                if (spinAnimation) {
                    spinAnimation.pause();
                    gsap.set(targetCursor, { rotation: 0 });
                }
                
                // Mettre à jour les coins
                updateCorners(target);
                
                // Suivre le mouvement sur l'élément
                const mouseMoveHandler = (ev) => {
                    updateCorners(target, ev.clientX, ev.clientY);
                };
                
                const mouseLeaveHandler = () => {
                    activeTarget = null;
                    target.removeEventListener('mousemove', mouseMoveHandler);
                    target.removeEventListener('mouseleave', mouseLeaveHandler);
                    
                    resetCorners();
                    
                    // Reprendre la rotation
                    setTimeout(() => {
                        if (!activeTarget) {
                            startSpinning();
                        }
                    }, 50);
                };
                
                target.addEventListener('mousemove', mouseMoveHandler);
                target.addEventListener('mouseleave', mouseLeaveHandler);
            }
        });
    } else {
        console.log('📱 Curseur personnalisé désactivé (Mobile/Tablette ou écran tactile)');
    }
    
    // Animation des liens de navigation
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });
    
    // Animation au survol des projets
    const projects = document.querySelectorAll('.project');
    
    projects.forEach(project => {
        const projectVideo = project.querySelector('.project-video');
        
        project.addEventListener('mouseenter', () => {
            gsap.to(project.querySelector('.project-overlay'), {
                opacity: 1,
                duration: 0.3
            });
            
            gsap.to(project.querySelector('.project-image'), {
                scale: 1.05,
                duration: 0.5
            });
            
            // Si le projet contient une vidéo, la jouer et l'afficher
            if (projectVideo) {
                projectVideo.play();
                gsap.to(projectVideo, {
                    opacity: 1,
                    duration: 0.5
                });
            }
        });
        
        project.addEventListener('mouseleave', () => {
            gsap.to(project.querySelector('.project-overlay'), {
                opacity: 0,
                duration: 0.3
            });
            
            gsap.to(project.querySelector('.project-image'), {
                scale: 1,
                duration: 0.5
            });
            
            // Si le projet contient une vidéo, la mettre en pause et la cacher
            if (projectVideo) {
                projectVideo.pause();
                gsap.to(projectVideo, {
                    opacity: 0,
                    duration: 0.5
                });
            }
        });
    });
});
