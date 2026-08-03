import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

load_dotenv()

def get_gemini_model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        return None
    genai.configure(api_key=api_key)
    # Using the standard model for text generation
    return genai.GenerativeModel('gemini-2.5-flash-lite')

def enhance_text(text, context):
    model = get_gemini_model()
    if not model:
        # Fallback if AI is unavailable
        return f"[AI Unavailable - Set API Key] Original text: {text}"
        
    prompt = f"""
    You are an expert resume writer and career coach. 
    Please improve the following text intended for a resume's {context} section. 
    Make it professional, ATS-friendly, and action-oriented. Use strong action verbs.
    IMPORTANT RULES:
    - Never invent experience.
    - Never invent internships.
    - Never invent projects.
    - Never invent achievements.
    - Only improve wording, grammar, ATS keywords, and action verbs.
    Do not add any intro or outro text, just return the improved text directly.
    
    Original text:
    {text}
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise Exception("AI service unavailable. Please check API key or try again.")

import re

def normalize_skill(skill):
    skill = skill.lower().strip()
    synonyms = {
        'reactjs': 'react', 'react.js': 'react',
        'javascript': 'js', 'node.js': 'node', 'nodejs': 'node',
        'vue.js': 'vue', 'vuejs': 'vue',
        'machine learning': 'ml', 'artificial intelligence': 'ai',
        'postgresql': 'sql', 'mysql': 'sql', 'nosql': 'sql',
        'typescript': 'ts'
    }
    return synonyms.get(skill, skill)

def extract_keywords(text):
    text = text.lower()
    words = re.findall(r'\b[a-z]{3,}\b', text)
    stop_words = {'with', 'this', 'that', 'from', 'your', 'have', 'been', 'what', 'will', 'about', 'their', 'which', 'there', 'would', 'other', 'could', 'should', 'these', 'those', 'and', 'the', 'for'}
    return set([w for w in words if w not in stop_words])

def analyze_ats(resume_data, job_description):
    score = 0
    breakdown = {}
    strengths = []
    
    # 1. Keyword Match (30 points)
    jd_keywords = extract_keywords(job_description or '')
    resume_text = (
        str(resume_data.get('summary') or '') + ' ' + 
        ' '.join([(str(s.get('name') or '') if isinstance(s, dict) else str(s)) for s in resume_data.get('skills', [])]) + ' ' +
        ' '.join([str(e.get('description') or '') for e in resume_data.get('experience', [])]) + ' ' +
        ' '.join([str(i.get('description') or '') for i in resume_data.get('internships', [])]) + ' ' +
        ' '.join([str(p.get('description') or '') for p in resume_data.get('projects', [])])
    ).lower()
    
    resume_keywords = extract_keywords(resume_text)
    
    if not jd_keywords:
        kw_score = 30
    else:
        matched = jd_keywords.intersection(resume_keywords)
        match_ratio = len(matched) / len(jd_keywords)
        kw_score = min(30, int(match_ratio * 60)) # Scale up as JD has fluff
        
    score += kw_score
    breakdown['keywords'] = kw_score
    strengths.append(f"Keyword Match: {kw_score}/30")
    
    # 2. Skills Match (20 points)
    user_skills = [normalize_skill(s.get('name', '') if isinstance(s, dict) else str(s)) for s in resume_data.get('skills', [])]
    if len(user_skills) >= 5:
        skill_score = 20
    elif len(user_skills) > 0:
        skill_score = len(user_skills) * 4
    else:
        skill_score = 0
    score += skill_score
    breakdown['skills'] = skill_score
    strengths.append(f"Skills Match: {skill_score}/20")
    
    # 3. Project Quality (20 points)
    proj_score = 0
    projects = resume_data.get('projects', []) or []
    if projects:
        for p in projects:
            desc = str(p.get('description') or '').lower()
            tech = str(p.get('technologies') or '').lower()
            if len(desc) > 20: proj_score += 2
            if tech: proj_score += 2
            if any(verb in desc for verb in ['developed', 'built', 'created', 'designed', 'implemented', 'optimized']):
                proj_score += 3
            if any(char.isdigit() for char in desc) or '%' in desc or '$' in desc:
                proj_score += 3 # Measurable impact
        proj_score = min(20, proj_score)
    score += proj_score
    breakdown['projects'] = proj_score
    strengths.append(f"Project Quality: {proj_score}/20")
    
    # 4. Experience (15 points)
    exp_score = 0
    # Combine experiences and internships for scoring
    all_experience = (resume_data.get('experience', []) or []) + (resume_data.get('internships', []) or [])
    if all_experience:
        for e in all_experience:
            desc = str(e.get('description') or '').lower()
            if e.get('title') and e.get('company'): exp_score += 2
            if len(desc) > 20: exp_score += 3
            if any(char.isdigit() for char in desc) or '%' in desc or '$' in desc:
                exp_score += 2.5 # Measurable results
        exp_score = min(15, int(exp_score))
    score += exp_score
    breakdown['experience'] = exp_score
    strengths.append(f"Experience/Achievements: {exp_score}/15")
    
    # 5. Completeness (10 points)
    comp_score = 0
    if resume_data.get('targetJob'): comp_score += 2
    if resume_data.get('summary') and len(resume_data.get('summary', '')) > 20: comp_score += 2
    if resume_data.get('education'): comp_score += 2
    if resume_data.get('skills'): comp_score += 2
    if resume_data.get('experience') or resume_data.get('internships') or resume_data.get('projects'): comp_score += 2
    score += comp_score
    breakdown['completeness'] = comp_score
    strengths.append(f"Completeness: {comp_score}/10")
    
    # 6. Formatting (5 points)
    format_score = 5 
    score += format_score
    breakdown['formatting'] = format_score
    strengths.append(f"Formatting: {format_score}/5")
    
    # Cap score at 95 to be realistic
    score = min(95, score)
    
    jd_keywords_list = list(jd_keywords)
    missing_skills = list(jd_keywords - resume_keywords)
    match_percentage = int((len(jd_keywords.intersection(resume_keywords)) / len(jd_keywords)) * 100) if jd_keywords else 100
    
    job_analysis = {
        "required_skills": jd_keywords_list[:15],
        "missing_skills": missing_skills,
        "match_percentage": match_percentage
    }
    
    result = {
        "score": score,
        "breakdown": breakdown,
        "job_analysis": job_analysis,
        "strengths": strengths,
        "missing_keywords": [],
        "improvements": []
    }
    
    # Gemini AI Suggestions
    model = get_gemini_model()
    if model:
        existing_sections = []
        if resume_data.get('experience'): existing_sections.append('Experience')
        if resume_data.get('projects'): existing_sections.append('Projects')
        if resume_data.get('education'): existing_sections.append('Education')
        if resume_data.get('internships'): existing_sections.append('Internships')
        if resume_data.get('certifications'): existing_sections.append('Certifications')
        
        prompt = f"""
        Based on this Job Description:
        {job_description}
        
        And this Resume:
        {resume_text}
        
        The resume already contains the following sections: {', '.join(existing_sections)}.
        Existing skills: {', '.join(user_skills)}.
        
        RULES:
        1. Never suggest adding a section that already exists (e.g., if 'Projects' exists, do not suggest adding it. Instead suggest improving existing projects).
        2. Never suggest adding a skill that is already listed.
        3. Make suggestions strictly based on missing aspects compared to the JD.
        
        Provide strictly in JSON format (do not use markdown blocks):
        {{
            "missing_keywords": ["give 3 critical missing technical keywords"],
            "improvements": ["give 2 short action-oriented tips to improve the resume"]
        }}
        """
        config = genai.types.GenerationConfig(temperature=0.2, max_output_tokens=300)
        try:
            response = model.generate_content(prompt, generation_config=config)
            text_response = response.text.strip()
            start_idx = text_response.find('{')
            end_idx = text_response.rfind('}')
            if start_idx != -1 and end_idx != -1:
                json_str = text_response[start_idx:end_idx+1]
                import json
                ai_result = json.loads(json_str)
                result["missing_keywords"] = ai_result.get("missing_keywords", [])
                result["improvements"] = ai_result.get("improvements", [])
        except Exception as e:
            print(f"Gemini ignored for suggestions due to error: {e}")
            
    return result

def optimize_full_resume(resume_data, target_role):
    model = get_gemini_model()
    if not model:
        raise Exception("AI service unavailable. Please check API key or try again.")
        
    prompt = f"""
    You are a Senior Technical Recruiter and an advanced ATS Engine.
    Optimize the following resume data for a FAANG/Product-based company standard.
    Target Role: {target_role}
    
    Rules:
    - Never invent experience.
    - Never invent internships.
    - Never invent projects.
    - Never invent achievements.
    - Only improve wording, grammar, ATS keywords, and action verbs.
    - Use strong resume action words (e.g., Developed, Implemented, Designed, Optimized, Built, Created, Integrated, Improved, Automated).
    - Ensure bullet points are impactful, quantifiable where possible, and highly relevant to the target role.
    
    Input Resume JSON:
    {json.dumps(resume_data, indent=2)}
    
    Output strictly the optimized resume data in the SAME JSON format as the input. 
    Only update the following fields if they exist:
    - summary (string)
    - experience (list of objects: update 'description')
    - projects (list of objects: update 'description')
    
    Do not wrap the output in markdown backticks, just the raw JSON object.
    """
    
    try:
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        start_idx = text_response.find('{')
        end_idx = text_response.rfind('}')
        if start_idx != -1 and end_idx != -1:
            json_str = text_response[start_idx:end_idx+1]
            result = json.loads(json_str)
            
            # Merge optimized fields back into the original resume data to avoid missing unchanged fields
            resume_data['summary'] = result.get('summary', resume_data.get('summary', ''))
            
            if 'experience' in result and 'experience' in resume_data:
                for i, exp in enumerate(result['experience']):
                    if i < len(resume_data['experience']):
                        resume_data['experience'][i]['description'] = exp.get('description', resume_data['experience'][i].get('description', ''))
                        
            if 'projects' in result and 'projects' in resume_data:
                for i, proj in enumerate(result['projects']):
                    if i < len(resume_data['projects']):
                        resume_data['projects'][i]['description'] = proj.get('description', resume_data['projects'][i].get('description', ''))
                        
            return resume_data
        else:
            raise ValueError("No JSON object found in optimization response")
    except Exception as e:
        print(f"Gemini API Error in Full Optimization: {e}")
        raise Exception("AI service temporarily unavailable. Try again later.")

def optimize_bullet_star(bullet_text):
    model = get_gemini_model()
    if not model: return {"original": bullet_text, "optimized": bullet_text, "error": "AI unavailable"}
    
    prompt = f"""
    Rewrite the following resume bullet point using the STAR method (Situation, Task, Action, Result) 
    and FAANG standard metrics. Make it extremely concise (1 line). 
    Do not invent numbers, but if metrics are implied, structure it professionally.
    Original: "{bullet_text}"
    
    Output ONLY the optimized bullet point string without quotes, lists, or extra text.
    """
    try:
        resp = model.generate_content(prompt)
        return {"original": bullet_text, "optimized": resp.text.strip().replace('"', '').replace('- ', '')}
    except Exception as e:
        print(e)
        return {"original": bullet_text, "optimized": bullet_text, "error": str(e)}

def enhance_action_verbs(bullet_text):
    model = get_gemini_model()
    if not model: return {"original": bullet_text, "optimized": bullet_text, "error": "AI unavailable"}
    
    prompt = f"""
    Replace weak verbs in this resume bullet (like "worked on", "helped", "did") 
    with strong, professional action verbs (like "Engineered", "Spearheaded", "Architected").
    Do not change the core meaning. Keep it concise.
    Original: "{bullet_text}"
    
    Output ONLY the enhanced bullet point string without quotes, lists, or extra text.
    """
    try:
        resp = model.generate_content(prompt)
        return {"original": bullet_text, "optimized": resp.text.strip().replace('"', '').replace('- ', '')}
    except Exception as e:
        print(e)
        return {"original": bullet_text, "optimized": bullet_text, "error": str(e)}

def check_grammar(text):
    model = get_gemini_model()
    if not model: return {"original": text, "optimized": text, "error": "AI unavailable"}
    
    prompt = f"""
    Fix any spelling, grammar, or punctuation errors in this resume text. 
    Ensure a highly professional tone. 
    Original: "{text}"
    
    Output ONLY the corrected text string without quotes, lists, or extra text.
    """
    try:
        resp = model.generate_content(prompt)
        return {"original": text, "optimized": resp.text.strip().replace('"', '')}
    except Exception as e:
        print(e)
        return {"original": text, "optimized": text, "error": str(e)}

