document.addEventListener("DOMContentLoaded", () => {
  setupNavbar();
  initializeAnimations();
  setupGlobalEventListeners();
});

// Highlight active navbar link
function setupNavbar() {
  let currentPage = window.location.pathname.split("/").pop() || "index.html";
  let navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Initialize scroll animations
function initializeAnimations() {
  // Add intersection observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";
      }
    });
  }, observerOptions);

  // Observe all animated elements
  document.querySelectorAll(".animate__animated").forEach((el) => {
    if (!el.style.animationPlayState) {
      el.style.animationPlayState = "paused";
      observer.observe(el);
    }
  });
}

// Setup global event listeners
function setupGlobalEventListeners() {
  // Handle navbar toggler for mobile
  const navbarToggler = document.querySelector(".navbar-toggler");
  if (navbarToggler) {
    navbarToggler.addEventListener("click", function () {
      const navbarCollapse = document.querySelector(".navbar-collapse");
      if (navbarCollapse) {
        navbarCollapse.classList.toggle("show");
      }
    });
  }

  // Close mobile menu when clicking on a nav link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      const navbarCollapse = document.querySelector(".navbar-collapse");
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        navbarCollapse.classList.remove("show");
      }
    });
  });

  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Add loading states to buttons
  document.addEventListener("submit", function (e) {
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) {
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
      submitButton.disabled = true;

      // Reset button after 3 seconds as fallback
      setTimeout(() => {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      }, 3000);
    }
  });
}

// Generic API function for GET requests
function fetchData(url, callback, errorCallback = null) {
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => callback(data))
    .catch((error) => {
      console.error("Error fetching data:", error);
      if (errorCallback) {
        errorCallback(error);
      } else {
        showAlert("Error", "Failed to fetch data. Please try again.", "error");
      }
    });
}

// Enhanced SweetAlert notification function
function showAlert(title, message, type = "info", options = {}) {
  const defaultOptions = {
    title: title,
    text: message,
    icon: type,
    confirmButtonColor: getButtonColor(type),
    timer: type === "success" ? 3000 : undefined,
    timerProgressBar: type === "success",
    showConfirmButton: type !== "success",
    ...options,
  };

  return Swal.fire(defaultOptions);
}

// Get appropriate button color based on alert type
function getButtonColor(type) {
  const colors = {
    success: "#48bb78",
    error: "#f56565",
    warning: "#ed8936",
    info: "#4299e1",
    question: "#667eea",
  };
  return colors[type] || "#667eea";
}

// Enhanced toast notification
function showToast(message, type = "info", position = "top-end") {
  return Swal.fire({
    toast: true,
    position: position,
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
}

// Loading overlay functions
function showLoading(message = "Loading...") {
  return Swal.fire({
    title: message,
    html: '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>',
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}

function hideLoading() {
  Swal.close();
}

// Utility functions for form handling
function resetForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
    // Remove any validation classes
    form.querySelectorAll(".is-invalid, .is-valid").forEach((input) => {
      input.classList.remove("is-invalid", "is-valid");
    });
  }
}

function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  let isValid = true;
  const inputs = form.querySelectorAll(
    "input[required], select[required], textarea[required]"
  );

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add("is-invalid");
      isValid = false;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
    }
  });

  return isValid;
}

// Utility function for formatting numbers
function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

// Utility function for capitalizing text
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Error handling for API calls
function handleApiError(error, customMessage = null) {
  console.error("API Error:", error);
  const message = customMessage || "An error occurred. Please try again.";
  showAlert("Error", message, "error");
}

// Function to check if user is online
function checkConnection() {
  if (!navigator.onLine) {
    showAlert(
      "Connection Error",
      "Please check your internet connection.",
      "warning"
    );
    return false;
  }
  return true;
}

// Listen for online/offline events
window.addEventListener("online", () => {
  showToast("Connection restored!", "success");
});

window.addEventListener("offline", () => {
  showToast("You're offline. Some features may not work.", "warning");
});
