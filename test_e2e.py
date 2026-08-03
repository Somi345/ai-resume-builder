import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.ai_service import analyze_ats

job_description = "We are looking for a Software Engineer with experience in Python, JavaScript, React, and SQL. Must have experience building REST APIs and working with databases."

weak_resume = {
    "summary": "I want a job",
    "skills": ["HTML", "CSS"],
    "experience": [{"title": "Web Developer", "description": "I made a website"}],
    "education": [],
    "projects": []
}

average_resume = {
    "summary": "Software developer looking for opportunities.",
    "skills": ["Python", "HTML", "CSS", "JavaScript"],
    "experience": [{"title": "Junior Developer", "description": "Developed web pages and helped with database."}],
    "internships": [{"title": "Frontend Intern", "company": "StartUp", "description": "Built UI components in React."}],
    "education": [{"degree": "B.S."}],
    "projects": [{"title": "Portfolio", "description": "My portfolio website."}]
}

good_fresher = {
    "summary": "Motivated computer science graduate with strong skills in Python and JavaScript. Looking to build scalable web applications.",
    "skills": ["Python", "JavaScript", "React", "SQL", "HTML", "CSS"],
    "experience": [{"title": "Intern", "company": "Tech Corp", "description": "Developed REST APIs using Python and Flask. Improved database performance by 20%."}],
    "education": [{"degree": "B.S. Computer Science", "school": "University"}],
    "projects": [{"title": "E-Commerce", "technologies": "React, Node", "description": "Built full-stack e-commerce app with authentication."}]
}

excellent_resume = {
    "fullName": "John Doe",
    "email": "test@test.com",
    "phone": "123",
    "location": "NY",
    "targetJob": "Senior Software Engineer",
    "summary": "Senior Software Engineer with 5+ years of experience in Python, JavaScript, and React. Proven track record of designing scalable REST APIs and optimizing SQL databases.",
    "skills": ["Python", "JavaScript", "React", "SQL", "REST APIs", "Databases", "Docker", "AWS"],
    "experience": [
        {
            "title": "Software Engineer",
            "company": "Google",
            "startDate": "2020",
            "endDate": "Present",
            "description": "Developed scalable REST APIs using Python and Flask, serving 1M+ requests per day.\nOptimized SQL queries, reducing load times by 40%.\nLed a team of 3 engineers to migrate legacy JavaScript to React."
        },
        {
            "title": "Junior Developer",
            "company": "Amazon",
            "description": "Designed microservices in Python. Increased throughput by 25%."
        }
    ],
    "education": [{"degree": "M.S. Computer Science", "school": "MIT", "year": "2019"}],
    "projects": [
        {
            "title": "Cloud Manager",
            "technologies": "Python, AWS",
            "description": "Built automated infrastructure management tool.\nReduced server costs by 30%."
        },
        {
            "title": "Analytics Dashboard",
            "description": "Created a real-time data visualization app using React and SQL."
        }
    ],
    "certifications": ["AWS Certified Developer"],
    "codingProfiles": [{"platform": "LeetCode", "link": "link"}]
}

print("--- ATS SCORING E2E TEST ---")
print(f"Weak Resume Score: {analyze_ats(weak_resume, job_description).get('score')}")
print(f"Average Resume Score: {analyze_ats(average_resume, job_description).get('score')}")
print(f"Good Fresher Score: {analyze_ats(good_fresher, job_description).get('score')}")
print(f"Excellent Resume Score: {analyze_ats(excellent_resume, job_description).get('score')}")