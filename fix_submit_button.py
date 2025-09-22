#!/usr/bin/env python3
import re

# Read the file
with open(r'c:\Users\laptop solutions\Desktop\eyewearr\src\pages\AdminPage.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Step 1: Remove the existing submit button from inside the form
# Look for the pattern and remove it
submit_button_pattern = r'\s*<SubmitButton type="submit" disabled=\{isLoading\}>\s*\{isLoading \? \'Adding Product\.\.\.\' : \'Add Product\'\}\s*</SubmitButton>'
content = re.sub(submit_button_pattern, '', content, flags=re.DOTALL)

# Step 2: Find the first Product Gallery section end and add the submit button after ProductFormLayout
# Look for the pattern where ProductFormLayout closes after the first Product Gallery
pattern = r'(</SidebarSection>\s*</ProductFormSidebar>\s*</ProductFormLayout>)(\s*</ProductFormContainer>)'

replacement = r'''\1
                    
                    {/* Submit button positioned after Product Gallery */}
                    <SubmitButton 
                      type="button" 
                      disabled={isLoading}
                      onClick={(e) => {
                        e.preventDefault();
                        const form = document.querySelector('form');
                        if (form) {
                          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                          form.dispatchEvent(submitEvent);
                        }
                      }}
                    >
                      {isLoading ? 'Adding Product...' : 'Add Product'}
                    </SubmitButton>\2'''

# Apply the replacement only to the first occurrence (add-product section)
content = re.sub(pattern, replacement, content, count=1, flags=re.DOTALL)

# Write the file back
with open(r'c:\Users\laptop solutions\Desktop\eyewearr\src\pages\AdminPage.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully moved the submit button to after the Product Gallery section!")
