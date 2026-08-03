from flask import Blueprint, request, jsonify
from services.ai_service import enhance_text, analyze_ats, optimize_full_resume, optimize_bullet_star, enhance_action_verbs, check_grammar
from services.export_service import generate_pdf, generate_docx

api_bp = Blueprint('api', __name__)

@api_bp.route('/enhance', methods=['POST'])
def enhance():
    print("Enhance endpoint called")
    data = request.json
    text = data.get('text', '')
    context = data.get('context', 'general') # e.g. 'summary', 'experience', 'project'
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
        
    try:
        enhanced = enhance_text(text, context)
        return jsonify({"original": text, "enhanced": enhanced}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/ats-score', methods=['POST'])
def ats_score():
    print("ATS endpoint called")
    data = request.json
    resume_data = data.get('resume_data', {})
    job_description = data.get('job_description', '')
    
    if not job_description:
        return jsonify({"error": "No job description provided"}), 400
        
    try:
        result = analyze_ats(resume_data, job_description)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/optimize-resume', methods=['POST'])
def optimize_resume():
    print("Optimize endpoint called")
    data = request.json
    resume_data = data.get('resume_data', {})
    target_role = data.get('target_role', '')
    
    if not resume_data or not target_role:
        return jsonify({"error": "Resume data and target role are required"}), 400
        
    try:
        result = optimize_full_resume(resume_data, target_role)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/optimize-star', methods=['POST'])
def optimize_star():
    data = request.json
    text = data.get('text', '')
    if not text: return jsonify({"error": "No text provided"}), 400
    return jsonify(optimize_bullet_star(text)), 200

@api_bp.route('/enhance-verbs', methods=['POST'])
def optimize_verbs():
    data = request.json
    text = data.get('text', '')
    if not text: return jsonify({"error": "No text provided"}), 400
    return jsonify(enhance_action_verbs(text)), 200

@api_bp.route('/check-grammar', methods=['POST'])
def grammar_check():
    data = request.json
    text = data.get('text', '')
    if not text: return jsonify({"error": "No text provided"}), 400
    return jsonify(check_grammar(text)), 200

@api_bp.route('/export/pdf', methods=['POST'])
def export_pdf():
    print("PDF endpoint called")
        
    data = request.json
    html_content = data.get('html_content', '')
    
    if not html_content:
        return jsonify({"error": "No HTML content provided"}), 400
        
    try:
        pdf_path = generate_pdf(html_content)
        from flask import send_file
        return send_file(pdf_path, as_attachment=True, download_name="resume.pdf", mimetype='application/pdf')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/export/docx', methods=['POST'])
def export_docx():
    print("DOCX endpoint called")
        
    data = request.json
    resume_data = data.get('resume_data', {})
    
    try:
        docx_path = generate_docx(resume_data)
        from flask import send_file
        return send_file(docx_path, as_attachment=True, download_name="resume.docx", mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    except Exception as e:
        return jsonify({"error": str(e)}), 500
