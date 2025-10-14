// Import the necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// 2. Initialize the Express application
const app = express();
const PORT = 3000; 

// Middleware Setup
// Increased limit for body-parser to handle Base64 image data
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' })); 
app.use(bodyParser.json({ limit: '5mb' }));

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(path.join(__dirname))); 

// --- DATABASE OF SUGGESTIONS (FOR RANDOMIZATION) ---
const SUGGESTION_DATABASE = [
    // Group 1: Action Verbs & Quantification (Must-Haves)
    "1. **Suggestion:** To maximize ATS score, ensure all job descriptions start with strong **action verbs** (e.g., *Implemented*, *Executed*).",
    "2. **Suggestion:** **Quantify** all achievements (e.g., instead of 'improved process,' use 'improved process efficiency by 25%').",
    "3. **Recommendation:** Ensure all date ranges (Start/End) are consistent (e.g., Month YYYY format).",
    
    // Group 2: Missing Sections & Formatting (Good-to-Haves)
    "1. **Missing Section:** Consider adding a dedicated 'Awards & Certifications' section to showcase non-academic achievements.",
    "2. **Formatting Tip:** Keep the resume font consistent and avoid excessive bolding or italics for clarity.",
    "3. **Readability:** Break long paragraphs into clear, concise bullet points for quick scanning by recruiters.",
];

// Function to select 3 unique, random suggestions
function getRandomSuggestions() {
    const suggestions = [];
    const pool = [...SUGGESTION_DATABASE]; // Copy the database

    // Select 3 random suggestions from the pool
    while (suggestions.length < 3 && pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        suggestions.push(pool.splice(randomIndex, 1)[0]);
    }
    
    // Use <br><br> to force a double line break for clean visual separation
    return suggestions.join('<br><br>');
}

// 3. The Core Function: SIMULATE AI RESPONSE
function generateMockResume(formData) {
    
    // --- CONDITIONAL CHECK FOR WORK EXPERIENCE ---
    const hasWorkExperience = formData.experience.some(
        (exp) => exp.title || exp.company || exp.start || exp.end || exp.responsibilities
    );
    
    // Default values if inputs are blank
    const name = formData.name || 'Candidate Name';
    const email = formData.email || 'Email Missing';
    const phone = formData.phone || 'Phone Missing';
    const firstEducationDegree = formData.education[0]?.degree || 'High School / Pre-University';
    
    // --- BUILD IMAGE CONTAINER (Conditional) ---
    let imageElement = '';
    if (formData.profileImage) {
        // Use the Base64 string directly as the image source (data URL)
        imageElement = `<img src="${formData.profileImage}" alt="Profile Picture" class="profile-pic">`;
    }
    
    // --- BUILD EXPERIENCE SECTION (Conditional) ---
    let experienceSection = '';

    if (hasWorkExperience) {
        let experienceContent = '';
        formData.experience.forEach(exp => {
            if (exp.title || exp.company) {
                experienceContent += `
**Title:** ${exp.title || 'N/A'} at ${exp.company || 'N/A'}
**Dates:** ${exp.start || 'N/A'} - ${exp.end || 'N/A'}
* ${exp.responsibilities || 'Key responsibilities not specified.'}
`;
            }
        });

        if (experienceContent.trim()) {
            experienceSection = `
## **Experience & Projects**
${experienceContent.trim()}
`;
        }
    }
    
    // --- MOCK AI GENERATED CONTENT (Final Assembly) ---
    const mockResume = `
<div class="resume-header">
    <div class="header-content">
        <h1 class="resume-name">${name}</h1>
        <div class="contact-info">
            <span>${email}</span> | <span>${phone}</span>
        </div>
    </div>
    ${imageElement} 
</div>
<hr class="header-line">

## **Professional Summary**
${formData.summary || 'A highly adaptable and results-driven student, successfully developing a functional, full-stack application under hackathon constraints. Proficient in HTML, CSS, JavaScript, and Node.js for rapid prototyping.'}

## **Technical Skills**
${formData.skills || 'HTML, CSS, JavaScript (Node.js/Express), UI/UX Design, Problem-Solving, Team Collaboration'}
${experienceSection} 
## **Education**
**Degree:** ${firstEducationDegree}
**Institution:** ${formData.education[0]?.institution || 'Bal Bharati Public School'}
**Dates:** ${formData.education[0]?.start || 'N/A'} - ${formData.education[0]?.end || 'Present'}
`;
    
    // --- MOCK AI SUGGESTIONS (Randomized) ---
    const mockSuggestions = getRandomSuggestions();

    return {
        resumeText: mockResume.trim(), 
        suggestions: mockSuggestions
    };
}


// 4. Define the Route to Handle Form Submission (The POST request)
app.post('/generate-resume', async (req, res) => {
    const formData = req.body;
    
    // Simulate a brief AI processing time for realism
    setTimeout(() => {
        const aiResult = generateMockResume(formData);
        
        // Send the mock results back to the client
        res.json({
            success: true,
            resumeText: aiResult.resumeText,
            suggestions: aiResult.suggestions
        });
    }, 1500); // 1.5 second delay
});


// 5. Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Open your browser and navigate to http://localhost:${PORT}/index.html`);
});