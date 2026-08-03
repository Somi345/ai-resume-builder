// Handles dynamic form field updates and syncing with global state

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Personal Info sync is now handled exclusively by the global sync engine in app.js

    // Photo
    (document.getElementById('profilePhoto') || document.createElement('div')).addEventListener('change', function(e) {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                resumeData.photoDataUrl = event.target.result;
                saveState();
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    // AI Enhance Summary
    window.enhanceWithAI = async function(context) {
        if(context === 'summary') {
            const el = document.getElementById('summary');
            if(!el.value) return alert('Please write a basic summary first.');
            const enhanced = await callAI(el.value, 'Professional Summary');
            el.value = enhanced;
            resumeData.summary = enhanced;
            saveState();
            updatePreview();
        }
    };

    // -- Skills --
    (document.getElementById('skillInput') || document.createElement('div')).addEventListener('keypress', (e) => {
        if(e.key === 'Enter' && e.target.value.trim()) {
            const val = e.target.value.trim();
            resumeData.skills.push({ name: val });
            e.target.value = '';
            saveState();
            renderSkills();
            updatePreview();
        }
    });

    window.renderSkills = function() {
        const container = document.getElementById('skillsContainer');
        container.innerHTML = '';
        resumeData.skills.forEach((skill, index) => {
            const div = document.createElement('div');
            div.className = 'tag';
            div.innerHTML = `
                ${skill.name} 
                <button type="button" onclick="removeSkill(${index})"><i class="fas fa-times"></i></button>
            `;
            container.appendChild(div);
        });
    }

    window.removeSkill = function(index) {
        resumeData.skills.splice(index, 1);
        updateResume();
        renderSkills();
        renderPreview();
    };

    // -- Experience --
    (document.getElementById('addExperienceBtn') || document.createElement('div')).addEventListener('click', () => {
        resumeData.experience.push({
            title: '', company: '', startDate: '', endDate: '', description: ''
        });
        updateResume();
        renderExperience();
        renderPreview();
    });

    window.renderExperience = function() {
        const list = document.getElementById('experienceList');
        list.innerHTML = '';
        resumeData.experience.forEach((exp, index) => {
            const div = document.createElement('div');
            div.className = 'item-card';
            div.innerHTML = `
                <button type="button" class="remove-btn" onclick="removeExperience(${index})"><i class="fas fa-trash"></i></button>
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" oninput="updateExp(${index}, 'title', this.value)" value="${exp.title}" placeholder="Software Engineer">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" oninput="updateExp(${index}, 'company', this.value)" value="${exp.company}" placeholder="Google">
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="text" oninput="updateExp(${index}, 'startDate', this.value)" value="${exp.startDate}" placeholder="Jan 2020">
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="text" oninput="updateExp(${index}, 'endDate', this.value)" value="${exp.endDate}" placeholder="Present">
                    </div>
                </div>
                <div class="form-group">
                    <label>Description & Achievements</label>
                    <textarea rows="3" id="exp-desc-${index}" oninput="updateExp(${index}, 'description', this.value)" placeholder="- Developed API...">${exp.description}</textarea>
                    <div class="ai-button-group" style="display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap;">
                        <button type="button" class="btn-ai" onclick="targetAIOptimize('experience', ${index}, 'star')"><i class="fas fa-star"></i> STAR Method</button>
                        <button type="button" class="btn-ai" onclick="targetAIOptimize('experience', ${index}, 'verbs')"><i class="fas fa-bolt"></i> Action Verbs</button>
                        <button type="button" class="btn-ai" onclick="targetAIOptimize('experience', ${index}, 'grammar')"><i class="fas fa-spell-check"></i> Grammar</button>
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    }

    window.updateExp = function(index, field, value) {
        resumeData.experience[index][field] = value;
        // Global sync engine will automatically save and preview
    };

    window.removeExperience = function(index) {
        resumeData.experience.splice(index, 1);
        updateResume();
        renderExperience();
        renderPreview();
    };

    window.targetAIOptimize = async function(section, index, type) {
        const desc = resumeData[section][index].description;
        if(!desc) return alert('Please write a basic description first.');
        
        let enhanced;
        if (type === 'star') enhanced = await optimizeStar(desc);
        else if (type === 'verbs') enhanced = await enhanceVerbs(desc);
        else if (type === 'grammar') enhanced = await checkGrammar(desc);
        else return;

        resumeData[section][index].description = enhanced;
        saveState();
        if(section === 'experience') renderExperience();
        if(section === 'internships') renderInternships();
        if(section === 'projects') renderProjects();
        updatePreview();
    };

    // -- Education --
    (document.getElementById('addEducationBtn') || document.createElement('div')).addEventListener('click', () => {
        resumeData.education.push({
            degree: '', school: '', year: '', grade: ''
        });
        updateResume();
        renderEducation();
        renderPreview();
    });

    window.renderEducation = function() {
        const list = document.getElementById('educationList');
        list.innerHTML = '';
        resumeData.education.forEach((edu, index) => {
            const div = document.createElement('div');
            div.className = 'item-card';
            div.innerHTML = `
                <button type="button" class="remove-btn" onclick="removeEducation(${index})"><i class="fas fa-trash"></i></button>
                <div class="form-group">
                    <label>Degree</label>
                    <input type="text" oninput="updateEdu(${index}, 'degree', this.value)" value="${edu.degree}" placeholder="B.S. Computer Science">
                </div>
                <div class="form-group">
                    <label>School / University</label>
                    <input type="text" oninput="updateEdu(${index}, 'school', this.value)" value="${edu.school}" placeholder="MIT">
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Year</label>
                        <input type="text" oninput="updateEdu(${index}, 'year', this.value)" value="${edu.year}" placeholder="2018 - 2022">
                    </div>
                    <div class="form-group">
                        <label>CGPA / Grade</label>
                        <input type="text" oninput="updateEdu(${index}, 'grade', this.value)" value="${edu.grade}" placeholder="3.8/4.0">
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    }

    window.updateEdu = function(index, field, value) {
        resumeData.education[index][field] = value;
    };

    window.removeEducation = function(index) {
        resumeData.education.splice(index, 1);
        updateResume();
        renderEducation();
        renderPreview();
    };

    // -- Projects --
    (document.getElementById('addProjectBtn') || document.createElement('div')).addEventListener('click', () => {
        resumeData.projects.push({
            title: '', technologies: '', link: '', demo: '', description: ''
        });
        updateResume();
        renderProjects();
        renderPreview();
    });

    window.renderProjects = function() {
        const list = document.getElementById('projectsList');
        list.innerHTML = '';
        resumeData.projects.forEach((proj, index) => {
            const div = document.createElement('div');
            div.className = 'item-card';
            div.innerHTML = `
                <button type="button" class="remove-btn" onclick="removeProject(${index})"><i class="fas fa-trash"></i></button>
                <div class="form-group">
                    <label>Project Title</label>
                    <input type="text" oninput="updateProj(${index}, 'title', this.value)" value="${proj.title}" placeholder="E-commerce Platform">
                </div>
                <div class="form-group">
                    <label>Technologies Used</label>
                    <input type="text" oninput="updateProj(${index}, 'technologies', this.value)" value="${proj.technologies || ''}" placeholder="React, Node.js">
                </div>
                <div class="form-group">
                    <label>Github Link (Optional)</label>
                    <input type="url" oninput="updateProj(${index}, 'link', this.value)" value="${proj.link || ''}" placeholder="https://github.com/...">
                </div>
                <div class="form-group">
                    <label>Live Demo (Optional)</label>
                    <input type="url" oninput="updateProj(${index}, 'demo', this.value)" value="${proj.demo || ''}" placeholder="https://demo.com/...">
                </div>
                <div class="form-group">
                    <label>Description & Technologies</label>
                    <textarea rows="3" oninput="updateProj(${index}, 'description', this.value)" placeholder="- Built dashboard...">${proj.description}</textarea>
                    <div class="ai-button-group" style="display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap;">
                        <button type="button" class="btn-ai" onclick="targetAIOptimize('projects', ${index}, 'star')"><i class="fas fa-star"></i> STAR Method</button>
                        <button type="button" class="btn-ai" onclick="targetAIOptimize('projects', ${index}, 'verbs')"><i class="fas fa-bolt"></i> Action Verbs</button>
                        <button type="button" class="btn-ai" onclick="targetAIOptimize('projects', ${index}, 'grammar')"><i class="fas fa-spell-check"></i> Grammar</button>
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    }

    window.updateProj = function(index, field, value) {
        resumeData.projects[index][field] = value;
    };

    window.removeProject = function(index) {
        resumeData.projects.splice(index, 1);
        updateResume();
        renderProjects();
        renderPreview();
    };

    window.enhanceProjectAI = async function(index) {
        const desc = resumeData.projects[index].description;
        if(!desc) return alert('Please write a basic description first.');
        const enhanced = await callAI(desc, 'Project Description bullet points');
        resumeData.projects[index].description = enhanced;
        saveState();
        renderProjects();
        updatePreview();
    };
    // -- Internships --
    (document.getElementById('addInternshipBtn') || document.createElement('div')).addEventListener('click', () => {
        if(!resumeData.internships) resumeData.internships = [];
        resumeData.internships.push({
            title: '', company: '', startDate: '', endDate: '', description: ''
        });
        updateResume();
        renderInternships();
        renderPreview();
    });

    window.renderInternships = function() {
        const list = document.getElementById('internshipsList');
        if(!list) return;
        list.innerHTML = '';
        if(!resumeData.internships) return;
        resumeData.internships.forEach((intern, index) => {
            const div = document.createElement('div');
            div.className = 'item-card';
            div.innerHTML = `
                <button type="button" class="remove-btn" onclick="removeInternship(${index})"><i class="fas fa-trash"></i></button>
                <div class="form-group">
                    <label>Role</label>
                    <input type="text" oninput="updateInt(${index}, 'title', this.value)" value="${intern.title}" placeholder="Software Engineering Intern">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" oninput="updateInt(${index}, 'company', this.value)" value="${intern.company}" placeholder="Google">
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="text" oninput="updateInt(${index}, 'startDate', this.value)" value="${intern.startDate}" placeholder="Jan 2020">
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="text" oninput="updateInt(${index}, 'endDate', this.value)" value="${intern.endDate}" placeholder="Present">
                    </div>
                </div>
                <div class="form-group">
                    <label>Description & Achievements</label>
                    <textarea rows="3" oninput="updateInt(${index}, 'description', this.value)" placeholder="- Developed API...">${intern.description}</textarea>
                    <div class="ai-button-group" style="display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap;">
                        <button type="button" class="btn-ai" onclick="targetAIOptimize('internships', ${index}, 'star')"><i class="fas fa-star"></i> STAR Method</button>
                        <button type="button" class="btn-ai" onclick="targetAIOptimize('internships', ${index}, 'verbs')"><i class="fas fa-bolt"></i> Action Verbs</button>
                        <button type="button" class="btn-ai" onclick="targetAIOptimize('internships', ${index}, 'grammar')"><i class="fas fa-spell-check"></i> Grammar</button>
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    }

    window.updateInt = function(index, field, value) {
        resumeData.internships[index][field] = value;
    };

    window.removeInternship = function(index) {
        resumeData.internships.splice(index, 1);
        updateResume();
        renderInternships();
        renderPreview();
    };


    
    // -- Certifications --
    (document.getElementById('addCertificationBtn') || document.createElement('div')).addEventListener('click', () => {
        if(!resumeData.certifications) resumeData.certifications = [];
        resumeData.certifications.push({ name: '', organization: '', year: '' });
        updateResume();
        renderCertifications();
        renderPreview();
    });

    window.renderCertifications = function() {
        const list = document.getElementById('certificationsList');
        if(!list) return;
        list.innerHTML = '';
        if(!resumeData.certifications) return;
        resumeData.certifications.forEach((cert, index) => {
            const div = document.createElement('div');
            div.className = 'item-card';
            div.innerHTML = `
                <button type="button" class="remove-btn" onclick="removeCertification(${index})"><i class="fas fa-trash"></i></button>
                <div class="form-group">
                    <label>Certification Name</label>
                    <input type="text" oninput="updateCert(${index}, 'name', this.value)" value="${cert.name || ''}" placeholder="AWS Certified Solutions Architect">
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Organization</label>
                        <input type="text" oninput="updateCert(${index}, 'organization', this.value)" value="${cert.organization || ''}" placeholder="Amazon">
                    </div>
                    <div class="form-group">
                        <label>Year (Optional)</label>
                        <input type="text" oninput="updateCert(${index}, 'year', this.value)" value="${cert.year || ''}" placeholder="2023">
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    }

    window.updateCert = function(index, field, value) {
        if(typeof resumeData.certifications[index] === 'string') {
            resumeData.certifications[index] = { name: resumeData.certifications[index] };
        }
        resumeData.certifications[index][field] = value;
    };

    window.removeCertification = function(index) {
        resumeData.certifications.splice(index, 1);
        updateResume();
        renderCertifications();
        renderPreview();
    };

    // -- Generic Dynamic Lists (Achievements, Coursework, Languages, Responsibilities, Interests) --
    function setupDynamicList(buttonId, listId, dataKey, label, placeholder) {
        document.getElementById(buttonId)?.addEventListener('click', () => {
            if(!resumeData[dataKey]) resumeData[dataKey] = [];
            resumeData[dataKey].push({ name: '' });
            saveState();
            window['render' + dataKey]();
        });

        window['render' + dataKey] = function() {
            const list = document.getElementById(listId);
            if(!list) return;
            list.innerHTML = '';
            if(!resumeData[dataKey]) return;
            resumeData[dataKey].forEach((item, index) => {
                const val = typeof item === 'object' ? (item.name || '') : item;
                const div = document.createElement('div');
                div.className = 'item-card';
                div.innerHTML = `
                    <button type="button" class="remove-btn" onclick="removeDynamicItem('${dataKey}', ${index})"><i class="fas fa-trash"></i></button>
                    <div class="form-group" style="margin-bottom:0;">
                        <label>${label}</label>
                        <input type="text" oninput="updateDynamicItem('${dataKey}', ${index}, this.value)" value="${val}" placeholder="${placeholder}">
                    </div>
                `;
                list.appendChild(div);
            });
        };
    }

    window.updateDynamicItem = function(dataKey, index, value) {
        if(typeof resumeData[dataKey][index] === 'object') {
            resumeData[dataKey][index].name = value;
        } else {
            resumeData[dataKey][index] = value; // Backward compatibility
        }
    };

    window.removeDynamicItem = function(dataKey, index) {
        resumeData[dataKey].splice(index, 1);
        updateResume();
        window['render' + dataKey]();
        renderPreview();
    };

    setupDynamicList('addAchievementBtn', 'achievementsList', 'achievements', 'Achievement / Award', '1st Place in Global Hackathon');
    setupDynamicList('addResponsibilityBtn', 'responsibilitiesList', 'responsibilities', 'Role / Responsibility', 'Event Coordinator');
    setupDynamicList('addCourseworkBtn', 'courseworkList', 'coursework', 'Course Name', 'Data Structures and Algorithms');
    setupDynamicList('addLanguageBtn', 'languagesList', 'languages', 'Language', 'English, Spanish (Fluent)');
    setupDynamicList('addInterestBtn', 'interestsList', 'interests', 'Interest', 'Open Source Contribution');
    
    // -- Coding Profiles --
    const addProfileBtn = document.getElementById('addProfileBtn');
    if (addProfileBtn) {
        addProfileBtn.addEventListener('click', () => {
            if(!resumeData.codingProfiles) resumeData.codingProfiles = [];
            resumeData.codingProfiles.push({ platform: '', link: '' });
            updateResume();
            renderProfiles();
            renderPreview();
        });
    }

    window.renderProfiles = function() {
        const list = document.getElementById('codingProfilesList');
        if(!list) return;
        list.innerHTML = '';
        if(!resumeData.codingProfiles) return;
        resumeData.codingProfiles.forEach((prof, index) => {
            const div = document.createElement('div');
            div.className = 'item-card';
            div.innerHTML = `
                <button type="button" class="remove-btn" onclick="removeProfile(${index})"><i class="fas fa-trash"></i></button>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Platform</label>
                        <input type="text" oninput="updateProfile(${index}, 'platform', this.value)" value="${prof.platform}" placeholder="LeetCode">
                    </div>
                    <div class="form-group">
                        <label>Link / Handle</label>
                        <input type="text" oninput="updateProfile(${index}, 'link', this.value)" value="${prof.link}" placeholder="leetcode.com/user">
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    }

    window.updateProfile = function(index, field, value) {
        resumeData.codingProfiles[index][field] = value;
    };

    window.removeProfile = function(index) {
        resumeData.codingProfiles.splice(index, 1);
        updateResume();
        renderProfiles();
        renderPreview();
    };
    
    } catch (err) {
        console.error("Initialization failed:", err);
    }
});
