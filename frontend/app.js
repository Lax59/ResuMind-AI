/**
 * ResuMind AI - Client Application Logic
 */

// Configuration
const API_BASE_URL = 'https://ai-resume-analyser-yk2g.onrender.com';

// Global State
let selectedFile = null;
let currentSlide = 1;
const totalSlides = 3;

// DOM Elements - General
const analyzeForm = document.getElementById('analyze-form');
const fileInput = document.getElementById('resume-file');
const dropZone = document.getElementById('drop-zone');
const fileDetails = document.getElementById('file-details');
const fileNameSpan = document.getElementById('file-name');
const fileSizeSpan = document.getElementById('file-size');
const btnRemoveFile = document.getElementById('btn-remove-file');
const btnSubmit = document.getElementById('btn-submit');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');

// DOM Elements - Results Section
const resultsPlaceholder = document.getElementById('results-placeholder');
const resultsContent = document.getElementById('results-content');
const matchScoreSpan = document.getElementById('match-score');
const scoreProgress = document.getElementById('score-progress');
const matchExplanation = document.getElementById('match-explanation');
const candidateSummary = document.getElementById('candidate-summary');
const listStrengths = document.getElementById('list-strengths');
const listWeaknesses = document.getElementById('list-weaknesses');
const listRecommendations = document.getElementById('list-recommendations');
const keywordsContainer = document.getElementById('keywords-container');
const skillsGrid = document.getElementById('skills-grid');
const btnPrint = document.getElementById('btn-print');
const resultsLoading = document.getElementById('results-loading');
const loaderStatusTitle = document.getElementById('loader-status-title');
const loaderStatusDesc = document.getElementById('loader-status-desc');
const loaderProgress = document.getElementById('loader-progress');

// DOM Elements - Presentation Mode
const btnPresentation = document.getElementById('btn-presentation');
const presentationDrawer = document.getElementById('presentation-drawer');
const btnCloseDrawer = document.getElementById('btn-close-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const btnCheckBackend = document.getElementById('btn-check-backend');
const backendStatusDot = document.getElementById('backend-status-dot');
const backendStatusText = document.getElementById('backend-status-text');

// DOM Elements - Carousel
const carouselSlides = document.querySelectorAll('.carousel-slide');
const carouselIndicators = document.querySelectorAll('.carousel-indicators .indicator');
const carouselPrev = document.getElementById('carousel-prev');
const carouselNext = document.getElementById('carousel-next');

// DOM Elements - Toast
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toast-icon');
const toastMessage = document.getElementById('toast-message');

/* ==========================================================================
   1. Toast Notifications Utility
   ========================================================================== */
function showToast(message, type = 'success') {
    // Reset classes
    toast.className = 'toast show';
    toast.classList.add(type);
    
    // Set icon
    if (type === 'success') {
        toastIcon.className = 'fa-solid fa-circle-check';
    } else if (type === 'error') {
        toastIcon.className = 'fa-solid fa-circle-exclamation';
    } else {
        toastIcon.className = 'fa-solid fa-circle-info';
    }
    
    toastMessage.textContent = message;
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

/* ==========================================================================
   2. File Drag & Drop Handlers
   ========================================================================== */
// Highlight drop zone on drag over
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    }, false);
});

// Remove highlight on drag leave
['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    }, false);
});

// Handle file drop
dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        handleFileSelection(files[0]);
    }
});

// Handle standard file selection dialog
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
    }
});

// Process and validate selected file
function handleFileSelection(file) {
    const validExtensions = ['pdf', 'txt', 'png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
        showToast('Unsupported format! Please upload PDF, TXT, or PNG/JPG images.', 'error');
        return;
    }
    
    selectedFile = file;
    
    // Update preview icon based on file type
    const iconEl = fileDetails.querySelector('i');
    if (['png', 'jpg', 'jpeg'].includes(fileExtension)) {
        iconEl.className = 'fa-solid fa-file-image';
    } else if (fileExtension === 'txt') {
        iconEl.className = 'fa-solid fa-file-lines';
    } else {
        iconEl.className = 'fa-solid fa-file-pdf';
    }
    
    // Display file details inside drop-zone
    fileNameSpan.textContent = file.name;
    fileSizeSpan.textContent = `(${formatBytes(file.size)})`;
    fileDetails.classList.remove('hidden');
    
    // Update drop-zone text content styling (fade out labels)
    dropZone.querySelector('.upload-icon').style.display = 'none';
    dropZone.querySelector('.primary-text').style.display = 'none';
    dropZone.querySelector('.secondary-text').style.display = 'none';
    
    showToast('File loaded successfully!', 'success');
}

// Remove selected file and restore drop-zone defaults
btnRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid triggering file chooser dialog
    resetFileSelection();
});

function resetFileSelection() {
    selectedFile = null;
    fileInput.value = '';
    fileDetails.classList.add('hidden');
    
    // Restore default labels
    dropZone.querySelector('.upload-icon').style.display = 'block';
    dropZone.querySelector('.primary-text').style.display = 'block';
    dropZone.querySelector('.secondary-text').style.display = 'block';
}

// Convert bytes to readable formats
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/* ==========================================================================
   3. Backend Health Diagnostics
   ========================================================================== */
async function checkBackendHealth(silent = false) {
    if (!silent) {
        backendStatusText.textContent = 'Pinging server...';
        backendStatusDot.className = 'dot dot-unknown';
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (!response.ok) throw new Error('API server returned error status.');
        
        const data = await response.json();
        
        if (data.status === 'healthy') {
            backendStatusDot.className = 'dot dot-online';
            if (data.gemini_api_key_configured) {
                backendStatusText.textContent = 'Online & Connected';
                if (!silent) showToast('Backend is online and connected to Gemini!', 'success');
            } else {
                backendStatusText.textContent = 'Online (Key Missing)';
                if (!silent) showToast('Backend is online, but GEMINI_API_KEY is not configured!', 'error');
            }
        }
    } catch (error) {
        console.error('Backend health ping failed:', error);
        backendStatusDot.className = 'dot dot-offline';
        backendStatusText.textContent = 'Offline / Inactive';
        if (!silent) {
            showToast('Cannot reach the backend server. Make sure it is running on port 8000!', 'error');
        }
    }
}

// Automatically ping the backend on page load
window.addEventListener('DOMContentLoaded', () => {
    checkBackendHealth(true);
});

btnCheckBackend.addEventListener('click', () => {
    checkBackendHealth(false);
});

/* ==========================================================================
   4. Form Submit & API Connection
   ========================================================================== */
analyzeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
        showToast('Please select a resume file first!', 'error');
        return;
    }
    
    // Update Button to loading state
    btnSubmit.disabled = true;
    btnText.textContent = 'Analyzing...';
    btnSpinner.classList.remove('hidden');
    
    // Prepare Loader state
    resultsPlaceholder.classList.add('hidden');
    resultsContent.classList.add('hidden');
    resultsLoading.classList.remove('hidden');
    
    loaderProgress.style.width = '0%';
    loaderStatusTitle.textContent = 'Initiating Scanner';
    loaderStatusDesc.textContent = 'Reading document structure and bytes...';
    
    // Animate scanning progress bar dynamically
    let progressVal = 0;
    const statusTexts = [
        { pct: 15, title: "Reading Document Bytes", desc: "Loading layout structure..." },
        { pct: 30, title: "Extracting Content Layout", desc: "Identifying text blocks, headings, and styling..." },
        { pct: 48, title: "Identifying Experience Details", desc: "Analyzing timeline descriptions and key roles..." },
        { pct: 65, title: "Evaluating Skill Sets", desc: "Cross-checking resume terms against target credentials..." },
        { pct: 80, title: "Running ATS Match Algorithms", desc: "Computing compatibility indexes and search keywords..." },
        { pct: 93, title: "Structuring Recommendations", desc: "Generating constructive improvement notes..." }
    ];
    
    const progressInterval = setInterval(() => {
        if (progressVal < 93) {
            progressVal += Math.floor(Math.random() * 4) + 1; // Increment by 1-4%
            if (progressVal > 93) progressVal = 93;
            
            loaderProgress.style.width = `${progressVal}%`;
            
            // Check status texts
            const textMatch = statusTexts.find(item => progressVal <= item.pct);
            if (textMatch) {
                loaderStatusTitle.textContent = textMatch.title;
                loaderStatusDesc.textContent = textMatch.desc;
            }
        }
    }, 180);
    
    // Prepare multi-part form data
    const formData = new FormData();
    formData.append('resume', selectedFile);
    
    const jobDescription = document.getElementById('job-desc').value.trim();
    if (jobDescription) {
        formData.append('job_description', jobDescription);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Analysis request failed.');
        }
        
        const result = await response.json();
        
        // Finish progress bar
        clearInterval(progressInterval);
        loaderProgress.style.width = '100%';
        loaderStatusTitle.textContent = 'Analysis Complete!';
        loaderStatusDesc.textContent = 'Formatting visual metrics...';
        
        // Wait briefly for progress animation to complete
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Transition results panel
        resultsLoading.classList.add('hidden');
        resultsContent.classList.remove('hidden');
        
        renderAnalysisReport(result);
        showToast('Resume analyzed successfully!', 'success');
        
    } catch (error) {
        console.error(error);
        clearInterval(progressInterval);
        resultsLoading.classList.add('hidden');
        resultsPlaceholder.classList.remove('hidden');
        showToast(error.message || 'An error occurred during analysis.', 'error');
    } finally {
        // Reset Button state
        btnSubmit.disabled = false;
        btnText.innerHTML = '<i class="fa-solid fa-bolt"></i> Analyze Resume';
        btnSpinner.classList.add('hidden');
    }
});

/* ==========================================================================
   5. Render Report to UI
   ========================================================================== */
function renderAnalysisReport(data) {
    // 1. Reveal results panel and hide placeholder (fallback validation)
    resultsPlaceholder.classList.add('hidden');
    resultsContent.classList.remove('hidden');
    
    // 2. Animate and update circular score gauge
    animateScoreRing(data.score);
    
    // 3. Fill text content
    matchExplanation.textContent = data.match_explanation;
    candidateSummary.textContent = data.summary;
    
    // 4. Fill Strengths list
    listStrengths.innerHTML = '';
    data.strengths.forEach(strength => {
        const li = document.createElement('li');
        li.textContent = strength;
        listStrengths.appendChild(li);
    });
    
    // 5. Fill Weaknesses list
    listWeaknesses.innerHTML = '';
    data.weaknesses.forEach(weak => {
        const li = document.createElement('li');
        li.textContent = weak;
        listWeaknesses.appendChild(li);
    });
    
    // 6. Fill Skill Gap Analysis grid
    skillsGrid.innerHTML = '';
    data.skill_gap.forEach(item => {
        const card = document.createElement('div');
        card.className = 'skill-card';
        
        const badgeClass = `badge-${item.status.toLowerCase()}`;
        
        card.innerHTML = `
            <div class="skill-info">
                <span class="skill-name">${item.skill}</span>
                <span class="skill-detail">${item.detail}</span>
            </div>
            <span class="badge ${badgeClass}">${item.status}</span>
        `;
        skillsGrid.appendChild(card);
    });
    
    // 7. Fill Actionable Recommendations
    listRecommendations.innerHTML = '';
    data.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        listRecommendations.appendChild(li);
    });
    
    // 8. Fill Keyword Chips
    keywordsContainer.innerHTML = '';
    data.keywords.forEach(keyword => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.innerHTML = `<i class="fa-regular fa-clipboard"></i> ${keyword}`;
        
        // Click to copy keyword functionality
        chip.addEventListener('click', () => {
            navigator.clipboard.writeText(keyword);
            showToast(`Copied "${keyword}" to clipboard!`, 'info');
        });
        
        keywordsContainer.appendChild(chip);
    });

    // Scroll to results section on mobile
    resultsContent.scrollIntoView({ behavior: 'smooth' });
}

// Handles radial progress circle SVG dashboard animation
function animateScoreRing(targetScore) {
    const radius = scoreProgress.r.baseVal.value;
    const circumference = 2 * Math.PI * radius; // Approx 314
    
    scoreProgress.style.strokeDasharray = `${circumference} ${circumference}`;
    scoreProgress.style.strokeDashoffset = circumference;
    
    // Smooth number count up
    let currentVal = 0;
    const duration = 1500; // 1.5s animation
    const steps = 60;
    const increment = targetScore / steps;
    const intervalTime = duration / steps;
    
    const interval = setInterval(() => {
        currentVal += increment;
        if (currentVal >= targetScore) {
            currentVal = targetScore;
            clearInterval(interval);
        }
        matchScoreSpan.textContent = Math.round(currentVal);
        
        // Update SVG circle stroke dashoffset
        const offset = circumference - (currentVal / 100) * circumference;
        scoreProgress.style.strokeDashoffset = offset;
    }, intervalTime);
}

// Print and Export Handler
btnPrint.addEventListener('click', () => {
    window.print();
});

/* ==========================================================================
   6. Presentation Mode Drawer Controls
   ========================================================================== */
function openPresentationDrawer() {
    presentationDrawer.classList.add('open');
    drawerOverlay.classList.add('visible');
    // Re-check backend status silently when opening drawer
    checkBackendHealth(true);
}

function closePresentationDrawer() {
    presentationDrawer.classList.remove('open');
    drawerOverlay.classList.remove('visible');
}

btnPresentation.addEventListener('click', openPresentationDrawer);
btnCloseDrawer.addEventListener('click', closePresentationDrawer);
drawerOverlay.addEventListener('click', closePresentationDrawer);

/* ==========================================================================
   7. Slide-show Carousel Interaction
   ========================================================================== */
function updateCarousel() {
    carouselSlides.forEach(slide => {
        const slideIndex = parseInt(slide.getAttribute('data-slide'));
        slide.classList.remove('active');
        if (slideIndex === currentSlide) {
            slide.classList.add('active');
        }
    });

    carouselIndicators.forEach(indicator => {
        const indIndex = parseInt(indicator.getAttribute('data-slide'));
        indicator.classList.remove('active');
        if (indIndex === currentSlide) {
            indicator.classList.add('active');
        }
    });

    // Control buttons state
    carouselPrev.disabled = currentSlide === 1;
    carouselNext.disabled = currentSlide === totalSlides;
}

carouselNext.addEventListener('click', () => {
    if (currentSlide < totalSlides) {
        currentSlide++;
        updateCarousel();
    }
});

carouselPrev.addEventListener('click', () => {
    if (currentSlide > 1) {
        currentSlide--;
        updateCarousel();
    }
});

// Clickable indicators
carouselIndicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
        currentSlide = parseInt(indicator.getAttribute('data-slide'));
        updateCarousel();
    });
});

/* ==========================================================================
   8. Accent Theme Switcher & Day/Night Toggle
   ========================================================================== */
const themeDots = document.querySelectorAll('.theme-dot');
themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
        // Remove active class from all dots
        themeDots.forEach(d => d.classList.remove('active'));
        // Add active class to clicked dot
        dot.classList.add('active');
        
        // Remove old theme classes from body
        document.body.classList.remove(
            'theme-violet', 'theme-amber', 'theme-emerald', 
            'theme-blue', 'theme-lime', 'theme-sakura', 'theme-platinum'
        );
        
        // Add new theme class
        const theme = dot.getAttribute('data-theme');
        if (theme !== 'violet') {
            document.body.classList.add(`theme-${theme}`);
        }
        
        localStorage.setItem('selected-theme', theme);
    });
});

// Day/Night Theme Mode toggle
const btnModeToggle = document.getElementById('btn-mode-toggle');
btnModeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    
    if (isLight) {
        btnModeToggle.textContent = '☀️';
        localStorage.setItem('mode-theme', 'light');
    } else {
        btnModeToggle.textContent = '🌙';
        localStorage.setItem('mode-theme', 'dark');
    }
});

// Load saved preferences on startup
window.addEventListener('DOMContentLoaded', () => {
    // 1. Restore Accent color
    const savedTheme = localStorage.getItem('selected-theme');
    if (savedTheme) {
        const dot = document.querySelector(`.theme-dot[data-theme="${savedTheme}"]`);
        if (dot) dot.click();
    }
    
    // 2. Restore Day/Night mode
    const savedMode = localStorage.getItem('mode-theme');
    if (savedMode === 'light') {
        document.body.classList.add('light-theme');
        btnModeToggle.textContent = '☀️';
    } else {
        document.body.classList.remove('light-theme');
        btnModeToggle.textContent = '🌙';
    }
});
