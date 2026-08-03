// Global State
let resumeData = {
    targetJob: '',
    jobDescription: '',
    includePhoto: false,
    photoDataUrl: null,
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    summary: '',
    skills: [], // Will be stored as { category: '', items: [] } or just categorized on export/preview
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
    internships: [],
    languages: [],
    coursework: [],
    responsibilities: [],
    awards: [],
    codingProfiles: []
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    try {
        // New Resume Handler
        (document.getElementById('newResumeBtn') || document.createElement('div')).addEventListener('click', () => {
            if (confirm('Are you sure you want to start a new resume? This will clear all your current data.')) {
                localStorage.removeItem('resumeState');
                window.location.reload();
            }
        });

        // Load state from local storage if exists
        const saved = localStorage.getItem('resumeState');
        if (saved) {
            try {
                resumeData = JSON.parse(saved);
                populateUIFromState();
            } catch (e) { console.error('Failed to parse resumeState', e); }
        }

        // ==========================================
        // UNIFIED LIVE SYNC ENGINE
        // ==========================================
        const syncEvents = ['input', 'change', 'keyup', 'blur'];
        syncEvents.forEach(evt => {
            // Use bubbling phase (false) so inline handlers execute BEFORE this global sync
            document.addEventListener(evt, (e) => {
                if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                    collectResumeData();
                    updateResume();
                    renderPreview();
                }
            }, false);
        });

        window.collectResumeData = function () {
            const topLevels = ['fullName', 'targetJob', 'jobDescription', 'email', 'phone', 'location', 'linkedin', 'portfolio', 'summary'];
            topLevels.forEach(id => {
                const el = document.getElementById(id);
                if (el && el.value !== undefined) {
                    resumeData[id] = el.value;
                }
            });
        };

        window.updateResume = function () {
            saveState();
        };

        window.renderPreview = function () {
            console.log("Rendering Preview");
            console.log("Internships", resumeData.internships || []);
            console.log("Projects", resumeData.projects || []);
            console.log("Education", resumeData.education || []);
            console.log(resumeData);

            if (typeof window.updatePreview === 'function') {
                window.updatePreview();
            }
        };
        // ==========================================

        if (saved) {
            // Skip setup screen safely
            const stepSetup = document.getElementById('step-setup');
            if (stepSetup) stepSetup.style.display = 'none';

            const stepBuilder = document.getElementById('step-builder');
            if (stepBuilder) stepBuilder.style.display = 'flex';

            const exportPdfBtn = document.getElementById('exportPdfBtn');
            if (exportPdfBtn) exportPdfBtn.style.display = 'inline-flex';

            const exportDocxBtn = document.getElementById('exportDocxBtn');
            if (exportDocxBtn) exportDocxBtn.style.display = 'inline-flex';

            if (resumeData.includePhoto) {
                const photoUploadGroup = document.getElementById('photoUploadGroup');
                if (photoUploadGroup) photoUploadGroup.style.display = 'block';

                const btnPhotoYes = document.getElementById('btn-photo-yes');
                if (btnPhotoYes) btnPhotoYes.classList.add('active');

                const btnPhotoNo = document.getElementById('btn-photo-no');
                if (btnPhotoNo) btnPhotoNo.classList.remove('active');
            }

            // Render dynamic lists (needs small delay to ensure builder.js functions are loaded)
            setTimeout(() => {
                if (window.renderSkills) window.renderSkills();
                if (window.renderExperience) window.renderExperience();
                if (window.renderInternships) window.renderInternships();
                if (window.renderEducation) window.renderEducation();
                if (window.renderProjects) window.renderProjects();
                if (window.renderProfiles) window.renderProfiles();
                if (window.renderCertifications) window.renderCertifications();
                if (window.renderAchievements) window.renderAchievements();
                if (window.renderLanguages) window.renderLanguages();
                if (window.renderCoursework) window.renderCoursework();
                if (window.renderResponsibilities) window.renderResponsibilities();
                if (window.renderInterests) window.renderInterests();
                if (window.renderPreview) window.renderPreview();
            }, 100);
        } // End of if (saved)


        // Step 1: Setup Handlers
        const btnPhotoYes = document.getElementById('btn-photo-yes');
        if (btnPhotoYes) {
            btnPhotoYes.addEventListener('click', (e) => {
                btnPhotoYes.classList.add('active');
                const btnPhotoNo = document.getElementById('btn-photo-no');
                if (btnPhotoNo) btnPhotoNo.classList.remove('active');
                resumeData.includePhoto = true;
            });
        }

        const btnPhotoNo = document.getElementById('btn-photo-no');
        if (btnPhotoNo) {
            btnPhotoNo.addEventListener('click', (e) => {
                btnPhotoNo.classList.add('active');
                const btnPhotoYes = document.getElementById('btn-photo-yes');
                if (btnPhotoYes) btnPhotoYes.classList.remove('active');
                resumeData.includePhoto = false;
            });
        }

        const startBuilderBtn = document.getElementById('startBuilderBtn');
        if (startBuilderBtn) {
            startBuilderBtn.addEventListener('click', () => {
                const targetJob = document.getElementById('targetJob').value;
                const jobDesc = document.getElementById('jobDescription').value;

                if (!targetJob) {
                    alert('Please enter a target job role.');
                    return;
                }

                resumeData.targetJob = targetJob;
                resumeData.jobDescription = jobDesc;
                saveState();

                // Transition UI
                const setupStep = document.getElementById('step-setup');
                if (setupStep) setupStep.style.display = 'none';

                const builderStep = document.getElementById('step-builder');
                if (builderStep) builderStep.style.display = 'flex';

                const exportPdfBtn = document.getElementById('exportPdfBtn');
                if (exportPdfBtn) exportPdfBtn.style.display = 'inline-flex';

                const exportDocxBtn = document.getElementById('exportDocxBtn');
                if (exportDocxBtn) exportDocxBtn.style.display = 'inline-flex';

                // Show photo upload if requested
                if (resumeData.includePhoto) {
                    const photoGroup = document.getElementById('photoUploadGroup');
                    if (photoGroup) photoGroup.style.display = 'block';
                }

                updatePreview();
            });
        }

        // Tab Navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent any form submission or validation blocking
                const currentBtn = e.currentTarget;
                const tabId = currentBtn.dataset.tab;

                if (!tabId) return;

                const targetSection = document.getElementById('tab-' + tabId);
                if (targetSection) {
                    // Remove active from all
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                    // Add to clicked
                    currentBtn.classList.add('active');
                    targetSection.classList.add('active');
                }
            });
        });

        // Export Buttons
        let currentExportType = null;

        function handleExportRequest(type) {
            currentExportType = type;
            const warnings = [];

            // Strict Validation Check
            if (!resumeData.email) warnings.push("Missing Email Address.");
            if (!resumeData.phone) warnings.push("Missing Phone Number.");
            if (!resumeData.summary || resumeData.summary.length < 20) warnings.push("Summary is too short or missing.");
            if (!resumeData.skills || resumeData.skills.length === 0) warnings.push("No Technical Skills added.");
            if (!resumeData.education || resumeData.education.length === 0) warnings.push("No Education added.");
            if ((!resumeData.projects || resumeData.projects.length === 0) &&
                (!resumeData.experience || resumeData.experience.length === 0) &&
                (!resumeData.internships || resumeData.internships.length === 0)) {
                warnings.push("You must add at least one Project, Internship, or Experience.");
            }

            // Link validation
            const urlPattern = /^https?:\/\//i;
            if (resumeData.portfolio && !urlPattern.test(resumeData.portfolio)) warnings.push("Portfolio URL must start with http:// or https://");
            if (resumeData.github && !urlPattern.test(resumeData.github)) warnings.push("GitHub URL must start with http:// or https://");
            if (resumeData.linkedin && !urlPattern.test(resumeData.linkedin)) warnings.push("LinkedIn URL must start with http:// or https://");

            if (resumeData.projects) {
                resumeData.projects.forEach(p => {
                    if (p.link && !urlPattern.test(p.link)) warnings.push(`Project "${p.title}" GitHub link must start with http(s)://`);
                    if (p.demo && !urlPattern.test(p.demo)) warnings.push(`Project "${p.title}" Live Demo link must start with http(s)://`);
                });
            }

            const paper = document.querySelector('.ats-paper');
            if (paper && paper.scrollHeight > 1110 && paper.classList.contains('scale-3')) {
                warnings.push("CRITICAL: Resume exceeds ONE A4 page even after max scaling! Please remove some content.");
            }

            if (warnings.length > 0) {
                const ul = document.getElementById('validationWarnings');
                if (ul) {
                    ul.innerHTML = '';
                    warnings.forEach(w => {
                        const li = document.createElement('li');
                        li.innerHTML = `<i class="fas fa-times-circle"></i> ${w}`;
                        ul.appendChild(li);
                    });
                    document.getElementById('validationModal').showModal();
                } else {
                    alert("Validation Errors:\n" + warnings.join('\n'));
                }
            } else {
                executeExport(type);
            }
        }

        const downloadAnywayBtn = document.getElementById('downloadAnywayBtn');
        if (downloadAnywayBtn) {
            downloadAnywayBtn.addEventListener('click', () => {
                const modal = document.getElementById('validationModal');
                if (modal) modal.close();
                if (currentExportType) executeExport(currentExportType);
            });
        }

        function executeExport(type) {
            if (type === 'pdf') {
                const previewHtml = document.getElementById('resume-preview').innerHTML;
                const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    /* FAANG/JAKE'S RESUME TEMPLATE - EXTREMELY COMPACT */
                    @page { margin: 14px 18px; size: a4 portrait; }
                    body { font-family: "Calibri", "Arial", "Helvetica", sans-serif; font-size: 11pt; color: #000000; line-height: 1.15; display: flex; flex-direction: column; justify-content: center; }
                    .ats-paper { padding: 0; }
                    
                    /* Auto-Fit Classes */
                    .ats-paper.scale-1 { font-size: 10.5pt; padding: 0.35in; }
                    .ats-paper.scale-1 .ats-name { font-size: 22pt; }
                    .ats-paper.scale-1 .ats-role { font-size: 12pt; }
                    .ats-paper.scale-1 .ats-section-heading { font-size: 11pt; }

                    .ats-paper.scale-2 { font-size: 10pt; padding: 0.30in; line-height: 1.1; }
                    .ats-paper.scale-2 .ats-name { font-size: 20pt; }
                    .ats-paper.scale-2 .ats-role { font-size: 11.5pt; }
                    .ats-paper.scale-2 .ats-section-heading { font-size: 10.5pt; margin-bottom: 2px; }
                    .ats-paper.scale-2 .ats-section { margin-bottom: 4px; }
                    .ats-paper.scale-2 .ats-item { margin-bottom: 3px; }

                    .ats-paper.scale-3 { font-size: 9.5pt; padding: 0.25in; line-height: 1.05; }
                    .ats-paper.scale-3 .ats-name { font-size: 18pt; }
                    .ats-paper.scale-3 .ats-role { font-size: 11pt; }
                    .ats-paper.scale-3 .ats-section-heading { font-size: 10pt; margin-bottom: 2px; }
                    .ats-paper.scale-3 .ats-section { margin-bottom: 3px; }
                    .ats-paper.scale-3 .ats-item { margin-bottom: 2px; }

                    .ats-paper.scale-4 { font-size: 9.5pt; padding: 0.20in; line-height: 1.05; }
                    .ats-paper.scale-4 .ats-name { font-size: 16pt; }
                    .ats-paper.scale-4 .ats-role { font-size: 10.5pt; }
                    .ats-paper.scale-4 .ats-section { margin-bottom: 4px; }
                    .ats-paper.scale-4 .ats-section-heading { margin-bottom: 4px; padding-bottom: 0px; }
                    .ats-paper.scale-4 .ats-item { margin-bottom: 4px; }

                    .ats-paper.scale-5 { font-size: 9.5pt; padding: 0.15in; line-height: 1.0; }
                    .ats-paper.scale-5 .ats-name { font-size: 15pt; }
                    .ats-paper.scale-5 .ats-role { font-size: 10pt; }
                    .ats-paper.scale-5 .ats-section { margin-bottom: 3px; }
                    .ats-paper.scale-5 .ats-section-heading { margin-bottom: 3px; padding-bottom: 0px; }
                    .ats-paper.scale-5 .ats-item { margin-bottom: 3px; }

                    .ats-paper.scale-6 { font-size: 9.5pt; padding: 0.12in; line-height: 0.95; }
                    .ats-paper.scale-6 .ats-name { font-size: 14pt; margin-bottom: 1px; }
                    .ats-paper.scale-6 .ats-role { font-size: 9.5pt; margin-bottom: 1px; }
                    .ats-paper.scale-6 .ats-section { margin-bottom: 2px; }
                    .ats-paper.scale-6 .ats-section-heading { margin-bottom: 2px; padding-bottom: 0px; }
                    .ats-paper.scale-6 .ats-item { margin-bottom: 2px; }

                    div, p, ul, li, h1, h2, h3, h4, h5, h6 { margin: 0; padding: 0; }
                    .ats-header { text-align: center; margin-top: 12px; margin-bottom: 4px; }
                    .ats-name { font-size: 22pt; font-weight: bold; margin-bottom: 1px; }
                    .ats-role { font-size: 11pt; font-weight: 500; color: #000000; margin-bottom: 1px; }
                    .ats-contact-line { font-size: 9.5pt; color: #444444; margin-bottom: 1px; }
                    .ats-contact-line a { color: #000000; text-decoration: none; }
                    .ats-section { margin-bottom: 4px; }
                    .ats-section-heading { font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #444444; margin-top: 8px; margin-bottom: 4px; padding-bottom: 0px; }
                    .ats-text { font-size: 1em; }
                    .ats-summary { text-align: left; line-height: 1.35; word-spacing: normal; letter-spacing: normal; margin-bottom: 0; }
                    .ats-layout-table { width: 100%; border-collapse: collapse; }
                    .ats-layout-table td { padding: 0; vertical-align: top; }
                    .ats-align-right { text-align: right; }
                    .ats-item { margin-bottom: 2px; }
                    .ats-item-title { font-weight: bold; }
                    .ats-item-subtitle { font-style: normal; }
                    .ats-bullets { margin: 1px 0 0 0; padding-left: 14pt; list-style-type: disc; }
                    .ats-bullets li { margin-bottom: 1px; padding-left: 0; }
                    .ats-skills-table { width: 100%; border-collapse: collapse; }
                    .ats-skills-table td { padding: 0 0 2px 0; vertical-align: top; }
                    .ats-skills-category { font-weight: bold; width: 20%; }
                    .ats-skills-list { width: 80%; }
                    .ats-additional-table { width: 100%; border-collapse: collapse; }
                    .ats-additional-table td { padding: 0 0 2px 0; vertical-align: top; }
                    .ats-additional-category { font-weight: bold; width: 15%; }
                    .ats-additional-list { width: 85%; }
                    .ats-additional-list a { color: #000000; text-decoration: none; }
                </style>
            </head>
            <body>
                ${previewHtml}
            </body>
            </html>
            `;
                exportPDF(fullHtml);
            } else if (type === 'docx') {
                const paper = document.querySelector('.ats-paper');
                let scale = 0;
                if (paper) {
                    if (paper.classList.contains('scale-1')) scale = 1;
                    else if (paper.classList.contains('scale-2')) scale = 2;
                    else if (paper.classList.contains('scale-3')) scale = 3;
                }
                const dataToExport = {
                    ...resumeData,
                    scaleLevel: scale,
                    isMerged: window.resumeIsMerged === true
                };
                exportDOCX(dataToExport);
            }
        }

        const exportPdfBtnGlobal = document.getElementById('exportPdfBtn');
        if (exportPdfBtnGlobal) exportPdfBtnGlobal.addEventListener('click', () => handleExportRequest('pdf'));

        const exportDocxBtnGlobal = document.getElementById('exportDocxBtn');
        if (exportDocxBtnGlobal) exportDocxBtnGlobal.addEventListener('click', () => handleExportRequest('docx'));

        // Global var for tracking score
        let lastAtsScore = null;

        // ATS Checking
        const checkAtsBtn = document.getElementById('checkAtsBtn');
        if (checkAtsBtn) {
            checkAtsBtn.addEventListener('click', async () => {
                if (!resumeData.jobDescription) {
                    alert('Please add a Job Description in the initial setup to get an ATS score.');
                    return;
                }
                const result = await checkATS(resumeData, resumeData.jobDescription);
                if (!result) return;

                displayAtsResults(result);

                if (lastAtsScore !== null && lastAtsScore !== result.score) {
                    const diff = result.score - lastAtsScore;
                    const deltaEl = document.getElementById('atsScoreDelta');
                    if (deltaEl) {
                        deltaEl.style.display = 'block';
                        deltaEl.innerText = diff >= 0 ? `+${diff} points` : `${diff} points`;
                        deltaEl.style.color = diff >= 0 ? '#166534' : '#991b1b';
                        deltaEl.style.background = diff >= 0 ? '#dcfce7' : '#fee2e2';
                    }
                }

                lastAtsScore = result.score;
            });
        }

        function displayAtsResults(result) {
            const atsContainer = document.getElementById('atsContainer');
            atsContainer.classList.remove('hidden');

            // 1. Populate Job Analysis
            if (result.job_analysis) {
                document.getElementById('jdMatchPercent').innerText = result.job_analysis.match_percentage + '%';

                const reqContainer = document.getElementById('jdRequiredSkills');
                reqContainer.innerHTML = '';
                (result.job_analysis.required_skills || []).forEach(skill => {
                    const span = document.createElement('span');
                    span.className = 'badge badge-success';
                    span.innerText = skill;
                    reqContainer.appendChild(span);
                });

                const misContainer = document.getElementById('jdMissingSkills');
                misContainer.innerHTML = '';
                (result.job_analysis.missing_skills || []).forEach(skill => {
                    const span = document.createElement('span');
                    span.className = 'badge badge-danger';
                    span.innerText = skill;
                    misContainer.appendChild(span);
                });
            }

            // 2. Populate ATS Breakdown
            document.getElementById('atsScoreValue').innerText = (result.score || 0) + '%';
            const circle = document.getElementById('atsProgressCircle');
            const score = result.score || 0;
            const color = score >= 75 ? '#16a34a' : (score >= 50 ? '#d97706' : '#dc2626');
            circle.style.background = `conic-gradient(${color} ${score * 3.6}deg, #e2e8f0 0deg)`;

            if (result.breakdown) {
                document.getElementById('score-keywords').innerText = (result.breakdown.keywords || 0) + '/30';
                document.getElementById('score-skills').innerText = (result.breakdown.skills || 0) + '/20';
                document.getElementById('score-projects').innerText = (result.breakdown.projects || 0) + '/20';
                document.getElementById('score-experience').innerText = (result.breakdown.experience || 0) + '/15';
                document.getElementById('score-completeness').innerText = (result.breakdown.completeness || 0) + '/10';
                document.getElementById('score-formatting').innerText = (result.breakdown.formatting || 0) + '/5';
                document.getElementById('score-total').innerText = (result.score || 0) + '/100';
            }

            const ensureArray = (arr) => Array.isArray(arr) ? arr : (arr ? [arr] : []);
            const improvements = ensureArray(result.improvements);
            const weakPoints = ensureArray(result.weak_points);
            populateAtsList('atsImprovements', improvements.concat(weakPoints));
        }

        function populateAtsList(elementId, items) {
            const list = document.getElementById(elementId);
            if (!list) return;
            list.innerHTML = '';
            if (items && Array.isArray(items)) {
                items.forEach(item => {
                    const li = document.createElement('li');
                    li.innerText = item;
                    list.appendChild(li);
                });
            }
        }

        const optimizeFullBtn = document.getElementById('optimizeFullBtn');
        if (optimizeFullBtn) {
            optimizeFullBtn.addEventListener('click', async () => {
                if (!resumeData.targetJob) {
                    alert('Please ensure you have a Target Job Role set.');
                    return;
                }

                if (lastAtsScore === null && resumeData.jobDescription) {
                    const atsBtn = document.getElementById('checkAtsBtn');
                    if (atsBtn) await atsBtn.click();
                }

                const optimizedData = await optimizeFullResume(resumeData, resumeData.targetJob);
                if (optimizedData) {
                    // Only diff the text-heavy fields to make it readable
                    const originalText = `SUMMARY:\n${resumeData.summary || ''}\n\nEXPERIENCE:\n${(resumeData.experience || []).map(e => e.description).join('\n')}\n\nPROJECTS:\n${(resumeData.projects || []).map(p => p.description).join('\n')}`;
                    const optimizedText = `SUMMARY:\n${optimizedData.summary || ''}\n\nEXPERIENCE:\n${(optimizedData.experience || []).map(e => e.description).join('\n')}\n\nPROJECTS:\n${(optimizedData.projects || []).map(p => p.description).join('\n')}`;

                    const originalEl = document.getElementById('aiOriginalText');
                    if (originalEl) originalEl.innerText = originalText;

                    const optimizedEl = document.getElementById('aiOptimizedText');
                    if (optimizedEl) optimizedEl.innerText = optimizedText;

                    const modal = document.getElementById('aiDiffModal');
                    if (modal) modal.showModal();

                    const acceptHandler = () => {
                        resumeData = optimizedData;
                        saveState();
                        populateUIFromState();
                        if (typeof window.renderExperience === 'function') window.renderExperience();
                        if (typeof window.renderEducation === 'function') window.renderEducation();
                        if (typeof window.renderProjects === 'function') window.renderProjects();
                        updatePreview();
                        if (resumeData.jobDescription) {
                            const checkBtn = document.getElementById('checkAtsBtn');
                            if (checkBtn) checkBtn.click();
                        }
                        if (modal) modal.close();
                        cleanup();
                    };

                    const rejectHandler = () => {
                        if (modal) modal.close();
                        cleanup();
                    };

                    const cleanup = () => {
                        const acceptBtn = document.getElementById('acceptAiBtn');
                        const rejectBtn = document.getElementById('rejectAiBtn');
                        if (acceptBtn) acceptBtn.removeEventListener('click', acceptHandler);
                        if (rejectBtn) rejectBtn.removeEventListener('click', rejectHandler);
                    };

                    const acceptBtn = document.getElementById('acceptAiBtn');
                    const rejectBtn = document.getElementById('rejectAiBtn');
                    if (acceptBtn) acceptBtn.addEventListener('click', acceptHandler);
                    if (rejectBtn) rejectBtn.addEventListener('click', rejectHandler);
                }
            });
        }
    } catch (err) {
        console.error("Initialization failed:", err);
    }
});

function saveState() {
    localStorage.setItem('resumeState', JSON.stringify(resumeData));

    const indicator = document.getElementById('autosaveIndicator');
    if (indicator) {
        indicator.style.display = 'inline-block';
        clearTimeout(window.autosaveTimeout);
        window.autosaveTimeout = setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    }
}

function populateUIFromState() {
    if (resumeData.targetJob) document.getElementById('targetJob').value = resumeData.targetJob;
    if (resumeData.jobDescription) document.getElementById('jobDescription').value = resumeData.jobDescription;
    if (resumeData.fullName) document.getElementById('fullName').value = resumeData.fullName;
    if (resumeData.email) document.getElementById('email').value = resumeData.email;
    if (resumeData.phone) document.getElementById('phone').value = resumeData.phone;
    if (resumeData.location) document.getElementById('location').value = resumeData.location;
    if (resumeData.linkedin) document.getElementById('linkedin').value = resumeData.linkedin;
    if (resumeData.portfolio) document.getElementById('portfolio').value = resumeData.portfolio;
    if (resumeData.summary) document.getElementById('summary').value = resumeData.summary;
}
