import os
import base64
import sys

# Add the backend directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.pdf_generator import generate_machinery_pdf

def main():
    print("Generating sample PDF warning report...")
    
    # Paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    logo_path = os.path.join(project_root, "logo", "logo.png")
    output_pdf_path = os.path.join(current_dir, "reports", "sample_overdue_report.pdf")
    
    # Base64 encode the logo image to simulate the machine photo
    photo_b64 = None
    if os.path.exists(logo_path):
        print(f"Reading image from {logo_path} to simulate machine photo...")
        with open(logo_path, "rb") as image_file:
            photo_b64 = base64.b64encode(image_file.read()).decode('utf-8')
            # Add PNG prefix
            photo_b64 = f"data:image/png;base64,{photo_b64}"
    else:
        print(f"Warning: Logo not found at {logo_path}, generating PDF without photo.")
        
    # Generate the PDF
    generate_machinery_pdf(
        machine_name="Apex Forklift 1",
        brand="Toyota",
        model="8FGU25",
        serial="SN-TOY-100234",
        current_hours=268.5,
        last_hours=0.0,
        limit_hours=250.0,
        company_name="Apex Logistics Corp",
        output_path=output_pdf_path,
        photo_base64=photo_b64
    )
    
    print(f"Sample PDF report successfully generated at:\n{output_pdf_path}")

if __name__ == "__main__":
    main()
