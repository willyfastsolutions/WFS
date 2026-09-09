import os
import base64
import tempfile
from fpdf import FPDF
from datetime import datetime

class DetailedReportPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.set_text_color(220, 38, 38) # Red title
        self.cell(0, 10, 'WillyFastSolutions - Detailed Maintenance Report', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_detailed_maintenance_pdf(
    machine,
    company_name,
    maintenance_log,
    checklist_results,
    mechanic_name,
    output_path
):
    pdf = DetailedReportPDF()
    pdf.add_page()
    
    # Machine Info
    pdf.set_font('Arial', 'B', 12)
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(0, 10, ' MACHINE & MAINTENANCE INFORMATION', 0, 1, 'L', 1)
    
    pdf.set_font('Arial', '', 11)
    pdf.cell(50, 8, 'Company:', 0, 0)
    pdf.cell(0, 8, str(company_name), 0, 1)
    pdf.cell(50, 8, 'Machine Asset:', 0, 0)
    pdf.cell(0, 8, f"{machine.brand or 'N/A'} {machine.model or 'N/A'} (SN: {machine.serial_number or 'N/A'})", 0, 1)
    pdf.cell(50, 8, 'Date Performed:', 0, 0)
    date_str = maintenance_log.performed_at.strftime("%Y-%m-%d %H:%M:%S") if maintenance_log.performed_at else "N/A"
    pdf.cell(0, 8, date_str, 0, 1)
    pdf.cell(50, 8, 'Hours at Maintenance:', 0, 0)
    pdf.cell(0, 8, f"{maintenance_log.hours_at_maintenance}h", 0, 1)
    pdf.cell(50, 8, 'Mechanic / Inspector:', 0, 0)
    pdf.cell(0, 8, str(mechanic_name), 0, 1)
    
    pdf.ln(5)
    
    # Checklist Results
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, ' DETAILED INSPECTION RESULTS', 0, 1, 'L', 1)
    pdf.ln(2)
    
    # Render each checklist item
    for res in checklist_results:
        item_label = res.item.label if res.item else "Unknown Item"
        item_category = res.item.category.capitalize() if res.item else "N/A"
        passed_str = "PASSED" if res.passed else "FAILED / PENDING"
        
        pdf.set_font('Arial', 'B', 10)
        pdf.cell(0, 6, f"[{item_category}] {item_label} - {passed_str}", 0, 1)
        
        if res.photo_data:
            # Decode base64 and save to temp file to embed in PDF
            try:
                # Remove data:image/png;base64, prefix if present
                img_data = res.photo_data
                if "," in img_data:
                    img_data = img_data.split(",")[1]
                
                img_bytes = base64.b64decode(img_data)
                
                # Check for image type signature (JPEG or PNG)
                ext = ".png"
                if img_bytes.startswith(b"\\xff\\xd8"):
                    ext = ".jpg"
                    
                with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_img:
                    tmp_img.write(img_bytes)
                    tmp_img_path = tmp_img.name
                    
                pdf.image(tmp_img_path, x=15, w=80)
                pdf.ln(5)
                os.unlink(tmp_img_path)
            except Exception as e:
                pdf.set_font('Arial', 'I', 9)
                pdf.set_text_color(200, 0, 0)
                pdf.cell(0, 6, f"  * Could not load photo evidence: {str(e)}", 0, 1)
                pdf.set_text_color(0, 0, 0)
        else:
            pdf.set_font('Arial', 'I', 9)
            pdf.set_text_color(100, 100, 100)
            pdf.cell(0, 6, "  * No photographic evidence provided.", 0, 1)
            pdf.set_text_color(0, 0, 0)
            pdf.ln(2)
            
    pdf.ln(5)
    
    # Notes
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, ' ADDITIONAL NOTES & RECOMMENDATIONS', 0, 1, 'L', 1)
    pdf.set_font('Arial', '', 10)
    notes = maintenance_log.notes if maintenance_log.notes else "No additional notes."
    pdf.multi_cell(0, 6, notes)
    
    pdf.output(output_path)
    return output_path
