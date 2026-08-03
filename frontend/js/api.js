const API_BASE_URL = 'https://ai-resume-builder-4r6c.onrender.com/api';

async function callAI(text, context) {
    showOverlay("Enhancing text...");
    try {
        const response = await fetch(`${API_BASE_URL}/enhance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, context })
        });
        
        console.log(`[API RESP] /enhance - Status: ${response.status}`);
        console.log(`[API RESP] /enhance - Headers:`, [...response.headers]);
        console.log(`[API RESP] /enhance - Content-Type: ${response.headers.get('content-type')}`);
        
        if (!response.ok) {
            const errText = await response.text();
            console.error(`[API ERROR BODY]:`, errText);
            throw new Error(`Backend Error: ${errText}`);
        }
        
        const data = await response.json();
        hideOverlay();
        if(data.error) throw new Error(data.error);
        return data.enhanced;
    } catch (e) {
        hideOverlay();
        alert('AI service unavailable. Please try again.');
        return text;
    }
}

async function checkATS(resumeData, jobDescription) {
    showOverlay("Calculating ATS compatibility...");
    try {
        const response = await fetch(`${API_BASE_URL}/ats-score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_data: resumeData, job_description: jobDescription })
        });
        
        console.log(`[API RESP] /ats-score - Status: ${response.status}`);
        console.log(`[API RESP] /ats-score - Headers:`, [...response.headers]);
        console.log(`[API RESP] /ats-score - Content-Type: ${response.headers.get('content-type')}`);
        
        if (!response.ok) {
            const errText = await response.text();
            console.error(`[API ERROR BODY]:`, errText);
            throw new Error(`Backend Error: ${errText}`);
        }
        
        const data = await response.json();
        console.log("ATS Response:", data);
        hideOverlay();
        if(data.error) {
            alert(data.error);
            return null;
        }
        return data;
    } catch (e) {
        hideOverlay();
        alert('AI service unavailable. Please try again.');
        return null;
    }
}

async function optimizeFullResume(resumeData, targetRole) {
    showOverlay("AI is analyzing your resume...");
    
    // Simulate multi-step text for the user
    let msgInterval = setInterval(() => {
        const msgs = ["Optimizing keywords...", "Rewriting descriptions...", "Applying FAANG standards..."];
        const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
        updateOverlayMsg(randomMsg);
    }, 2500);

    try {
        const response = await fetch(`${API_BASE_URL}/optimize-resume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_data: resumeData, target_role: targetRole })
        });
        
        console.log(`[API RESP] /optimize-resume - Status: ${response.status}`);
        console.log(`[API RESP] /optimize-resume - Headers:`, [...response.headers]);
        console.log(`[API RESP] /optimize-resume - Content-Type: ${response.headers.get('content-type')}`);
        
        if (!response.ok) {
            const errText = await response.text();
            console.error(`[API ERROR BODY]:`, errText);
            throw new Error(`Backend Error: ${errText}`);
        }
        
        const data = await response.json();
        clearInterval(msgInterval);
        hideOverlay();
        if(data.error) throw new Error(data.error);
        return data;
    } catch (e) {
        clearInterval(msgInterval);
        hideOverlay();
        alert('AI service unavailable. Please try again.');
        return null;
    }
}

async function exportPDF(htmlContent) {
    showOverlay("Generating PDF...");
    try {
        const response = await fetch(`${API_BASE_URL}/export/pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html_content: htmlContent })
        });
        
        console.log(`[API RESP] /export/pdf - Status: ${response.status}`);
        console.log(`[API RESP] /export/pdf - Headers:`, [...response.headers]);
        console.log(`[API RESP] /export/pdf - Content-Type: ${response.headers.get('content-type')}`);
        
        if (!response.ok) {
            const errText = await response.text();
            console.error(`[API ERROR BODY]:`, errText);
            throw new Error(`PDF generation failed: ${errText}`);
        }
        
        // Download the blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        let name = (typeof resumeData !== 'undefined' && resumeData.fullName) ? resumeData.fullName.trim() : 'Professional';
        if (!name) name = 'Professional';
        let cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `${cleanName}_Resume.pdf`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (e) {
        alert('PDF Export failed: ' + e.message);
    } finally {
        hideOverlay();
    }
}

async function exportDOCX(resumeData) {
    showOverlay("Generating DOCX...");
    try {
        const response = await fetch(`${API_BASE_URL}/export/docx`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_data: resumeData })
        });
        
        console.log(`[API RESP] /export/docx - Status: ${response.status}`);
        console.log(`[API RESP] /export/docx - Headers:`, [...response.headers]);
        console.log(`[API RESP] /export/docx - Content-Type: ${response.headers.get('content-type')}`);
        
        if (!response.ok) {
            const errText = await response.text();
            console.error(`[API ERROR BODY]:`, errText);
            throw new Error(`DOCX generation failed: ${errText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        let name = (typeof resumeData !== 'undefined' && resumeData.fullName) ? resumeData.fullName.trim() : 'Professional';
        if (!name) name = 'Professional';
        let cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `${cleanName}_Resume.docx`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (e) {
        alert('DOCX Export failed: ' + e.message);
    } finally {
        hideOverlay();
    }
}

// UI Helpers
function showOverlay(msg = "AI is thinking...") {
    document.getElementById('aiOverlay').style.display = 'flex';
    updateOverlayMsg(msg);
}

function updateOverlayMsg(msg) {
    const p = document.querySelector('#aiOverlay p');
    if (p) p.innerText = msg;
}

function hideOverlay() {
    document.getElementById('aiOverlay').style.display = 'none';
}

async function callAITargeted(endpoint, text) {
    showOverlay("AI is optimizing...");
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!response.ok) throw new Error("Backend Error");
        const data = await response.json();
        hideOverlay();
        if(data.error) throw new Error(data.error);
        return data.optimized || data.original;
    } catch (e) {
        hideOverlay();
        alert('AI service unavailable. Please try again.');
        return text;
    }
}

async function optimizeStar(text) { return callAITargeted('optimize-star', text); }
async function enhanceVerbs(text) { return callAITargeted('enhance-verbs', text); }
async function checkGrammar(text) { return callAITargeted('check-grammar', text); }
