import re
import os

with open('Testing/admin.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for ### Testing/src/... followed by code block
pattern = r'### Testing/(.*?)\n```.*?\n(.*?)\n```'
matches = re.findall(pattern, content, re.DOTALL)

for filepath, code in matches:
    # Skip non-admin files if any
    if 'src/app/admin/' not in filepath and 'src/components/AdminLayout.tsx' not in filepath:
        continue
    
    # Check if it was in a subfolder originally (it wasn't)
    # The filepath in admin.md is src/app/admin/users/page.tsx etc.
    full_path = os.path.join('Testing', filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(code.strip() + '\n')
    print(f"Restored {full_path}")
