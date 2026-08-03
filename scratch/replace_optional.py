import re
import os

def process_file(filepath):
    if not os.path.exists(filepath):
        return
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Pattern for lines like: document.getElementById('xyz')?.addEventListener('click', () => {
    # We will replace them one by one.
    
    pattern = r"document\.getElementById\(['\"]([^'\"]+)['\"]\)\?\.addEventListener\(['\"]([^'\"]+)['\"],\s*([\s\S]*?\}\)?);"
    
    # Actually, the replacement spans multiple lines because of the callback.
    # It's much simpler to just find the line and replace the prefix.
    # Wait, the closing bracket for addEventListener is many lines below.
    # We don't need to wrap the whole thing! We just declare the const and replace the call!
    
    # document.getElementById('xyz')?.addEventListener(...) 
    #   => 
    # const el_xyz = document.getElementById('xyz');
    # if (el_xyz) el_xyz.addEventListener(...)
    
    # Let's match JUST the start of the call:
    pattern2 = r"document\.getElementById\(['\"]([^'\"]+)['\"]\)\?\.addEventListener\("
    
    def repl(m):
        id_str = m.group(1)
        var_name = id_str.replace('-', '_') + '_el'
        # We need a block if we declare a const, so we don't pollute scope.
        # But wait, it's inside a function or event listener already?
        # A quick fix is just an IIFE or block:
        # return f"(() => {{ const {var_name} = document.getElementById('{id_str}'); if ({var_name}) {var_name}.addEventListener("
        # However, it's missing the closing `})})();` at the end!
        
        # A better way without touching the closing brace:
        # Instead of `document.getElementById('xyz')?.addEventListener`, 
        # we can do `(document.getElementById('xyz') || document.createElement('div')).addEventListener`
        # This is valid ES5, doesn't throw, does nothing if the element isn't found (attaches to detached div).
        # It's totally safe and requires NO block scoping or closing brace hunting!
        
        return f"(document.getElementById('{id_str}') || document.createElement('div')).addEventListener("

    new_content = re.sub(pattern2, repl, content)
    
    # We should also replace non-optional ones if they exist, but the user complained about syntax error ?.
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Processed {filepath}")

process_file("frontend/js/app.js")
process_file("frontend/js/builder.js")
