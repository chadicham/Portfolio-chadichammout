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
    
    // Animation du trail de souris
    const coords = { x: 0, y: 0 };
    const circles = document.querySelectorAll(".circle");
    
    // Configuration initiale des cercles
    circles.forEach(function (circle, index) {
        circle.x = 0;
        circle.y = 0;
        circle.style.backgroundColor = "#ffffff"; // Couleur blanche pour tous les cercles
    });
    
    // Suivre la position de la souris
    window.addEventListener("mousemove", function(e) {
        coords.x = e.clientX;
        coords.y = e.clientY;
    });
    
    function animateCircles() {
        let x = coords.x;
        let y = coords.y;
        
        circles.forEach(function (circle, index) {
            circle.style.left = x - 2 + "px";
            circle.style.top = y - 12 + "px";
            
            circle.style.scale = (circles.length - index) / circles.length;
            
            circle.x = x;
            circle.y = y;
            
            const nextCircle = circles[index + 1] || circles[0];
            x += (nextCircle.x - x) * 0.3;
            y += (nextCircle.y - y) * 0.3;
        });
        
        requestAnimationFrame(animateCircles);
    }
    
    animateCircles();
    
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
