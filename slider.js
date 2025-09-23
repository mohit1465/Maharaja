document.addEventListener('DOMContentLoaded', function() {
    // Get all slides, dots, and navigation buttons
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    let currentSlide = 0;
    let slideInterval;
    const slideDuration = 5000; // 5 seconds
    
    // Function to show a specific slide
    function showSlide(index) {
        // Hide all slides and remove active class from dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Show the current slide and update dot
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    // Function to go to next slide
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    // Function to go to previous slide
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    // Start the slideshow
    function startSlideshow() {
        slideInterval = setInterval(nextSlide, slideDuration);
    }
    
    // Pause the slideshow when hovering over the slider
    function pauseSlideshow() {
        clearInterval(slideInterval);
    }
    
    // Event Listeners
    prevBtn.addEventListener('click', () => {
        pauseSlideshow();
        prevSlide();
    });
    
    nextBtn.addEventListener('click', () => {
        pauseSlideshow();
        nextSlide();
    });
    
    // Add click event to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            pauseSlideshow();
            showSlide(index);
        });
    });
    
    // Pause on hover
    const slider = document.querySelector('.banner-slider');
    slider.addEventListener('mouseenter', pauseSlideshow);
    slider.addEventListener('mouseleave', startSlideshow);
    
    // Initialize the slider
    showSlide(0);
    startSlideshow();
});
