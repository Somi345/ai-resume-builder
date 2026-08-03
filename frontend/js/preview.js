// Updates the visual preview panel based on the resumeData object
console.log("preview.js loaded");

function categorizeSkills(skillsArray) {
    const categories = {
        'Programming Languages': ['java', 'python', 'c', 'c++', 'c#', 'cpp', 'javascript', 'typescript', 'go', 'ruby', 'swift', 'kotlin', 'php', 'rust'],
        'Web Technologies': ['html', 'css', 'react', 'react.js', 'reactjs', 'vue', 'angular', 'next.js', 'html5', 'css3', 'tailwind', 'bootstrap'],
        'Backend': ['node.js', 'nodejs', 'express', 'django', 'flask', 'spring boot', 'spring'],
        'Databases': ['mysql', 'postgresql', 'postgres', 'mongodb', 'mongo', 'oracle', 'sql server', 'redis', 'firebase', 'sqlite', 'nosql', 'sql'],
        'Core CS': ['dsa', 'dbms', 'oop', 'operating systems', 'os', 'computer networks', 'cn', 'data structures', 'algorithms'],
        'Cloud & DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'github actions', 'jenkins', 'ci/cd', 'terraform', 'linux'],
        'Tools': ['git', 'github', 'vs code', 'vscode', 'postman', 'intellij', 'eclipse', 'jira', 'figma', 'webpack', 'npm', 'yarn'],
        'AI/ML': ['tensorflow', 'pytorch', 'opencv', 'scikit-learn', 'pandas', 'numpy', 'keras', 'machine learning', 'deep learning', 'nlp', 'artificial intelligence']
    };

    const grouped = {
        'Programming Languages': [],
        'Web Technologies': [],
        'Backend': [],
        'Databases': [],
        'Core CS': [],
        'Cloud & DevOps': [],
        'Tools': [],
        'AI/ML': [],
        'Other Skills': []
    };

    skillsArray.forEach(skillObj => {
        const skillName = typeof skillObj === 'object' ? (skillObj.name || '') : skillObj;
        if(!skillName) return;
        const normalized = skillName.toLowerCase().trim();
        let found = false;
        
        for (const [catName, keywords] of Object.entries(categories)) {
            if (keywords.includes(normalized)) {
                grouped[catName].push(skillName);
                found = true;
                break;
            }
        }
        
        if (!found) {
            grouped['Other Skills'].push(skillName);
        }
    });

    const result = {};
    for (const [catName, items] of Object.entries(grouped)) {
        if (items.length > 0) {
            result[catName] = items;
        }
    }
    return result;
}

function renderSectionHeader(title) {
    return `<div class="ats-section"><div class="ats-section-heading">${title}</div>`;
}

function updatePreview() {
    const previewArea = document.getElementById('resume-preview');
    if(!previewArea) {
        console.error("Preview area 'resume-preview' not found in DOM");
        return;
    }

    try {
        console.log("updatePreview called");
        console.log("resumeData before render:", resumeData);

        let html = `<div class="ats-paper">`;

        // 1. HEADER
        html += `<div class="ats-header">`;
        html += `<div class="ats-name">${resumeData.fullName || 'YOUR NAME'}</div>`;
        if (resumeData.targetJob) {
            html += `<div class="ats-role">${resumeData.targetJob}</div>`;
        }
        
        const contact1 = [];
        const contact2 = [];
        if (resumeData.email) contact1.push(resumeData.email);
        if (resumeData.phone) contact1.push(resumeData.phone);
        if (resumeData.location) contact1.push(resumeData.location);
        
        if (resumeData.github) contact2.push(`<a href="${resumeData.github}" target="_blank">GitHub</a>`);
        if (resumeData.linkedin) contact2.push(`<a href="${resumeData.linkedin}" target="_blank">LinkedIn</a>`);
        if (resumeData.portfolio) contact2.push(`<a href="${resumeData.portfolio}" target="_blank">Portfolio</a>`);
        
        const contactAll = [...contact1, ...contact2];
        if (contactAll.length > 0) {
            html += `<div class="ats-contact-line">${contactAll.join(' | ')}</div>`;
        }
        html += `</div>`; // End Header

        // 2. PROFESSIONAL SUMMARY / OBJECTIVE
        if (resumeData.summary && resumeData.summary.trim()) {
            html += renderSectionHeader('OBJECTIVE');
            html += `<p class="ats-summary ats-text">${resumeData.summary}</p>`;
            html += `</div>`;
        }

        // 3. EDUCATION
        if (resumeData.education && resumeData.education.length > 0) {
            html += renderSectionHeader('EDUCATION');
            resumeData.education.forEach(edu => {
                html += `<div class="ats-item" style="margin-bottom:4px;">`;
                html += `<table class="ats-layout-table"><tr>`;
                html += `<td class="ats-item-title">${edu.degree || 'Degree'}</td>`;
                html += `<td class="ats-align-right">${edu.year || ''}</td>`;
                html += `</tr>`;
                
                html += `<tr>`;
                html += `<td class="ats-item-subtitle">${edu.school || 'College'}</td>`;
                const gradeStr = edu.grade ? (edu.grade.includes('%') || edu.grade.toLowerCase().includes('cgpa') || edu.grade.toLowerCase().includes('percentage') ? edu.grade : `CGPA: ${edu.grade}`) : '';
                html += `<td class="ats-align-right">${gradeStr}</td>`;
                html += `</tr></table>`;
                html += `</div>`;
            });
            // Handle global coursework at the end of education
            if (resumeData.coursework && resumeData.coursework.length > 0) {
                const cw = resumeData.coursework.map(c => typeof c === 'object' ? c.name : c).filter(Boolean);
                if (cw.length > 0) {
                    html += `<div style="margin-top:2px;"><b>Relevant Coursework:</b> ${cw.join(', ')}</div>`;
                }
            }
            html += `</div>`;
        }

        // 4. TECHNICAL SKILLS
        if (resumeData.skills && resumeData.skills.length > 0) {
            html += renderSectionHeader('Technical Skills');
            html += `<table class="ats-skills-table">`;
            const groupedSkills = categorizeSkills(resumeData.skills);
            for (const [category, items] of Object.entries(groupedSkills)) {
                html += `<tr>`;
                html += `<td class="ats-skills-category">${category} :</td>`;
                html += `<td class="ats-skills-list">${items.join(', ')}</td>`;
                html += `</tr>`;
            }
            html += `</table></div>`;
        }

        // 5. PROJECTS
        if (resumeData.projects && resumeData.projects.length > 0) {
            html += renderSectionHeader('PROJECTS');
            resumeData.projects.forEach(proj => {
                html += `<div class="ats-item">`;
                
                let titleHtml = `<span class="ats-item-title">${proj.title || 'Project Name'}</span>`;
                const pLinks = [];
                if (proj.link) pLinks.push(`<a href="${proj.link}" target="_blank">Link</a>`);
                if (proj.demo) pLinks.push(`<a href="${proj.demo}" target="_blank">Live Demo</a>`);
                if (pLinks.length > 0) {
                    titleHtml += ` <span style="font-weight: normal; font-size: 10pt;">| ${pLinks.join(' | ')}</span>`;
                }

                html += `<table class="ats-layout-table"><tr>`;
                html += `<td>${titleHtml}</td>`;
                html += `<td class="ats-align-right">${proj.technologies || ''}</td>`;
                html += `</tr></table>`;

                if (proj.description) {
                    const bullets = proj.description.split('\n').filter(b => b.trim());
                    if (bullets.length > 0) {
                        html += `<ul class="ats-bullets">`;
                        bullets.slice(0, 2).forEach(b => {
                            let text = b.replace(/^- /, '').trim();
                            if(text) {
                                const words = text.split(/\s+/);
                                if (words.length > 20) text = words.slice(0, 20).join(' ') + '...';
                                html += `<li>${text}</li>`;
                            }
                        });
                        html += `</ul>`;
                    }
                }
                html += `</div>`;
            });
            html += `</div>`;
        }

        // 6. EXPERIENCE
        if (resumeData.experience && resumeData.experience.length > 0) {
            html += renderSectionHeader('EXPERIENCE');
            resumeData.experience.forEach(exp => {
                html += `<div class="ats-item">`;
                const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
                
                html += `<table class="ats-layout-table"><tr>`;
                html += `<td class="ats-item-title">${exp.title || 'Role'}</td>`;
                html += `<td class="ats-align-right">${dates}</td>`;
                html += `</tr></table>`;

                if(exp.company) {
                    html += `<div class="ats-item-subtitle">${exp.company}</div>`;
                }

                if (exp.description) {
                    const bullets = exp.description.split('\n').filter(b => b.trim());
                    if (bullets.length > 0) {
                        html += `<ul class="ats-bullets">`;
                        bullets.slice(0, 2).forEach(b => {
                            let text = b.replace(/^- /, '').trim();
                            if(text) {
                                const words = text.split(/\s+/);
                                if (words.length > 20) text = words.slice(0, 20).join(' ') + '...';
                                html += `<li>${text}</li>`;
                            }
                        });
                        html += `</ul>`;
                    }
                }
                html += `</div>`;
            });
            html += `</div>`;
        }

        // 6.5. INTERNSHIPS
        if (resumeData.internships && resumeData.internships.length > 0) {
            html += renderSectionHeader('INTERNSHIPS');
            resumeData.internships.forEach(intern => {
                html += `<div class="ats-item">`;
                const dates = [intern.startDate, intern.endDate].filter(Boolean).join(' - ');
                
                html += `<table class="ats-layout-table"><tr>`;
                html += `<td class="ats-item-title">${intern.title || 'Role'}</td>`;
                html += `<td class="ats-align-right">${dates}</td>`;
                html += `</tr></table>`;

                if(intern.company) {
                    html += `<div class="ats-item-subtitle">${intern.company}</div>`;
                }

                if (intern.description) {
                    const bullets = intern.description.split('\n').filter(b => b.trim());
                    if (bullets.length > 0) {
                        html += `<ul class="ats-bullets">`;
                        bullets.slice(0, 2).forEach(b => {
                            let text = b.replace(/^- /, '').trim();
                            if(text) {
                                const words = text.split(/\s+/);
                                if (words.length > 20) text = words.slice(0, 20).join(' ') + '...';
                                html += `<li>${text}</li>`;
                            }
                        });
                        html += `</ul>`;
                    }
                }
                html += `</div>`;
            });
            html += `</div>`;
        }

        // 7. CERTIFICATIONS
        if (resumeData.certifications && resumeData.certifications.length > 0) {
            html += renderSectionHeader('Certifications');
            html += `<ul class="ats-bullets">`;
            resumeData.certifications.slice(0, 1).forEach(cert => {
                let line = cert.name || '';
                if (cert.organization) line += ` - ${cert.organization}`;
                if (cert.year) line += ` (${cert.year})`;
                html += `<li>${line}</li>`;
            });
            html += `</ul></div>`;
        }

        // 8. CODING PROFILES
        if (resumeData.codingProfiles && resumeData.codingProfiles.length > 0) {
            const validProfiles = resumeData.codingProfiles.filter(p => p.link && p.link.trim() !== '');
            if (validProfiles.length > 0) {
                const profileStrings = validProfiles.map(p => {
                    const name = p.platform || p.name || p.link;
                    return `<a href="${p.link}" target="_blank">${name}</a>`;
                });
                html += renderSectionHeader('Coding Profiles');
                html += `<div class="ats-text">${profileStrings.join(' | ')}</div></div>`;
            }
        }

        // 9. ACHIEVEMENTS
        if (resumeData.achievements && resumeData.achievements.length > 0) {
            html += renderSectionHeader('Achievements');
            html += `<ul class="ats-bullets">`;
            resumeData.achievements.slice(0, 1).forEach(a => {
                const text = typeof a === 'object' ? a.name : a;
                if(text) html += `<li>${text}</li>`;
            });
            html += `</ul></div>`;
        }

        // 10. LANGUAGES
        if (resumeData.languages && resumeData.languages.length > 0) {
            const langs = resumeData.languages.slice(0, 2).map(l => typeof l === 'object' ? l.name : l).filter(Boolean);
            if (langs.length > 0) {
                html += renderSectionHeader('Languages');
                html += `<div class="ats-text">${langs.join(' | ')}</div></div>`;
            }
        }

        html += `</div>`;
        previewArea.innerHTML = html;
        
        autoFitResume();

    } catch (error) {
        console.error("FATAL ERROR IN updatePreview:", error);
        console.error(error.stack);
        previewArea.innerHTML = `<div style="color:red; padding: 20px;"><h3>Preview Render Error</h3><pre>${error.stack}</pre></div>`;
    }
}

function autoFitResume() {
    const paper = document.querySelector('.ats-paper');
    if (!paper) return;
    
    // We remove any existing scale classes
    paper.classList.remove('scale-1', 'scale-2', 'scale-3', 'scale-4', 'scale-5', 'scale-6');
    
    // Clear validation warning if it exists
    let warningBox = document.getElementById('resume-validation-warning');
    if (warningBox) warningBox.style.display = 'none';

    if (paper.scrollHeight <= paper.clientHeight) return;
    
    const scales = ['scale-1', 'scale-2', 'scale-3', 'scale-4', 'scale-5', 'scale-6'];
    for (let i = 0; i < scales.length; i++) {
        paper.classList.add(scales[i]);
        if (i > 0) paper.classList.remove(scales[i-1]);
        if (paper.scrollHeight <= paper.clientHeight) return; // It fits!
    }
    
    // If we reach here, it still doesn't fit even at scale-6 (9pt hard limit)
    // The user explicitly requested to show a validation warning instead of clipping or adding page 2
    if (!warningBox) {
        warningBox = document.createElement('div');
        warningBox.id = 'resume-validation-warning';
        warningBox.style.cssText = 'position: absolute; top: 10px; right: 10px; background: #fee2e2; color: #991b1b; padding: 10px 15px; border-radius: 6px; font-weight: bold; border: 1px solid #f87171; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
        // Insert into the resume-paper-container
        const container = document.querySelector('.resume-paper-container');
        if (container) container.appendChild(warningBox);
    }
    warningBox.innerText = "Warning: This resume exceeds one page. Remove content or enable multi-page mode.";
    warningBox.style.display = 'block';
}

window.updatePreview = updatePreview;
