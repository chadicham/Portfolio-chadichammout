// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le background Plasma
    const plasmaContainer = document.getElementById('plasma-bg');
    if (plasmaContainer && window.PlasmaBackground) {
        new PlasmaBackground(plasmaContainer, {
            color: '#64ffda',      // Couleur accent de votre portfolio
            speed: 0.4,            // Vitesse de l'animation (réduite)
            direction: 'forward',  // Direction: 'forward', 'reverse'
            scale: 0.6,            // Échelle réduite pour concentrer au centre
            opacity: 0.2,          // Opacité augmentée légèrement
            mouseInteractive: true // Interaction avec la souris
        });
    }
    
    // Initialiser GSAP
    gsap.registerPlugin(ScrollTrigger);
    
    // Navbar auto-hide/show behavior
    const navbar = document.getElementById('navbar');
    let lastScrollY = 0;
    let showNavbar = true;
    let isAnimating = false;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Cache la navbar après 100px de scroll vers le bas
        if (currentScrollY > 100 && currentScrollY > lastScrollY && showNavbar) {
            navbar.classList.add('hidden');
            showNavbar = false;
        } 
        // Montre la navbar en scrollant vers le haut
        else if (currentScrollY < lastScrollY && !showNavbar) {
            navbar.classList.remove('hidden');
            navbar.classList.add('animating');
            showNavbar = true;
            isAnimating = true;
            setTimeout(() => {
                navbar.classList.remove('animating');
                isAnimating = false;
            }, 700);
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Montre la navbar au survol du haut de la page
    document.addEventListener('mousemove', (e) => {
        if (e.clientY < 100 && !showNavbar) {
            navbar.classList.remove('hidden');
            navbar.classList.add('animating');
            showNavbar = true;
            isAnimating = true;
            setTimeout(() => {
                navbar.classList.remove('animating');
                isAnimating = false;
            }, 700);
        }
    });
    
    // Navigation links hover effect
    const navLinks = document.querySelectorAll('.nav-link');
    const navBackground = document.querySelector('.nav-background');
    let hoverTimeout = null;
    
    const updateBackgroundPosition = (element, show = true) => {
        if (!element || !navBackground) return;
        
        const navLinksContainer = element.closest('.nav-links');
        const containerRect = navLinksContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const offsetX = elementRect.left - containerRect.left;
        
        navBackground.style.opacity = show ? '1' : '0';
        navBackground.style.transform = `translateX(${offsetX}px)`;
        navBackground.style.width = `${elementRect.width}px`;
        navBackground.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    };
    
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
            navBackground.classList.add('active');
            updateBackgroundPosition(e.currentTarget);
        });
    });
    
    document.querySelector('.nav-links')?.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
            const activeLink = document.querySelector('.nav-link.active');
            if (activeLink) {
                navBackground.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                updateBackgroundPosition(activeLink);
            } else {
                navBackground.classList.remove('active');
            }
        }, 1000);
    });
    
    // Position initial du background sur l'élément actif
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
        setTimeout(() => {
            navBackground.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            updateBackgroundPosition(activeLink);
        }, 100);
    }
    
    // Mettre à jour l'élément actif selon la section visible
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
                if (!hoverTimeout && navBackground) {
                    navBackground.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    updateBackgroundPosition(link);
                }
            }
        });
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
    
    // Target Cursor - Mode Visée (Desktop uniquement, activable)
    const isTouchDevice = () => {
        return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
    };
    
    const isMobileScreen = () => {
        return window.innerWidth <= 1024;
    };
    
    // Initialiser le curseur seulement sur desktop
    if (!isTouchDevice() && !isMobileScreen()) {
        const cursorToggleBtn = document.getElementById('cursor-toggle');
        let cursorEnabled = false;
        let targetCursor = null;
        let cursorDot = null;
        let corners = [];
        let activeTarget = null;
        let spinAnimation = null;
        
        const constants = {
            borderWidth: 3,
            cornerSize: 12,
            parallaxStrength: 0.00005
        };
        
        const createCursor = () => {
            targetCursor = document.createElement('div');
            targetCursor.className = 'target-cursor-wrapper';
            
            cursorDot = document.createElement('div');
            cursorDot.className = 'target-cursor-dot';
            targetCursor.appendChild(cursorDot);
            
            corners = ['tl', 'tr', 'br', 'bl'].map(pos => {
                const corner = document.createElement('div');
                corner.className = `target-cursor-corner corner-${pos}`;
                targetCursor.appendChild(corner);
                return corner;
            });
            
            document.body.appendChild(targetCursor);
            
            gsap.set(targetCursor, {
                xPercent: -50,
                yPercent: -50,
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            });
        };
        
        const startSpinning = () => {
            if (spinAnimation) spinAnimation.kill();
            spinAnimation = gsap.to(targetCursor, {
                rotation: '+=360',
                duration: 2,
                ease: 'none',
                repeat: -1
            });
        };
        
        const updateCorners = (target, mouseX, mouseY) => {
            const rect = target.getBoundingClientRect();
            const cursorRect = targetCursor.getBoundingClientRect();
            
            const cursorCenterX = cursorRect.left + cursorRect.width / 2;
            const cursorCenterY = cursorRect.top + cursorRect.height / 2;
            
            const { borderWidth, cornerSize, parallaxStrength } = constants;
            
            let offsets = [
                { x: rect.left - cursorCenterX - borderWidth, y: rect.top - cursorCenterY - borderWidth },
                { x: rect.right - cursorCenterX + borderWidth - cornerSize, y: rect.top - cursorCenterY - borderWidth },
                { x: rect.right - cursorCenterX + borderWidth - cornerSize, y: rect.bottom - cursorCenterY + borderWidth - cornerSize },
                { x: rect.left - cursorCenterX - borderWidth, y: rect.bottom - cursorCenterY + borderWidth - cornerSize }
            ];
            
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
        
        const mouseMoveHandler = (e) => {
            if (!cursorEnabled || !targetCursor) return;
            gsap.to(targetCursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power3.out'
            });
        };
        
        const mouseDownHandler = () => {
            if (!cursorEnabled) return;
            gsap.to(cursorDot, { scale: 0.7, duration: 0.3 });
            gsap.to(targetCursor, { scale: 0.9, duration: 0.2 });
        };
        
        const mouseUpHandler = () => {
            if (!cursorEnabled) return;
            gsap.to(cursorDot, { scale: 1, duration: 0.3 });
            gsap.to(targetCursor, { scale: 1, duration: 0.2 });
        };
        
        const mouseOverHandler = (e) => {
            if (!cursorEnabled) return;
            const clickableSelector = 'a, button, .project, .back-to-top, .mobile-nav-toggle, [role="button"]';
            const target = e.target.closest(clickableSelector);
            
            if (target && target !== activeTarget) {
                activeTarget = target;
                
                if (spinAnimation) {
                    spinAnimation.pause();
                    gsap.set(targetCursor, { rotation: 0 });
                }
                
                updateCorners(target);
                
                const mouseMoveOnTarget = (ev) => {
                    updateCorners(target, ev.clientX, ev.clientY);
                };
                
                const mouseLeaveFromTarget = () => {
                    activeTarget = null;
                    target.removeEventListener('mousemove', mouseMoveOnTarget);
                    target.removeEventListener('mouseleave', mouseLeaveFromTarget);
                    
                    resetCorners();
                    
                    setTimeout(() => {
                        if (!activeTarget && cursorEnabled) {
                            startSpinning();
                        }
                    }, 50);
                };
                
                target.addEventListener('mousemove', mouseMoveOnTarget);
                target.addEventListener('mouseleave', mouseLeaveFromTarget);
            }
        };
        
        const enableCursor = () => {
            if (!targetCursor) createCursor();
            
            cursorEnabled = true;
            document.body.style.cursor = 'none';
            targetCursor.classList.add('active');
            cursorToggleBtn.classList.add('active');
            startSpinning();
            
            window.addEventListener('mousemove', mouseMoveHandler);
            window.addEventListener('mousedown', mouseDownHandler);
            window.addEventListener('mouseup', mouseUpHandler);
            window.addEventListener('mouseover', mouseOverHandler);
            
            localStorage.setItem('cursorEnabled', 'true');
        };
        
        const disableCursor = () => {
            cursorEnabled = false;
            document.body.style.cursor = 'auto';
            if (targetCursor) targetCursor.classList.remove('active');
            cursorToggleBtn.classList.remove('active');
            
            if (spinAnimation) {
                spinAnimation.kill();
                spinAnimation = null;
            }
            
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mousedown', mouseDownHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
            window.removeEventListener('mouseover', mouseOverHandler);
            
            localStorage.setItem('cursorEnabled', 'false');
        };
        
        // Toggle au clic
        cursorToggleBtn.addEventListener('click', () => {
            if (cursorEnabled) {
                disableCursor();
            } else {
                enableCursor();
            }
        });
        
        // Charger la préférence
        if (localStorage.getItem('cursorEnabled') === 'true') {
            enableCursor();
        }
    } else {
        // Cacher le bouton sur mobile
        const cursorToggleBtn = document.getElementById('cursor-toggle');
        if (cursorToggleBtn) cursorToggleBtn.style.display = 'none';
    }
    
    // Animation des liens de navigation (smooth scroll)
    const allNavLinks = document.querySelectorAll('nav a, .nav-link');
    
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
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
    
    // Protection anti-spam pour l'email
    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        // Email obfusqué (inversé et encodé)
        const user = 'tuommahc.idahc';
        const domain = 'moc.liamg';
        const email = user.split('').reverse().join('') + '@' + domain.split('').reverse().join('');
        
        emailLink.href = 'mailto:' + email;
        emailLink.setAttribute('title', 'Envoyer un email');
        
        // Optionnel : afficher l'email au survol
        emailLink.addEventListener('mouseenter', function() {
            this.setAttribute('data-email', email);
        });
    }
});
