// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

/* ---------------- Firebase config ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyDbWHHhhqg1Hkju1Fxj69pqaPmWDE0UlxQ",
  authDomain: "maharaja-fca8b.firebaseapp.com",
  projectId: "maharaja-fca8b",
  storageBucket: "maharaja-fca8b.firebasestorage.app",
  messagingSenderId: "193258828560",
  appId: "1:193258828560:web:2dc748cbe49df2468aab95",
  measurementId: "G-V92XEJ4XFR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

/* ---------------- DOM ---------------- */
const productGrid = document.getElementById("product-grid");
const cartSidebar = document.getElementById("cart");
let cartItemsDiv = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const wishCount = document.getElementById("wish-count");
const wishlistPanel = document.getElementById("wishlist");
const wishlistItemsDiv = document.getElementById("wishlist-items");
const mainContent = document.getElementById('home');

// Header elements
const header = document.querySelector('.header');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');

// Navigation elements
const btnHome = document.getElementById('btn-home');
const btnProfile = document.getElementById('btn-profile');
const btnProfileMobile = document.getElementById('btn-profile-mobile');
const btnContact = document.getElementById('btn-contact');
const btnContactMobile = document.getElementById('btn-contact-mobile');
const btnOrders = document.getElementById('btn-orders');
const btnOrdersMobile = document.getElementById('btn-orders-mobile');
const btnCart = document.getElementById('btn-cart');
const btnWishlist = document.getElementById('btn-wishlist');
const btnWishlistProfile = document.querySelector('.profile-wishlist');
const profileDropdown = document.querySelector('.profile-dropdown');

// Handle header scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
const mobileLinks = document.querySelectorAll('.mobile-link');
const mobileDropdowns = document.querySelectorAll('.mobile-dropdown');
const profileBtn = document.getElementById('profile-btn');
const profileDropdownContent = document.getElementById('profile-dropdown-content');
const authButtons = document.getElementById('auth-buttons');
const userProfile = document.getElementById('user-profile');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('user-email');
const profileImage = document.getElementById('profile-image');

// Navigation buttons
const btnAllProducts = document.getElementById("btn-all-products");
const btnAlmonds = document.getElementById("btn-almonds");
const btnAllProductsMobile = document.getElementById("btn-all-products-mobile");
const btnAlmondsMobile = document.getElementById("btn-almonds-mobile");
const btnGoogleLogin = document.getElementById("btn-google-login");
const btnEmailLogin = document.getElementById("btn-email-login");
const btnLogout = document.getElementById("btn-logout");

// Modal elements
const modal = document.getElementById("product-modal");
const modalClose = document.getElementById("modal-close");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalHindi = document.getElementById("modal-hindi");
const modalUnitPrice = document.getElementById("modal-unit-price");
const modalSubtotal = document.getElementById("modal-subtotal");
const modalVariant = document.getElementById("modal-variant");
const modalCount = document.getElementById("modal-count");
const modalAdd = document.getElementById("modal-add");
const modalWish = document.getElementById("modal-wish");

/* ---------------- Header Functionality ---------------- */
// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
  mobileNav.classList.toggle('active');
  mobileMenuBtn.classList.toggle('active');
});

// Mobile dropdown toggles
mobileDropdowns.forEach(dropdown => {
  const link = dropdown.querySelector('.mobile-link');
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to document
    
    // Close all other dropdowns first
    mobileDropdowns.forEach(otherDropdown => {
      if (otherDropdown !== dropdown && otherDropdown.classList.contains('active')) {
        otherDropdown.classList.remove('active');
      }
    });
    
    // Toggle the clicked dropdown
    dropdown.classList.toggle('active');
    
    // Prevent the click from reaching the mobile nav
    return false;
  });
  
  // Also prevent clicks on the dropdown menu from closing the mobile nav
  const dropdownMenu = dropdown.querySelector('.mobile-dropdown-menu');
  if (dropdownMenu) {
    dropdownMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
});

// Profile dropdown toggle
profileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle('active');
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  // Close profile dropdown
  if (!profileDropdown.contains(e.target)) {
    profileDropdown.classList.remove('active');
  }
  
  // Close mobile dropdowns when clicking outside
  mobileDropdowns.forEach(dropdown => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
});

// Handle mobile link clicks
mobileLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    // Don't close if it's a dropdown toggle link
    if (link.closest('.mobile-dropdown')) {
      e.stopPropagation();
      return;
    }
    
    // If it's the home button, show main content
    if (link.id === 'btn-home') {
      e.preventDefault();
      e.stopPropagation();
      showMainContent();
      
      // Update active states
      document.querySelectorAll('.mobile-link').forEach(link => {
        link.classList.remove('active');
      });
      link.classList.add('active');
    }
    
    // Close mobile menu
    mobileNav.classList.remove('active');
    mobileMenuBtn.classList.remove('active');
  });
});

// Dropdown initialization is now handled within the renderProducts function
// Auth flows
async function handleGoogleLogin() {
  try {
    // Try with popup first
    try {
      await signInWithPopup(auth, provider);
    } catch (popupError) {
      // If popup is blocked or fails, try redirect
      if (popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.message.includes('Cross-Origin-Opener-Policy')) {
        // Show message to user
        alert('Popup was blocked. Please allow popups for this site or try the email login option.');
      } else {
        throw popupError; // Re-throw other errors
      }
    }
  } catch (e) {
    console.error("Login error:", e);
    alert("Login failed: " + (e.message || 'Unknown error occurred'));
  }
}

async function handleEmailLogin() {
  const isNew = confirm("Create a new account? OK = Signup, Cancel = Login");
  const email = prompt("Email:");
  const pass = prompt("Password (6+ chars):");
  if (!email || !pass) return alert("Cancelled");

  try {
    if (isNew) {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const name = prompt("Your name (optional):");
      if (name) await updateProfile(res.user, { displayName: name });
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
    }
  } catch (err) {
    alert(err.message);
  }
}

// Event listeners for auth buttons
if (btnGoogleLogin) {
  btnGoogleLogin.addEventListener('click', handleGoogleLogin);
}

if (btnEmailLogin) {
  btnEmailLogin.addEventListener('click', handleEmailLogin);
}

// Handle logout functionality
async function handleLogout() {
  try {
    // Sign out from Firebase
    await signOut(auth);
    
    // Clear any local state
    currentUser = null;
    localCart = {};
    
    // Reload the page to reset the application state
    window.location.reload();
  } catch (error) {
    console.error('Logout error:', error);
    showMessage('Error during logout. Please try again.', 'error');
  }
}

// Add event listeners for logout buttons
if (btnLogout) {
  btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
  });
}

// Handle all logout buttons
const logoutButtons = [
  'btn-logout',           // Main logout button
  'btn-logout-profile'    // Profile menu logout button
];

logoutButtons.forEach(btnId => {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
});

// Navigation functions
function hideAllSections() {
  // Hide all main content sections and sidebars
  document.querySelectorAll('main').forEach(section => {
    section.style.display = 'none';
  });
  
  // Close sidebars
  if (cartSidebar) cartSidebar.style.display = 'none';
  if (wishlistPanel) wishlistPanel.style.display = 'none';
  
  // Reset body overflow
  document.body.style.overflow = 'auto';
  
  // Close mobile menu if open
  if (mobileNav && mobileNav.classList.contains('active')) {
    mobileNav.classList.remove('active');
    if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  }
}

function updateActiveNav(activeId) {
  // Update active state in navigation
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to the clicked link (both desktop and mobile)
  if (activeId) {
    const desktopLink = document.getElementById(activeId);
    const mobileLink = document.getElementById(`${activeId}-mobile`);
    
    if (desktopLink) desktopLink.classList.add('active');
    if (mobileLink) mobileLink.classList.add('active');
  }
}

function showMainContent() {
  hideAllSections();
  
  // Show the home content
  if (mainContent) {
    mainContent.style.display = 'block';
    updateActiveNav('btn-home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showCart() {
  hideAllSections();
  
  // Show the cart
  if (cartSidebar) {
    cartSidebar.style.display = 'block';
    renderCart();
    updateActiveNav('btn-cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showWishlist() {
  hideAllSections();
  
  // Show the wishlist
  if (wishlistPanel) {
    wishlistPanel.style.display = 'block';
    renderWishlist();
    updateActiveNav('btn-wishlist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showProfile() {
  hideAllSections();
  
  // Get references to profile elements
  const profileSection = document.getElementById('profile');
  const loggedInView = document.getElementById('profile-logged-in');
  const notLoggedInView = document.getElementById('profile-not-logged-in');
  
  if (profileSection) {
    profileSection.style.display = 'block';
    
    if (currentUser) {
      // User is logged in, show profile
      if (loggedInView) loggedInView.style.display = 'block';
      if (notLoggedInView) notLoggedInView.style.display = 'none';
      
      // Load and display user profile data
      loadUserProfile().then(profile => {
        if (profile) {
          const usernameElement = document.getElementById('profile-username');
          const emailElement = document.getElementById('profile-email');
          const fullNameInput = document.getElementById('full-name');
          const phoneInput = document.getElementById('phone');
          const addressInput = document.getElementById('address');
          const avatarImg = document.getElementById('profile-avatar');
          
          if (usernameElement) usernameElement.textContent = `Welcome, ${profile.displayName || 'User'}`;
          if (emailElement) emailElement.textContent = profile.email || '';
          if (fullNameInput) fullNameInput.value = profile.displayName || '';
          if (phoneInput) phoneInput.value = profile.phone || '';
          if (addressInput) addressInput.value = profile.address || '';
          if (avatarImg && profile.photoURL) avatarImg.src = profile.photoURL;
        }
      }).catch(error => {
        console.error('Error loading profile:', error);
      });
    } else {
      // User is not logged in, show login prompt
      if (loggedInView) loggedInView.style.display = 'none';
      if (notLoggedInView) notLoggedInView.style.display = 'block';
      
      // Add event listeners for login/register buttons
      const btnShowLogin = document.getElementById('btn-show-login');
      const btnShowRegister = document.getElementById('btn-show-register');
      
      if (btnShowLogin) {
        btnShowLogin.onclick = (e) => {
          e.preventDefault();
          // Show the login modal or redirect to login page
          const loginModal = document.querySelector('.auth-modal');
          if (loginModal) loginModal.style.display = 'flex';
        };
      }
      
      if (btnShowRegister) {
        btnShowRegister.onclick = (e) => {
          e.preventDefault();
          // Show the register modal or redirect to register page
          const registerModal = document.querySelector('.auth-modal');
          if (registerModal) registerModal.style.display = 'flex';
        };
      }
    }
    
    updateActiveNav('btn-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showContact() {
  hideAllSections();
  
  // Show the contact section
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    contactSection.style.display = 'block';
    updateActiveNav('btn-contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

async function showOrders() {
  hideAllSections();
  
  // Show the orders section
  const ordersSection = document.getElementById('orders');
  if (ordersSection) {
    ordersSection.style.display = 'block';
    
    // Load user's orders if logged in
    if (currentUser) {
      try {
        await loadUserOrders();
      } catch (error) {
        console.error('Error loading orders:', error);
        showMessage('Failed to load orders. Please try again.', 'error');
      }
    } else {
      // Show login prompt if not logged in
      const ordersList = document.getElementById('orders-list');
      if (ordersList) {
        ordersList.innerHTML = `
          <div class="no-orders">
            <i class="fas fa-sign-in-alt"></i>
            <h3>Please Sign In</h3>
            <p>You need to be signed in to view your orders.</p>
            <button class="btn btn-primary" id="login-to-view-orders">Sign In</button>
          </div>
        `;
        
        // Add event listener for login button
        const loginBtn = document.getElementById('login-to-view-orders');
        if (loginBtn) {
          loginBtn.addEventListener('click', () => {
            window.location.hash = 'login';
          });
        }
      }
    }
    updateActiveNav('btn-orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Navigation event listeners
if (btnHome) {
  btnHome.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showMainContent();
  });
}

// Profile menu event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Function to close dropdown
  const closeDropdown = () => {
    const dropdown = document.querySelector('.dropdown-menu.show');
    if (dropdown) {
      dropdown.classList.remove('show');
    }
  };

  // My Profile
  const profileLink = document.getElementById('btn-profile-menu');
  if (profileLink) {
    profileLink.addEventListener('click', (e) => {
      e.preventDefault();
      showProfile();
      closeDropdown();
    });
  }

  // My Orders
  const ordersLink = document.getElementById('btn-orders-menu');
  if (ordersLink) {
    ordersLink.addEventListener('click', (e) => {
      e.preventDefault();
      showOrders();
      closeDropdown();
    });
  }

  // Wishlist
  const wishlistLink = document.getElementById('btn-wishlist-menu');
  if (wishlistLink) {
    wishlistLink.addEventListener('click', (e) => {
      e.preventDefault();
      showWishlist();
      closeDropdown();
    });
  }

  // Cart
  const cartLink = document.getElementById('btn-cart-menu');
  if (cartLink) {
    cartLink.addEventListener('click', (e) => {
      e.preventDefault();
      showCart();
      closeDropdown();
    });
  }
});

if (btnCart) {
  btnCart.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showCart();
  });
}

if (btnWishlist) {
  btnWishlist.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showWishlist();
  });
}

if (btnWishlistProfile) {
  btnWishlistProfile.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showWishlist();
    profileDropdown.classList.remove('active');
  });
}

// Profile navigation
if (btnProfile) {
  btnProfile.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showProfile();
  });
}

if (btnProfileMobile) {
  btnProfileMobile.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showProfile();
  });
}

// Contact Us navigation
if (btnContact) {
  btnContact.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showContact();
  });
}

if (btnContactMobile) {
  btnContactMobile.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showContact();
  });
}

// My Orders navigation
if (btnOrders) {
  btnOrders.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showOrders();
  });
}

if (btnOrdersMobile) {
  btnOrdersMobile.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showOrders();
  });
}

// Initialize by showing the main content
showMainContent();

// Add event listeners for the new navigation buttons
document.addEventListener('DOMContentLoaded', () => {
  // Handle continue shopping and browse products buttons
  document.addEventListener('click', function(e) {
    // Check for continue shopping button
    const continueBtn = e.target.closest('#continue-shopping, #browse-products');
    if (!continueBtn) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Hide cart view if it exists
    const cartView = document.getElementById('cart-view');
    if (cartView) {
      cartView.style.display = 'none';
    }
    
    // Show the main content
    const mainContent = document.getElementById('home');
    if (mainContent) {
      mainContent.style.display = 'block';
      
      // Update active navigation
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.id === 'btn-home') {
          link.classList.add('active');
        }
      });
      
      // Force a reflow/repaint
      document.body.offsetHeight;
      
      // Smooth scroll to section header
      const sectionHeader = document.querySelector('.categories');
      if (sectionHeader) {
        sectionHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback to top if section header not found
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Change URL without reloading
      window.history.pushState({}, '', '#');
    } else {
      // Fallback: Redirect to home
      window.location.href = '#';
    }
  });

  // Back to shop button in wishlist
  const backToShopBtn = document.getElementById('back-to-shop');
  if (backToShopBtn) {
    backToShopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showMainContent();
      window.scrollTo(0, 0);
    });
  }

  // Browse products button in empty wishlist
  const browseProductsBtn = document.getElementById('browse-products');
  if (browseProductsBtn) {
    browseProductsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showMainContent();
      window.scrollTo(0, 0);
    });
  }
});

// Category filters
function filterProducts(category) {
  // Update active state of all category buttons
  const allCategoryButtons = document.querySelectorAll('.category');
  allCategoryButtons.forEach(btn => {
    if (btn.dataset.cat === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update active state of all category links in the dropdown
  const allCategoryLinks = document.querySelectorAll('.dropdown-menu a[data-category]');
  allCategoryLinks.forEach(link => {
    if (link.dataset.category === category) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // Render products with the selected category filter
  renderProducts(category);
}

// ... (rest of the code remains the same)

// Navigation menu category links
function setupCategoryLink(element, category) {
  if (!element) return;
  
  element.addEventListener('click', (e) => {
    e.preventDefault();
    
    // First show the main content
    showMainContent();
    
    // Then filter the products
    filterProducts(category);
    
    // Close mobile menu if open
    if (mobileNav && mobileNav.classList.contains('active')) {
      mobileNav.classList.remove('active');
    }
    
    // Scroll to categories section
    const sectionHeader = document.querySelector('.categories');
    if (sectionHeader) {
      sectionHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Set up category filters for all category buttons
document.addEventListener('DOMContentLoaded', () => {
  // Desktop and mobile category buttons
  const categoryButtons = document.querySelectorAll('.category');
  
  categoryButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const category = button.dataset.cat;
      
      // First show the main content
      showMainContent();
      
      // Then filter the products
      filterProducts(category);
      
      // Scroll to categories section
      const sectionHeader = document.querySelector('.categories');
      if (sectionHeader) {
        sectionHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Close mobile menu if open
      if (mobileNav.classList.contains('active')) {
        mobileNav.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
      }
    });
  });

  // Navigation menu category links
  setupCategoryLink(btnAllProducts, 'All');
  setupCategoryLink(btnAlmonds, 'Almonds');
  setupCategoryLink(btnAllProductsMobile, 'All');
  setupCategoryLink(btnAlmondsMobile, 'Almonds');
  
  // Set up additional category links for desktop
  const btnWalnuts = document.getElementById('btn-walnuts');
  const btnOtherDryFruits = document.getElementById('btn-other-dry-fruits');
  const btnCashews = document.getElementById('btn-cashews');
  const btnPistachios = document.getElementById('btn-pistachios');
  
  if (btnWalnuts) setupCategoryLink(btnWalnuts, 'Walnuts');
  if (btnOtherDryFruits) setupCategoryLink(btnOtherDryFruits, 'Other Dry Fruits');
  if (btnCashews) setupCategoryLink(btnCashews, 'Cashews');
  if (btnPistachios) setupCategoryLink(btnPistachios, 'Pistachios');
  
  // Set up mobile category links
  const mobileCategoryLinks = document.querySelectorAll('.mobile-dropdown-menu a[data-category]');
  mobileCategoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.getAttribute('data-category');
      
      // Close mobile menu
      if (mobileNav) {
        mobileNav.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
      }
      
      // Show main content and filter products
      showMainContent();
      filterProducts(category);
      
      // Scroll to categories section
      const sectionHeader = document.querySelector('.categories');
      if (sectionHeader) {
        sectionHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // Toggle mobile dropdown menus
  const mobileDropdowns = document.querySelectorAll('.mobile-dropdown > .mobile-link');
  mobileDropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', (e) => {
      e.preventDefault();
      const menu = dropdown.nextElementSibling;
      if (menu && menu.classList.contains('mobile-dropdown-menu')) {
        menu.classList.toggle('show');
        const icon = dropdown.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-chevron-down');
          icon.classList.toggle('fa-chevron-up');
        }
      } else {
        // If not a dropdown, navigate to the link
        const href = dropdown.getAttribute('href');
        if (href && href !== '#') {
          window.location.href = href;
        }
      }
    });
  });
});

/* ---------------- Products (with 250 gm as base) ---------------- */
const products = [
  // Almonds
  {
    id: 'alm-001',
    category: "Almonds",
    name: "American badam Giri",
    hindiName: "अमेरिकन बादाम गिरी",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 250, // 500 / 2
    images: { 1: "assets/products/American badam Giri.png" }
  },
  {
    id: 'alm-002',
    category: "Almonds",
    name: "Badam with shell",
    hindiName: "छिलके वाला बादाम",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 185, // 740 / 4
    images: { 1: "assets/products/Badam with shell.png" }
  },
  {
    id: 'alm-003',
    category: "Almonds",
    name: "Kagzi badam",
    hindiName: "कागज़ी बादाम",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 112.5, // 450 / 4
    images: { 1: "assets/products/Kagzi badam.png" }
  },
  {
    id: 'alm-004',
    category: "Almonds",
    name: "Kashmiri Giri Almonds",
    hindiName: "कश्मीरी गिरी बादाम",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 350, // 700 / 2
    images: { 1: "assets/products/Kashmiri Giri Almonds.png" }
  },
  {
    id: 'alm-005',
    category: "Almonds",
    name: "Paper Shell Almond (with shell)",
    hindiName: "पेपर शेल बादाम",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 237.5, // 950 / 4
    images: { 1: "assets/products/Paper Shell Almond (with shell).png" }
  },

  // Walnuts
  {
    id: 'wal-001',
    category: "Walnuts",
    name: "A-1 Kashmiri Regular Walnuts",
    hindiName: "ए-1 कश्मीरी अखरोट",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 87.5, // 350 / 4
    images: { 1: "assets/products/A-1 Kashmiri Regular Walnuts.png" }
  },
  {
    id: 'wal-002',
    category: "Walnuts",
    name: "Kashmiri Walnut Giri",
    hindiName: "कश्मीरी अखरोट गिरी",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 300, // 600 / 2
    images: { 1: "assets/products/Kashmiri Walnut Giri.png" }
  },
  {
    id: 'wal-003',
    category: "Walnuts",
    name: "Krela Akhrot",
    hindiName: "केला अखरोट",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 187.5, // 750 / 4
    images: { 1: "assets/products/Krela Akhrot.png" }
  },
  {
    id: 'wal-004',
    category: "Walnuts",
    name: "Silver Queen Walnuts",
    hindiName: "सिल्वर क्वीन अखरोट",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 120, // 480 / 4
    images: { 1: "assets/products/Silver Queen Walnuts.png" }
  },
  {
    id: 'wal-005',
    category: "Walnuts",
    name: "Super Walnuts with Shell",
    hindiName: "सुपर अखरोट (छिलके वाला)",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 150, // 600 / 4
    images: { 1: "assets/products/Super Walnuts with Shell.png" }
  },
  {
    id: 'wal-006',
    category: "Walnuts",
    name: "Superior Quality Walnuts with Shell",
    hindiName: "उत्तम गुणवत्ता अखरोट (छिलके वाला)",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 275, // 1100 / 4
    images: { 1: "assets/products/Superior Quality Walnuts with Shell.png" }
  },
  {
    id: 'wal-007',
    category: "Walnuts",
    name: "Akhrot Giri White",
    hindiName: "अखरोट गिरी सफेद",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 350, // 700 / 2
    images: { 1: "assets/products/Akhrot Giri White.png" }
  },
  {
    id: 'wal-008',
    category: "Walnuts",
    name: "Walnuts Superior Quality (medium size)",
    hindiName: "उत्तम गुणवत्ता अखरोट (मध्यम आकार)",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 212.5, // 850 / 4
    images: { 1: "assets/products/Walnuts Superior Quality (medium size).png" }
  },
  {
    id: 'wal-009',
    category: "Walnuts",
    name: "Snow White Akhrot Giri",
    hindiName: "स्नो व्हाइट अखरोट गिरी",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 450, // 900 / 2
    images: { 1: "assets/products/Snow White Akhrot Giri.png" }
  },

  // Other Dry Fruits
  {
    id: 'dry-001',
    category: "Other Dry Fruits",
    name: "Chilloza (Pine Nuts)",
    hindiName: "चिलगोजा",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 1400, // already 250 gm
    images: { 1: "assets/products/Chilloza (Pine Nuts).png" }
  },
  {
    id: 'dry-002',
    category: "Other Dry Fruits",
    name: "Anjeer (Fig)",
    hindiName: "अंजीर",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 250, // 500 / 2
    images: { 1: "assets/products/Anjeer (Fig).png" }
  },
  {
    id: 'dry-003',
    category: "Other Dry Fruits",
    name: "Kishmish",
    hindiName: "किशमिश",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 170, // 340 / 2
    images: { 1: "assets/products/Kishmish.png" }
  },
  {
    id: 'dry-004',
    category: "Other Dry Fruits",
    name: "Mix Dry fruit Murabha",
    hindiName: "मिक्स ड्राई फ्रूट मुरब्बा",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 375, // 790 / ~2.1
    images: { 1: "assets/products/Mix Dry fruit Murabha.png" }
  },
  {
    id: 'dry-005',
    category: "Other Dry Fruits",
    name: "Panch Mewa",
    hindiName: "पंच मेवा",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 275, // 220 / 200 * 250
    images: { 1: "assets/products/Panch Mewa.png" }
  },
  {
    id: 'dry-006',
    category: "Other Dry Fruits",
    name: "Pista roasted",
    hindiName: "भुना हुआ पिस्ता",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 350, // 700 / 2
    images: { 1: "assets/products/Pista roasted.png" }
  },
  {
    id: 'dry-007',
    category: "Other Dry Fruits",
    name: "Turkel Apricot",
    hindiName: "तुर्केल खुबानी",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 275, // 220 / 200 * 250
    images: { 1: "assets/products/Turkel Apricot.png" }
  },
  {
    id: 'dry-008',
    category: "Other Dry Fruits",
    name: "Khumani white",
    hindiName: "सफेद खुबानी",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 225, // 450 / 2
    images: { 1: "assets/products/Khumani white.png" }
  },
  {
    id: 'dry-009',
    category: "Other Dry Fruits",
    name: "Blueberry",
    hindiName: "ब्लूबेरी",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 600, // 480 / 200 * 250
    images: { 1: "assets/products/Blueberry.png" }
  },
  {
    id: 'dry-010',
    category: "Other Dry Fruits",
    name: "Cashew",
    hindiName: "काजू",
    quantities_available: ["250 gm", "500 gm", "1kg", "2kg"],
    price: 300, // 600 / 2
    images: { 1: "assets/products/Cashew.png" }
  }
];

/* ---------------- App state per signed-in user ---------------- */
let currentUser = null;
let localCart = {};     // map key -> { id, variant, count, unitPrice, subtotal, name, image }
let localWishlist = {}; // map productId -> true

/* ---------------- Utilities ---------------- */
const formatPrice = (n) => new Intl.NumberFormat('en-IN').format(n);

// Show message to user
function showMessage(message, type = 'info') {
  // Check if message container exists, if not create it
  let messageContainer = document.getElementById('message-container');
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    messageContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 300px;
    `;
    document.body.appendChild(messageContainer);
  }

  // Create message element
  const messageEl = document.createElement('div');
  messageEl.style.cssText = `
    padding: 12px 20px;
    margin-bottom: 10px;
    border-radius: 4px;
    color: white;
    background-color: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  
  messageEl.innerHTML = `
    <span>${message}</span>
    <button style="background: none; border: none; color: white; cursor: pointer; margin-left: 10px;">×</button>
  `;

  // Add close button functionality
  const closeBtn = messageEl.querySelector('button');
  closeBtn.onclick = () => {
    messageEl.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => messageEl.remove(), 300);
  };

  // Auto-remove after 5 seconds
  const timer = setTimeout(() => {
    messageEl.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => messageEl.remove(), 300);
  }, 5000);

  // Pause auto-remove on hover
  messageEl.onmouseenter = () => clearTimeout(timer);
  messageEl.onmouseleave = () => {
    setTimeout(() => {
      messageEl.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => messageEl.remove(), 300);
    }, 2000);
  };

  // Add to container
  messageContainer.insertBefore(messageEl, messageContainer.firstChild);

  // Add styles if not already added
  if (!document.getElementById('message-styles')) {
    const style = document.createElement('style');
    style.id = 'message-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
  }
}

function productById(id) { return products.find(p => p.id === id); }
function gramsFromVariant(variant) {
  if (!variant) return 250;
  if (variant.includes("kg")) return parseFloat(variant) * 1000;
  const v = parseInt(variant); // handles "250 gm" or "500 gm"
  return isNaN(v) ? 250 : v;
}
function calculateUnitPrice(basePer250g, variant) {
  const grams = gramsFromVariant(variant);
  const factor = grams / 250;
  return basePer250g * factor;
}
function sanitizeKey(productId, variant) {
  return `${productId}||${variant.replace(/\s+/g, '_')}`;
}

/* ---------------- Render products ---------------- */
function renderProducts(filterCat = "All") {
  productGrid.innerHTML = "";
  const list = products.filter(p => filterCat === "All" || p.category === filterCat);
  list.forEach(p => {
    const el = document.createElement("div");
    el.className = "card";
    // default variant 250g and count 1
    const defaultVariant = p.quantities_available[0] || "250 gm";
    const unitPrice = calculateUnitPrice(p.price, defaultVariant);
    el.innerHTML = `
        <div class="product-card" data-id="${p.id}" data-action="view">
          <div class="product-img">
              <img src="${p.images['1']}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(p.name)}'">
              <span class="product-badge">${p.category}</span>
              <button class="btnWish ${localWishlist[p.id] ? 'active' : ''}" data-id="${p.id}">
                <i class="${localWishlist[p.id] ? 'fas' : 'far'} fa-heart" style="font-weight:600; font-size: 17px;"></i>
              </button>
          </div>
          <div class="product-details">
            <h3 class="product-title">${p.name}</h3>
            ${p.hindiName ? `<div class="product-hindi">${p.hindiName}</div>` : ''}
            <div class="product-selectors">
              <!-- Hidden select elements for cart functionality -->
              <select id="variant-${p.id}" style="display: none;">
                ${p.quantities_available.map(q => `<option value="${q}">${q}</option>`).join("")}
              </select>
              <select id="count-${p.id}" style="display: none;">
                ${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("")}
              </select>
              
              <!-- Custom dropdown UI -->
              <div class="dropdown" id="variant-dropdown-${p.id}">
                <div class="selected">${p.quantities_available[0]} <span class="arrow">▼</span></div>
                <ul>
                  ${p.quantities_available.map(q => `<li data-value="${q}">${q}</li>`).join("")}
                </ul>
              </div>
              <div class="dropdown" id="count-dropdown-${p.id}">
                <div class="selected">1 <span class="arrow">▼</span></div>
                <ul>
                  ${Array.from({ length: 10 }, (_, i) => `<li data-value="${i + 1}">${i + 1}</li>`).join("")}
                </ul>
              </div>
            </div>
            <div class="product-meta">
              <div class="price-container">
                  <div class="product-price-subtotal">₹ <span id="sub-${p.id}">${formatPrice(unitPrice)}</span></div>
              </div>
              <button class="add-to-cart" data-id="${p.id}" data-product='${JSON.stringify(p)}'>
                  Add to Cart
              </button>
            </div>
        </div>
        `;

    // Add the card to the product grid
    if (productGrid) {
      productGrid.appendChild(el);
    }

    // Add event listeners for price updates
    const variantSel = document.getElementById(`variant-${p.id}`);
    const countSel = document.getElementById(`count-${p.id}`);
    const subSpan = document.getElementById(`sub-${p.id}`);
    const variantDropdown = document.getElementById(`variant-dropdown-${p.id}`);
    const countDropdown = document.getElementById(`count-dropdown-${p.id}`);

    function updatePriceDisplay() {
      const variant = variantSel.value;
      const count = Number(countSel.value);
      const unit = calculateUnitPrice(p.price, variant);
      const subtotal = unit * count;
      subSpan.textContent = formatPrice(subtotal);
    }

    // Initialize dropdowns
    function initDropdown(dropdown, select) {
      const selected = dropdown.querySelector('.selected');
      const options = dropdown.querySelectorAll('ul li');

      // Update selected display
      selected.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });

      // Handle option selection
      options.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const value = option.getAttribute('data-value');
          selected.innerHTML = `${value} <span class="arrow">▼</span>`;
          dropdown.classList.remove('active');
          
          // Update the hidden select
          select.value = value;
          select.dispatchEvent(new Event('change'));
        });
      });
    }

    // Initialize both dropdowns
    initDropdown(variantDropdown, variantSel);
    initDropdown(countDropdown, countSel);

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown').forEach(dd => dd.classList.remove('active'));
    });

    // Set up event listeners for price updates
    variantSel.addEventListener("change", updatePriceDisplay);
    countSel.addEventListener("change", updatePriceDisplay);
    updatePriceDisplay();
  });
}

/* handle card buttons and clicks (delegation) */
productGrid.addEventListener("click", (e) => {
  // First check if it's a button click
  const btn = e.target.closest("button");
  if (btn) {
    const id = btn.dataset.id;
    if (btn.classList.contains("add-to-cart") || btn.classList.contains("add")) {
      // Handle add to cart directly
      e.preventDefault();
      e.stopPropagation();
      const variantSel = document.getElementById(`variant-${id}`);
      const countSel = document.getElementById(`count-${id}`);
      const variant = variantSel ? variantSel.value : (productById(id).quantities_available[0] || "250 gm");
      const count = countSel ? Number(countSel.value) : 1;

      // Add directly to cart without opening modal
      addToCart(id, variant, count);

      // Optional: Show a quick confirmation
      const product = productById(id);
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = `Added ${count} x ${product.name} (${variant}) to cart`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      return;
    } else if (btn.classList.contains("btnWish") || btn.closest('.btnWish')) {
      // Handle wishlist
      e.preventDefault();
      e.stopPropagation();
      const productId = btn.dataset.id || btn.closest('[data-id]')?.dataset.id;
      if (productId) {
        toggleWishlist(productId);
      }
      return;
    }
  }

  // If not a button click and not a form element, check if it's a click on the product card
  const clickedElement = e.target;
  const isFormElement = clickedElement.tagName === 'SELECT' ||
    clickedElement.tagName === 'OPTION' ||
    clickedElement.tagName === 'LABEL' ||
    clickedElement.closest('select, option, label');

  if (!isFormElement) {
    const card = e.target.closest('.product-card');
    if (card) {
      const productId = card.dataset.id;
      openProductModalWith(productId);
    }
  }
});

/* categories */
document.querySelectorAll('.category').forEach(c => {
  c.addEventListener('click', () => {
    document.querySelectorAll('.category').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    renderProducts(c.dataset.cat);
  });
});

/* ---------------- Product modal ---------------- */
let activeProductId = null;

function openProductModalWith(id, presetVariant = null, presetCount = 1, autoAdd = false) {
  const p = productById(id);
  if (!p) return;
  activeProductId = id;
  modalImg.src = p.images[1] || "";
  modalTitle.textContent = p.name;
  modalHindi.textContent = p.hindiName;

  // fill variant select
  modalVariant.innerHTML = "";
  p.quantities_available.forEach(q => {
    const o = document.createElement('option');
    o.value = q; o.textContent = q;
    modalVariant.appendChild(o);
  });

  // fill count select (1..10)
  modalCount.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const o = document.createElement('option'); o.value = i; o.textContent = i;
    modalCount.appendChild(o);
  }

  if (presetVariant) modalVariant.value = presetVariant;
  modalCount.value = presetCount;

  updateModalPrices();

  modal.style.display = "flex";

  if (autoAdd) {
    // not used here, but kept for future flows
    modalAdd.click();
  }
}

modalClose.addEventListener("click", () => modal.style.display = "none");

function updateModalPrices() {
  const p = productById(activeProductId);
  if (!p) return;
  const variant = modalVariant.value;
  const count = Number(modalCount.value);
  const unit = calculateUnitPrice(p.price, variant);
  modalUnitPrice.textContent = formatPrice(unit);
  modalSubtotal.textContent = formatPrice(unit * count);
}
modalVariant.addEventListener("change", updateModalPrices);
modalCount.addEventListener("change", updateModalPrices);

/* modal add to cart */
modalAdd.addEventListener("click", async () => {
  if (!currentUser) return alert("Please login to add to cart.");
  const variant = modalVariant.value;
  const count = Number(modalCount.value);
  await addToCart(activeProductId, variant, count);
  modal.style.display = "none";
});

/* modal wishlist */
modalWish.addEventListener("click", async () => {
  if (!currentUser) return alert("Please login to manage wishlist.");
  await toggleWishlist(activeProductId);
});

/* ---------------- Cart logic (no +/-, only dropdowns) ---------------- */
async function addToCart(productId, variant, count = 1) {
  const p = productById(productId);
  if (!p) return;
  const key = sanitizeKey(productId, variant);
  const unitPrice = calculateUnitPrice(p.price, variant);
  if (localCart[key]) {
    // merge counts when same product+variant is added
    localCart[key].count += count;
    localCart[key].subtotal = localCart[key].unitPrice * localCart[key].count;
  } else {
    localCart[key] = {
      id: productId,
      variant,
      count,
      unitPrice,
      subtotal: unitPrice * count,
      name: p.name,
      image: p.images[1]
    };
  }
  await syncCartToFirestore();
  renderCart();
  updateCartUI(); // Update both count and total
}

async function updateCartItem(key, newVariant = null, newCount = null) {
  const item = localCart[key];
  if (!item) return;

  const product = productById(item.id);
  if (!product) return;

  // Create a new item with updated values
  const updatedItem = { ...item };
  
  if (newVariant !== null) {
    updatedItem.variant = newVariant;
    updatedItem.unitPrice = calculateUnitPrice(product.price, newVariant);
  }
  
  if (newCount !== null) {
    updatedItem.count = newCount;
  }
  
  updatedItem.subtotal = updatedItem.unitPrice * updatedItem.count;
  updatedItem.name = product.name;
  updatedItem.image = product.images[1];

  // Update the cart
  localCart[key] = updatedItem;
  
  // Update Firestore and UI
  await syncCartToFirestore();
  renderCart();
  updateCartUI();
}

async function removeCartItem(key) {
  try {
    console.log('Current cart before removal:', JSON.stringify(localCart));

    // Create a new object without the item to be removed
    const newCart = {};
    Object.keys(localCart).forEach(k => {
      if (k !== key) {
        newCart[k] = localCart[k];
      }
    });

    console.log('New cart after removal:', JSON.stringify(newCart));

    // Update the local cart
    localCart = newCart;

    // Update Firestore and UI
    await syncCartToFirestore();
    renderCart();
    updateCartUI(); // Update both count and total

    console.log('Item removed successfully');
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    throw error; // Re-throw to be caught by the caller
  }
}

// Function to update cart count and total in the header
function updateCartUI() {
  // Update cart count
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  
  if (cartCount) {
    const count = Object.keys(localCart).length;
    cartCount.textContent = count;
  }
  
  // Update cart total
  if (cartTotal) {
    const total = Object.values(localCart).reduce((sum, item) => sum + (item.subtotal || 0), 0);
    cartTotal.textContent = formatPrice(total);
  }
}

// Function to update wishlist count and active states
function updateWishlistUI() {
  const wishCount = document.getElementById('wish-count');
  if (wishCount) {
    const count = Object.keys(localWishlist).length;
    wishCount.textContent = count;
  }
  
  // Update active states of wishlist buttons
  document.querySelectorAll('.btnWish').forEach(btn => {
    const productId = btn.getAttribute('data-id');
    if (productId) {
      const isInWishlist = localWishlist[productId] !== undefined;
      btn.classList.toggle('active', isInWishlist);
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isInWishlist ? 'fas fa-heart' : 'far fa-heart';
      }
    }
  });
}

/* ---------------- Wishlist logic ---------------- */
async function toggleWishlist(productId) {
  if (!currentUser) {
    alert("Please login");
    return;
  }
  if (localWishlist[productId]) {
    delete localWishlist[productId];
  } else {
    localWishlist[productId] = true;
  }
  await syncWishlistToFirestore();
  
  // Update the wishlist button state in the UI
  const wishButton = document.querySelector(`.btnWish[data-id="${productId}"]`);
  if (wishButton) {
    const icon = wishButton.querySelector('i');
    if (localWishlist[productId]) {
      wishButton.classList.add('active');
      icon.classList.remove('far');
      icon.classList.add('fas');
    } else {
      wishButton.classList.remove('active');
      icon.classList.remove('fas');
      icon.classList.add('far');
    }
  }
  
  // Update the wishlist panel
  renderWishlist();
}

/* ---------------- Firestore sync ---------------- */
const cartDocRef = () => currentUser ? doc(db, "users", currentUser.uid, "meta", "cart") : null;
const wishDocRef = () => currentUser ? doc(db, "users", currentUser.uid, "meta", "wishlist") : null;

// Track the last update time to prevent race conditions
let lastCartUpdate = 0;
let lastWishlistUpdate = 0;

// Load and display user orders with filtering
async function loadUserOrders(filterStatus = 'all-orders') {
  const ordersList = document.getElementById('orders-list');
  if (!ordersList || !currentUser) return;

  // Show loading state
  ordersList.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading your orders...</p>
    </div>
  `;

  const ordersRef = collection(db, 'users', currentUser.uid, 'orders');
  
  try {
    // First get all orders sorted by date
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    let orders = [];
    
    // Filter orders based on status if not 'all-orders'
    snapshot.forEach((doc) => {
      const orderData = doc.data();
      if (filterStatus === 'all-orders' || orderData.status === filterStatus) {
        orders.push({
          id: doc.id,
          ...orderData,
          // Convert Firestore timestamp to Date object if it exists
          createdAt: orderData.createdAt?.toDate ? orderData.createdAt.toDate() : new Date(),
        });
      }
    });
    
    // Sort by date in memory (in case we need to re-sort after filtering)
    orders.sort((a, b) => b.createdAt - a.createdAt);

    if (orders.length === 0) {
      ordersList.innerHTML = `
        <div class="no-orders">
          <i class="fas fa-shopping-bag"></i>
          <h3>No Orders Found</h3>
          <p>${filterStatus === 'all-orders' ? "You haven't placed any orders yet." : `No ${filterStatus} orders found.`}</p>
          <a href="#" id="shop-now-btn" class="btn btn-primary">Shop Now</a>
        </div>
      `;
      document.getElementById('shop-now-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('shop');
      });
    } else {
      let ordersHTML = `
        <div class="orders-grid">
      `;

      orders.forEach((order) => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
        const formattedDate = orderDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        // Calculate total items
        const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

        ordersHTML += `
          <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
              <div>
                <h3>Order #${order.id.substring(0, 8).toUpperCase()}</h3>
                <p class="order-date">${formattedDate}</p>
                <p class="order-items">${totalItems} item${totalItems !== 1 ? 's' : ''} • ₹${formatPrice(order.total || 0)}</p>
              </div>
              <span class="order-status ${order.status || 'pending'}">${order.status || 'Pending'}</span>
            </div>
            
            <div class="order-preview">
              ${order.items.slice(0, 3).map(item => `
                <img src="${item.image || 'assets/icons/package.svg'}" alt="${item.name}" 
                     title="${item.name} - ${item.quantity} × ₹${formatPrice(item.unitPrice)}">
              `).join('')}
              ${order.items.length > 3 ? `
                <div class="more-items">+${order.items.length - 3} more</div>
              ` : ''}
            </div>
            
            <div class="order-actions">
              <button class="btn btn-outline view-order" data-order-id="${order.id}">
                View Details
              </button>
              ${order.status === 'pending' ? `
                <button class="btn btn-text cancel-order" data-order-id="${order.id}">
                  Cancel Order
                </button>
              ` : ''}
            </div>
          </div>
        `;
      });

      ordersHTML += `
        </div>
      `;
      
      ordersList.innerHTML = ordersHTML;
      
      // Add event listeners for view order buttons
      document.querySelectorAll('.view-order').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const orderId = e.target.closest('button').dataset.orderId;
          viewOrderDetails(orderId);
        });
      });
      
      // Add event listeners for tab buttons
      const tabButtons = document.querySelectorAll('.orders-tabs .tab-btn');
      tabButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          const tabId = e.currentTarget.getAttribute('data-tab');
          
          // Update active tab
          tabButtons.forEach(btn => btn.classList.remove('active'));
          e.currentTarget.classList.add('active');
          
          // Load orders with the selected filter
          await loadUserOrders(tabId);
        });
      });
      
      // Add event listeners for cancel order buttons
      document.querySelectorAll('.cancel-order').forEach(button => {
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          const orderId = e.target.closest('button').dataset.orderId;
          if (confirm('Are you sure you want to cancel this order?')) {
            try {
              await updateDoc(doc(db, 'users', currentUser.uid, 'orders', orderId), {
                status: 'cancelled',
                updatedAt: serverTimestamp()
              });
              showMessage('Order cancelled successfully', 'success');
              loadUserOrders();
            } catch (error) {
              console.error('Error cancelling order:', error);
              showMessage('Failed to cancel order', 'error');
            }
          }
        });
      });
    }
    
  } catch (error) {
    console.error('Error loading orders:', error);
    ordersList.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Failed to load orders</h3>
        <p>${error.message || 'Please try again later.'}</p>
        <button id="retry-orders" class="btn btn-primary">Retry</button>
      </div>
    `;
    document.getElementById('retry-orders')?.addEventListener('click', () => loadUserOrders(filterStatus));
  }
}

async function viewOrderDetails(orderId) {
  if (!currentUser) return;
  
  try {
    const orderDoc = await getDoc(doc(db, 'users', currentUser.uid, 'orders', orderId));
    if (!orderDoc.exists()) {
      showMessage('Order not found', 'error');
      return;
    }
    
    const order = orderDoc.data();
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let orderDetailsHTML = `
      <div class="order-details">
        <div class="order-details-header">
          <h2>Order #${orderId.substring(0, 8).toUpperCase()}</h2>
          <span class="order-status ${order.status || 'pending'}">${order.status || 'Pending'}</span>
        </div>
        
        <p class="order-date">Placed on ${formattedDate}</p>
        
        <div class="order-summary">
          <h3>Order Summary</h3>
          <div class="order-items-details">
            ${order.items.map(item => `
              <div class="order-item-detail">
                <img src="${item.image || 'assets/icons/package.svg'}" alt="${item.name}">
                <div class="item-info">
                  <h4>${item.name}</h4>
                  <p>${item.variant || 'Regular'}</p>
                  <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="item-price">₹${formatPrice((item.unitPrice || 0) * (item.quantity || 1))}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="order-totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${formatPrice(order.items.reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 0)), 0))}</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span>${order.shippingCost ? `₹${formatPrice(order.shippingCost)}` : 'Free'}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>₹${formatPrice(order.total || 0)}</span>
            </div>
          </div>
        </div>
        
        <div class="shipping-details">
          <h3>Shipping Information</h3>
          <div class="shipping-address">
            <p><strong>${order.shipping?.name || 'N/A'}</strong></p>
            <p>${order.shipping?.address || ''}</p>
            <p>${order.shipping?.city || ''}, ${order.shipping?.state || ''} ${order.shipping?.zip || ''}</p>
            <p>${order.shipping?.country || ''}</p>
            <p>Phone: ${order.shipping?.phone || 'N/A'}</p>
            <p>Email: ${order.shipping?.email || 'N/A'}</p>
          </div>
        </div>
        
        <div class="payment-details">
          <h3>Payment Method</h3>
          <p>${order.paymentMethod || 'Cash on Delivery'}</p>
          <p class="payment-status ${order.paymentStatus || 'pending'}">
            Payment Status: ${order.paymentStatus || 'Pending'}
          </p>
        </div>
        
        ${order.notes ? `
          <div class="order-notes">
            <h3>Order Notes</h3>
            <p>${order.notes}</p>
          </div>
        ` : ''}
        
        <div class="order-actions">
          <button class="btn" onclick="window.print()">
            <i class="fas fa-print"></i> Print Order
          </button>
          <button class="btn btn-outline close-order-details">
            <i class="fas fa-arrow-left"></i> Back to Orders
          </button>
        </div>
      </div>
    `;
    
    // Show order details in modal
    const modal = document.getElementById('order-details-modal');
    const modalContent = document.getElementById('order-details-content');
    if (modal && modalContent) {
      modalContent.innerHTML = orderDetailsHTML;
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      
      // Add event listener for close button
      const closeBtn = modal.querySelector('.close-modal');
      const closeOrderDetails = modal.querySelector('.close-order-details');
      
      if (closeBtn) {
        closeBtn.onclick = () => {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        };
      }
      
      if (closeOrderDetails) {
        closeOrderDetails.onclick = () => {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        };
      }
      
      // Close modal when clicking outside
      window.onclick = (event) => {
        if (event.target === modal) {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      };
    }
    
  } catch (error) {
    console.error('Error loading order details:', error);
    showMessage('Error loading order details', 'error');
  }
}

async function syncCartToFirestore() {
  if (!currentUser) return;
  try {
    const now = Date.now();
    lastCartUpdate = now;
    const ref = cartDocRef();
    await setDoc(ref, {
      items: localCart,
      updatedAt: now,
      clientUpdatedAt: now // Add client timestamp
    }, { merge: true });
  } catch (e) {
    console.error("Error saving cart:", e);
  }
}

async function syncWishlistToFirestore() {
  if (!currentUser) return;
  try {
    const now = Date.now();
    lastWishlistUpdate = now;
    const ref = wishDocRef();
    await setDoc(ref, {
      items: localWishlist,
      updatedAt: now,
      clientUpdatedAt: now // Add client timestamp
    }, { merge: true });
  } catch (e) {
    console.error("Error saving wishlist:", e);
  }
}

/* ---------------- Render UI for cart & wishlist (dropdowns) ---------------- */
function renderCart() {
  cartItemsDiv.innerHTML = "";
  if (Object.keys(localCart).length === 0) {
    cartItemsDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything to your cart yet</p>
        <a href="#" id="continue-shopping" class="btn btn-primary">
          <i class="fas fa-store"></i> Browse Products
        </a>
      </div>
    `;
    return;
  }

  // Get keys and sort them based on item names
  const sortedKeys = Object.keys(localCart).sort((keyA, keyB) => {
    return localCart[keyA].name.localeCompare(localCart[keyB].name);
  });

  let total = 0;
  // Render items in sorted order but keep original keys
  sortedKeys.forEach(key => {
    const it = localCart[key];
    total += it.subtotal;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${it.image}" onerror="this.style.opacity=.6" alt="${it.name}">
      <div class="cart-item-details">
        <div>
          <div class="cart-item-title">${it.name}</div>
          <div class="cart-item-variant">Variant:
            <select id="variant-${key}" name="variant-${key}" class="cart-variant" data-key="${key}">
              ${productById(it.id).quantities_available.map(v => 
                `<option value="${v}" ${v === it.variant ? 'selected' : ''}>${v}</option>`
              ).join('')}
            </select>
          </div>
          <div class="cart-item-count">
            Quantity:
            <select id="count-${key}" name="count-${key}" class="cart-countvalue" data-key="${key}">
              ${Array.from({ length: 10 }, (_, i) => i + 1).map(num =>
                `<option value="${num}" ${num === it.count ? 'selected' : ''}>${num}</option>`
              ).join('')}
            </select>
          </div>
          <div class="cart-item-price">
            ₹ ${formatPrice(it.subtotal)}
            <span style="font-size:0.8em;color:#6b7280;font-weight:normal">(₹ ${formatPrice(it.unitPrice)} each)</span>
          </div>
        </div>
      </div>
      <div class="cart-item-actions">
        <button class="btn" data-action="rm" data-key="${key}" title="Remove item">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    cartItemsDiv.appendChild(div);
  });
  // Always update the cart total, even if it's zero
  const cartTotalElement = document.getElementById("cart-total");
  if (cartTotalElement) {
    cartTotalElement.textContent = formatPrice(total);
  }
  
  // Update cart count, showing 0 when empty
  if (cartCount) {
    const itemCount = Object.keys(localCart).length;
    cartCount.textContent = itemCount;
  }

  // Re-attach event listeners after rendering
  if (cartItemsDiv) {
    setupCartEventListeners();
  }
}

// Moved to handleCartSelectChange function

// Handle cart click events including remove button
async function handleCartClick(e) {
  // Check if the click is on a remove button or its children
  const removeBtn = e.target.closest('button[data-action="rm"]');

  if (removeBtn) {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling up

    const key = removeBtn.getAttribute('data-key');
    console.log('Remove button clicked, key:', key); // Debug log

    if (key && localCart[key]) {
      try {
        console.log('Removing item with key:', key); // Debug log
        await removeCartItem(key);
      } catch (error) {
        console.error('Error removing item:', error);
        alert('Error removing item from cart. Please try again.');
      }
    } else {
      console.log('Invalid key or item not found in cart'); // Debug log
    }
    return;
  }

  // Handle other button actions if needed
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.getAttribute('data-action');
  const key = btn.getAttribute('data-key');

  if (action) {
    console.log(`Action: ${action}, Key: ${key}`);
    // Add other action handlers here if needed
  }
}

// Make sure we're not duplicating event listeners
function setupCartEventListeners() {
  // Store the parent element
  const parent = cartItemsDiv.parentNode;

  // Create a new div to replace the old one (this removes all event listeners)
  const newCartItemsDiv = document.createElement('div');
  newCartItemsDiv.id = cartItemsDiv.id;
  newCartItemsDiv.className = cartItemsDiv.className;
  newCartItemsDiv.innerHTML = cartItemsDiv.innerHTML;

  // Replace the old div with the new one
  parent.replaceChild(newCartItemsDiv, cartItemsDiv);

  // Update the cartItemsDiv reference
  cartItemsDiv = newCartItemsDiv;

  // Re-attach event listeners
  cartItemsDiv.addEventListener("change", handleCartSelectChange);
  cartItemsDiv.addEventListener("click", handleCartClick);
}

// Separate function for select change handling
async function handleCartSelectChange(e) {
  const sel = e.target;
  if (sel.classList.contains("cart-variant") || sel.classList.contains("cart-countvalue")) {
    // Get the key from the select element or its parent
    const key = sel.dataset.key || sel.closest('[data-key]')?.dataset.key;
    if (!key) {
      console.error('Could not find key for cart item');
      return;
    }

    if (sel.classList.contains("cart-variant")) {
      const newVariant = sel.value;
      await updateCartItem(key, newVariant, null);
    } else if (sel.classList.contains("cart-countvalue")) {
      const newCount = Number(sel.value);
      await updateCartItem(key, null, newCount);
    }
  }
}

// Initialize cart event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (cartItemsDiv) {
    setupCartEventListeners();
  }
});

/* render wishlist */
function renderWishlist() {
  wishlistItemsDiv.innerHTML = "";
  updateWishlistUI(); // Update wishlist count and button states
  
  if (Object.keys(localWishlist).length === 0) {
    wishlistItemsDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon wishlist">
          <i class="fas fa-heart"></i>
        </div>
        <h3>Your wishlist is empty</h3>
        <p>Save your favorite items here for later</p>
        <a href="#" id="browse-products" class="btn btn-primary">
          <i class="fas fa-store"></i> Browse Products
        </a>
      </div>
    `;
    return;
  }

  const keys = Object.keys(localWishlist);
  wishCount.textContent = keys.length;
  keys.forEach(id => {
    const p = productById(id);
    if (!p) return;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${p.images[1]}" onerror="this.style.opacity=.6" alt="${p.name}">
      <div class="wishlist-item-details">
        <div>
          <div class="wishlist-item-title">${p.name}</div>
          <div class="hindi" style="color:#6b7280;font-size:0.85rem">${p.hindiName}</div>
          <div class="wishlist-item-price" style="margin-top:8px">
            ₹ ${formatPrice(p.price)}
          </div>
        </div>
      </div>
      <div class="wishlist-item-actions">
        <button class="btn" data-id="${id}" data-action="rem" title="Remove from wishlist">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    wishlistItemsDiv.appendChild(div);
  });
}

/* wishlist button actions */
wishlistItemsDiv.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === "rem") {
    delete localWishlist[id];
    await syncWishlistToFirestore();
    renderWishlist();
  }
});

/* ---------------- Profile Management ---------------- */
async function saveUserProfile(profileData) {
  if (!currentUser) return false;
  
  try {
    const userRef = doc(db, 'users', currentUser.uid);
    
    // Only update the fields that are provided in profileData
    const updateData = {
      ...profileData,
      updatedAt: serverTimestamp()
    };
    
    // Update the document - we know it exists because we create it on auth state change
    await updateDoc(userRef, updateData);
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
}

async function loadUserProfile() {
  if (!currentUser) return null;
  
  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    
    // If document doesn't exist, return default profile
    // (The document will be created by the auth state change handler)
    return {
      displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
      email: currentUser.email || '',
      phone: '',
      address: '',
      photoURL: currentUser.photoURL || 'assets/icons/user-default.svg'
    };
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
}

function updateProfileUI(profileData) {
  if (!profileData) return;
  
  // Update dropdown
  const profileName = document.getElementById('profile-name');
  const userEmail = document.getElementById('user-email');
  const profileImage = document.querySelector('#profile-dropdown-content .profile-image');
  
  if (profileName) profileName.textContent = profileData.displayName || 'User';
  if (userEmail) userEmail.textContent = profileData.email || '';
  if (profileImage) profileImage.src = profileData.photoURL || 'assets/icons/user-default.svg';
  
  // Update profile page
  const profileUsername = document.getElementById('profile-username');
  const profileEmail = document.getElementById('profile-email');
  const fullNameInput = document.getElementById('full-name');
  const phoneInput = document.getElementById('phone');
  const addressInput = document.getElementById('address');
  const profileAvatar = document.getElementById('profile-avatar');
  
  if (profileUsername) profileUsername.textContent = `Welcome, ${profileData.displayName || 'User'}`;
  if (profileEmail) profileEmail.textContent = profileData.email || '';
  if (fullNameInput) fullNameInput.value = profileData.displayName || '';
  if (phoneInput) phoneInput.value = profileData.phone || '';
  if (addressInput) addressInput.value = profileData.address || '';
  if (profileAvatar) profileAvatar.src = profileData.photoURL || 'assets/icons/user-default.svg';
}

// Handle profile form submission
document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!currentUser) return;
  
  const formData = {
    displayName: document.getElementById('full-name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim()
  };
  
  const success = await saveUserProfile(formData);
  if (success) {
    showMessage('Profile updated successfully!', 'success');
    updateProfileUI(await loadUserProfile());
  } else {
    showMessage('Failed to update profile. Please try again.', 'error');
  }
});

/* ---------------- Listen to auth and Firestore changes ---------------- */
let unsubscribeCart = null;
let unsubscribeWish = null;

onAuthStateChanged(auth, async (user) => {
  console.log('Auth state changed:', user ? 'User signed in' : 'User signed out');
  currentUser = user;
  
  // Update UI based on auth state
  if (!user) {
    // User is signed out
    if (authButtons) authButtons.classList.remove('d-none');
    if (document.getElementById('user-profile')) {
      document.getElementById('user-profile').classList.add('d-none');
    }
    return;
  }

  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      let userProfile;
      
      if (userDoc.exists()) {
        // If user document exists, use it
        userProfile = userDoc.data();
        console.log('Existing user profile loaded:', userProfile);
      } else {
        // Only create a new profile if one doesn't exist
        userProfile = {
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: '',
          address: '',
          photoURL: user.photoURL || 'assets/icons/user-default.svg',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Create the user document
        await setDoc(userRef, userProfile);
        console.log('New user profile created:', userProfile);
      }
      
      // Update UI with profile data
      updateProfileUI(userProfile);

      // Show user profile and hide auth buttons
      if (authButtons) {
        authButtons.classList.add('d-none');
        const userProfileElement = document.getElementById('user-profile');
        if (userProfileElement) userProfileElement.classList.remove('d-none');
      }
    } catch (error) {
      console.error('Error handling auth state change:', error);
      showMessage('Error loading profile. Please refresh the page.', 'error');
      return;
    }

    if (unsubscribeCart) unsubscribeCart();
    if (unsubscribeWish) unsubscribeWish();

    const cartRef = doc(db, "users", user.uid, "meta", "cart");
    const wishRef = doc(db, "users", user.uid, "meta", "wishlist");

    unsubscribeCart = onSnapshot(cartRef, (snap) => {
      if (!snap.exists()) {
        // If cart doesn't exist on server, clear local cart
        if (Object.keys(localCart).length > 0) {
          localCart = {};
          renderCart();
        }
      } else {
        const data = snap.data();
        const serverUpdatedAt = data.updatedAt || 0;
        const clientUpdatedAt = data.clientUpdatedAt || 0;

        // Only update local cart if the server has newer data
        if (serverUpdatedAt > lastCartUpdate ||
          (clientUpdatedAt > 0 && clientUpdatedAt < lastCartUpdate)) {
          localCart = data.items || {};
          renderCart();
        }
      }
    }, (err) => console.error("cart snapshot err", err));

    unsubscribeWish = onSnapshot(wishRef, (snap) => {
      if (!snap.exists()) {
        // If wishlist doesn't exist on server, clear local wishlist if it has items
        if (Object.keys(localWishlist).length > 0) {
          localWishlist = {};
          renderWishlist();
        }
      } else {
        const data = snap.data();
        const serverUpdatedAt = data.updatedAt || 0;
        const clientUpdatedAt = data.clientUpdatedAt || 0;

        // Only update local wishlist if the server has newer data
        if (serverUpdatedAt > lastWishlistUpdate ||
          (clientUpdatedAt > 0 && clientUpdatedAt < lastWishlistUpdate)) {
          localWishlist = data.items || {};
          renderWishlist();
        }
      }
    }, (err) => console.error("wish snapshot err", err));
  } else {
    // User is signed out
    console.log('User signed out, resetting UI');

    if (profileName) profileName.textContent = 'User';
    if (profileEmail) profileEmail.textContent = 'user@example.com';
    if (profileImage) profileImage.src = 'assets/icons/user-default.svg';

    // Show auth buttons and hide user profile
    if (authButtons) {
      authButtons.classList.remove('d-none');
      userProfile.classList.add('d-none');
    }

    // Close profile dropdown
    if (profileDropdown) {
      console.log('Closing profile dropdown');
      profileDropdown.classList.remove('active');
    }

    // Clear local data
    localCart = {};
    localWishlist = {};
    renderCart();
    renderWishlist();

    // Unsubscribe from Firestore listeners
    if (unsubscribeCart) unsubscribeCart();
    if (unsubscribeWish) unsubscribeWish();
    unsubscribeCart = null;
    unsubscribeWish = null;
  }
});
renderProducts();

// Initialize checkout button
const checkoutBtn = document.getElementById("checkout-btn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", handleCheckout);
}

// Close checkout modal
document.querySelector('.close-checkout')?.addEventListener('click', () => {
  document.getElementById('checkoutOverlay').style.display = 'none';
  document.body.style.overflow = 'auto';
});

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
  const overlay = document.getElementById('checkoutOverlay');
  if (e.target === overlay) {
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});

// Save order to Firestore
async function saveOrder(userId, orderData) {
  try {
    const ordersRef = collection(db, "users", userId, "orders");
    const orderWithMetadata = {
      ...orderData,
      userId: userId, // Include the userId in the order data
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending',
      paymentStatus: 'pending',
      orderNumber: 'ORD-' + Date.now() // Generate a simple order number
    };
    
    const docRef = await addDoc(ordersRef, orderWithMetadata);
    return docRef.id;
  } catch (error) {
    console.error("Error saving order: ", error);
    throw error;
  }
}

// Handle checkout process
async function handleCheckout() {
  try {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
      showMessage('Please log in to proceed to checkout', 'error');
      window.location.hash = 'login';
      return;
    }

    // Get cart items
    if (Object.keys(localCart).length === 0) {
      showMessage('Your cart is empty', 'error');
      return;
    }

    // Calculate total
    const total = Object.values(localCart).reduce((sum, item) => sum + item.subtotal, 0);
    
    // Show checkout modal
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (checkoutOverlay && checkoutForm) {
      // Pre-fill user data if available
      const emailInput = document.getElementById('email');
      if (emailInput && !emailInput.value && user.email) {
        emailInput.value = user.email;
      }
      
      // Add hidden fields for cart items and total
      const cartItemsField = document.querySelector('input[name="cartItems"]') || document.createElement('input');
      cartItemsField.type = 'hidden';
      cartItemsField.name = 'cartItems';
      cartItemsField.value = JSON.stringify(Object.values(localCart));
      
      const totalField = document.querySelector('input[name="total"]') || document.createElement('input');
      totalField.type = 'hidden';
      totalField.name = 'total';
      totalField.value = total;
      
      checkoutForm.appendChild(cartItemsField);
      checkoutForm.appendChild(totalField);
      
      // Show the modal
      checkoutOverlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
      
      // Handle form submission
      checkoutForm.onsubmit = async (e) => {
        e.preventDefault();
        
        // Disable the submit button to prevent multiple submissions
        const submitButton = checkoutForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = 'Processing...';
        
        try {
          // Get form data
          const formData = new FormData(checkoutForm);
          const shippingInfo = {
            name: formData.get('Name')?.trim(),
            email: formData.get('Email')?.trim(),
            phone: formData.get('Phone')?.trim(),
            address: formData.get('Full Address')?.trim(),
            city: formData.get('City')?.trim(),
            state: formData.get('State')?.trim(),
            zip: formData.get('PIN Code')?.trim()
          };
          
          // Basic validation
          if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || 
              !shippingInfo.city || !shippingInfo.state || !shippingInfo.zip) {
            throw new Error('Please fill in all required shipping information.');
          }
          
          const orderData = {
            items: Object.values(localCart).map(item => ({
              id: item.id,
              name: item.name,
              variant: item.variant,
              quantity: item.count,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              image: item.image
            })),
            total: total,
            shipping: shippingInfo,
            paymentMethod: formData.get('paymentMethod') || 'Cash on Delivery',
            notes: formData.get('notes') || '',
            status: 'pending',
            paymentStatus: 'pending'
          };
          
          // Show loading state
          showMessage('Processing your order...', 'info');
          
          // Save order to Firestore
          const orderId = await saveOrder(user.uid, orderData);
          
          // Show success message with order details
          showMessage(`Order #${orderId} placed successfully!`, 'success');
          
          // Close the checkout modal
          document.getElementById('checkoutOverlay').style.display = 'none';
          document.body.style.overflow = 'auto';
          
          // Redirect to orders page
          window.location.hash = 'orders';
          
          // Refresh orders display
          await showOrders();
          
          // Hide the modal after a short delay
          setTimeout(() => {
            checkoutOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
          }, 1500);
          
          try {
            // Try to submit the form (for email notification)
            checkoutForm.submit();
          } catch (emailError) {
            console.warn('Could not submit email form:', emailError);
            // This is not critical, so we don't show an error to the user
          }
          
          // Reset the form
          checkoutForm.reset();
          
        } catch (error) {
          console.error('Error processing order:', error);
          showMessage(error.message || 'Failed to place order. Please try again.', 'error');
        } finally {
          // Re-enable the submit button
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
        }
      };
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showMessage('An error occurred during checkout. Please try again.', 'error');
  }
}
