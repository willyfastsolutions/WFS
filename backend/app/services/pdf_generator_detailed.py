import os
import html
import base64
import tempfile
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def escape_xml(text):
    if not text:
        return ""
    return html.escape(str(text))

def resolve_static_file(project_root, relative_url):
    if not relative_url:
        return None
    rel_path = relative_url.lstrip("/")
    vps_path = os.path.join(project_root, "frontend", rel_path)
    if os.path.exists(vps_path): return vps_path
    local_public_path = os.path.join(project_root, "frontend", "public", rel_path)
    if os.path.exists(local_public_path): return local_public_path
    local_out_path = os.path.join(project_root, "frontend", "out", rel_path)
    if os.path.exists(local_out_path): return local_out_path
    fallback_path = os.path.join(project_root, rel_path)
    if os.path.exists(fallback_path): return fallback_path
    return None

def generate_detailed_maintenance_pdf(
    machine,
    company_name,
    maintenance_log,
    checklist_results,
    mechanic_name,
    output_path
):
    # Escape inputs
    machine_name = escape_xml(machine.name) if getattr(machine, "name", None) else ""
    brand = escape_xml(machine.brand)
    model = escape_xml(machine.model)
    serial = escape_xml(machine.serial_number)
    company_name = escape_xml(company_name)
    mechanic_name = escape_xml(mechanic_name)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#09090b'),
        spaceAfter=2
    )
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#71717a'),
        spaceAfter=15
    )
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=colors.HexColor('#09090b'),
        spaceBefore=15,
        spaceAfter=10
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#27272a'),
        leading=14
    )
    alert_box_style = ParagraphStyle(
        'AlertBox',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#064e3b'), # Emerald 900
        leading=14
    )

    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    logo_path = resolve_static_file(project_root, "/logo/logo.png")
    
    # Header layout
    header_data = []
    if logo_path and os.path.exists(logo_path):
        header_data.append([
            RLImage(logo_path, width=80, height=80),
            [
                Paragraph("WillyFastSolutions Telemetry Audit", title_style),
                Paragraph("DETAILED MAINTENANCE & FIELD SERVICE REPORT", subtitle_style)
            ]
        ])
    else:
        header_data.append([
            [
                Paragraph("WillyFastSolutions Telemetry Audit", title_style),
                Paragraph("DETAILED MAINTENANCE & FIELD SERVICE REPORT", subtitle_style)
            ], ""
        ])
        
    header_table = Table(header_data, colWidths=[90, 450])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (0,0), 'LEFT'),
        ('ALIGN', (1,0), (1,0), 'LEFT'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    
    # Alert Box (Safe)
    status_text = f"<b>MAINTENANCE COMPLETED:</b> The asset was serviced successfully at <b>{maintenance_log.hours_at_maintenance} hours</b>. Operating normally and safe for deployment."
    alert_box = Table([[Paragraph(status_text, alert_box_style)]], colWidths=[540])
    alert_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ecfdf5')), # Emerald 50
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#a7f3d0')),      # Emerald 200
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(alert_box)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("Asset & Client Specifications", section_title))
    
    # Metadata
    date_str = maintenance_log.performed_at.strftime("%Y-%m-%d %H:%M:%S") if maintenance_log.performed_at else "N/A"
    meta_data = [
        [Paragraph("<b>Client Company:</b>", body_style), Paragraph(company_name, body_style)],
        [Paragraph("<b>Asset Name:</b>", body_style), Paragraph(machine_name, body_style)],
        [Paragraph("<b>Brand / Model:</b>", body_style), Paragraph(f"{brand} {model}", body_style)],
        [Paragraph("<b>Serial Number:</b>", body_style), Paragraph(serial, body_style)],
        [Paragraph("<b>Service Date:</b>", body_style), Paragraph(date_str, body_style)],
        [Paragraph("<b>Service Hours:</b>", body_style), Paragraph(f"{maintenance_log.hours_at_maintenance} hrs", body_style)],
        [Paragraph("<b>Inspector:</b>", body_style), Paragraph(mechanic_name, body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[130, 160])
    meta_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#f4f4f5')),
    ]))

    # Machine photo
    photo_base64 = machine.photo if hasattr(machine, 'photo') else None
    temp_image_path = None
    img_flowable = None
    if photo_base64:
        if photo_base64.startswith("data:image/") or ";" in photo_base64 or "," in photo_base64:
            try:
                if "," in photo_base64: photo_base64 = photo_base64.split(",")[1]
                image_data = base64.b64decode(photo_base64)
                temp_image_path = os.path.abspath(os.path.join(os.path.dirname(output_path), f"temp_{serial}.png"))
                with open(temp_image_path, "wb") as fh: fh.write(image_data)
                img_flowable = RLImage(temp_image_path, width=220, height=130)
            except Exception:
                temp_image_path = None
                img_flowable = Paragraph("<i>Image decoding error</i>", body_style)
        else:
            resolved_img_path = resolve_static_file(project_root, photo_base64)
            if resolved_img_path and os.path.exists(resolved_img_path):
                img_flowable = RLImage(resolved_img_path, width=220, height=130)
            else:
                img_flowable = Paragraph("<font color='#a1a1aa'><i>Image not found</i></font>", body_style)
    else:
        img_flowable = Paragraph("<font color='#a1a1aa'><i>No image uploaded for this asset</i></font>", body_style)

    layout_table = Table([[meta_table, img_flowable]], colWidths=[290, 250])
    layout_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'CENTER'),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#fafafa')),
        ('GRID', (1,0), (1,0), 0.5, colors.HexColor('#e4e4e7')),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(layout_table)
    story.append(Spacer(1, 10))
    
    # Detailed Checklist Results
    story.append(Paragraph("Detailed Inspection Results & Photographic Evidence", section_title))
    
    # Keep track of temporary files to clean up
    temp_files = []
    if temp_image_path: temp_files.append(temp_image_path)
    
    for res in checklist_results:
        item_label = escape_xml(res.item.label) if res.item else "Unknown Item"
        item_category = escape_xml(res.item.category.capitalize()) if res.item else "N/A"
        
        status_color = "green" if res.passed else "red"
        status_text = "PASSED / COMPLETED" if res.passed else "FAILED / PENDING"
        
        item_title = f"<b>[{item_category}]</b> {item_label} - <font color='{status_color}'><b>{status_text}</b></font>"
        story.append(Paragraph(item_title, body_style))
        
        if getattr(res, 'photo_data', None):
            try:
                img_data = res.photo_data
                if "," in img_data: img_data = img_data.split(",")[1]
                img_bytes = base64.b64decode(img_data)
                ext = ".png"
                if img_bytes.startswith(b"\xff\xd8"): ext = ".jpg"
                
                with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_img:
                    tmp_img.write(img_bytes)
                    tmp_img_path = tmp_img.name
                    temp_files.append(tmp_img_path)
                    
                story.append(Spacer(1, 5))
                story.append(RLImage(tmp_img_path, width=150, height=100))
                story.append(Spacer(1, 10))
            except Exception as e:
                story.append(Paragraph(f"<i><font color='red'>Could not load photo evidence</font></i>", body_style))
        else:
            story.append(Paragraph("<font color='#a1a1aa'><i>No photo evidence attached.</i></font>", body_style))
            story.append(Spacer(1, 10))
            
    story.append(Spacer(1, 10))
    
    # Notes
    story.append(Paragraph("Additional Notes & Recommendations", section_title))
    notes = escape_xml(maintenance_log.notes) if maintenance_log.notes else "No additional notes."
    story.append(Paragraph(notes, body_style))
    
    doc.build(story)
    
    for tf in temp_files:
        try:
            if os.path.exists(tf): os.remove(tf)
        except:
            pass
            
    return output_path
