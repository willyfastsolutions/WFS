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
    brand = escape_xml(machine.brand) if getattr(machine, "brand", None) else ""
    model = escape_xml(machine.model) if getattr(machine, "model", None) else ""
    serial = escape_xml(machine.serial_number) if getattr(machine, "serial_number", None) else "SN-N/A"
    company_name = escape_xml(company_name)
    mechanic_name = escape_xml(mechanic_name)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#09090b'),
        spaceAfter=4,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#71717a'),
        spaceAfter=15
    )
    
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=colors.HexColor('#18181b'),
        spaceBefore=10,
        spaceAfter=6,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=8.5,
        textColor=colors.HexColor('#27272a'),
        leading=12
    )
    
    success_style = ParagraphStyle(
        'DocSuccess',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#14532d'),
        backColor=colors.HexColor('#f0fdf4'),
        borderColor=colors.HexColor('#bbf7d0'),
        borderWidth=1,
        borderPadding=8,
        spaceBefore=8,
        spaceAfter=12,
        leading=13
    )

    # Resolve project root
    services_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.dirname(services_dir)
    backend_dir = os.path.dirname(app_dir)
    project_root = os.path.dirname(backend_dir)

    logo_path = resolve_static_file(project_root, "/logo/logo.png")
    
    # Header Layout with exact 42x42 Logo matching original design
    logo_flowable = None
    if logo_path and os.path.exists(logo_path):
        try:
            logo_flowable = RLImage(logo_path, width=42, height=42)
        except Exception as ex:
            print(f"[PDF GENERATOR] Error loading logo: {str(ex)}")

    title_block = [
        Paragraph("WillyFastSolutions Telemetry Audit", title_style),
        Paragraph("AUTOMATED FLEET PREVENTIVE MAINTENANCE WARNING REPORT", subtitle_style)
    ]

    if logo_flowable:
        header_table = Table([[logo_flowable, title_block]], colWidths=[52, 488])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('LEFTPADDING', (1,0), (1,0), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 10))
    else:
        story.append(Paragraph("WillyFastSolutions Telemetry Audit", title_style))
        story.append(Paragraph("AUTOMATED FLEET PREVENTIVE MAINTENANCE WARNING REPORT", subtitle_style))
    
    # Alert Box (Safe)
    status_text = f"<b>SAFE OPERATING STATUS:</b> This B2B asset is operating within its normal service parameters. Maintenance completed at <b>{maintenance_log.hours_at_maintenance:.1f} hours</b>. Inspection passed and certified for deployment."
    story.append(Paragraph(status_text, success_style))
    
    story.append(Paragraph("Asset & Client Specifications", section_title))
    
    # Metadata Table
    date_str = maintenance_log.performed_at.strftime("%Y-%m-%d %H:%M:%S") if getattr(maintenance_log, 'performed_at', None) else "N/A"
    meta_data = [
        [Paragraph("<b>Client Company:</b>", body_style), Paragraph(company_name, body_style)],
        [Paragraph("<b>Asset Name:</b>", body_style), Paragraph(machine_name, body_style)],
        [Paragraph("<b>Brand / Model:</b>", body_style), Paragraph(f"{brand} {model}".strip(), body_style)],
        [Paragraph("<b>Serial Number:</b>", body_style), Paragraph(serial, body_style)],
        [Paragraph("<b>Service Date:</b>", body_style), Paragraph(date_str, body_style)],
        [Paragraph("<b>Service Hours:</b>", body_style), Paragraph(f"{maintenance_log.hours_at_maintenance:.1f} hrs", body_style)],
        [Paragraph("<b>Inspector:</b>", body_style), Paragraph(mechanic_name, body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[100, 180])
    meta_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#f4f4f5')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))

    # Machine photo (side by side with metadata)
    photo_raw = getattr(machine, 'photo', None)
    temp_files = []
    img_flowable = None
    
    if photo_raw:
        if photo_raw.startswith("data:image/") or ";" in photo_raw or "," in photo_raw:
            try:
                base64_str = photo_raw.split(",")[1] if "," in photo_raw else photo_raw
                img_bytes = base64.b64decode(base64_str)
                with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tf:
                    tf.write(img_bytes)
                    temp_img_path = tf.name
                    temp_files.append(temp_img_path)
                img_flowable = RLImage(temp_img_path, width=220, height=130)
            except Exception as ex:
                print(f"[PDF] Machine image base64 error: {ex}")
                img_flowable = Paragraph("<i>Image decoding error</i>", body_style)
        else:
            resolved = resolve_static_file(project_root, photo_raw)
            if resolved and os.path.exists(resolved):
                img_flowable = RLImage(resolved, width=220, height=130)
            else:
                img_flowable = Paragraph("<font color='#a1a1aa'><i>No image found</i></font>", body_style)
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
    
    # Detailed Checklist Results & Photographic Evidence
    story.append(Paragraph("Detailed Inspection Results & Photographic Evidence", section_title))
    
    if checklist_results:
        for res in checklist_results:
            item_label = escape_xml(res.item.label) if getattr(res, 'item', None) else "Inspection Item"
            item_category = escape_xml(res.item.category.capitalize()) if getattr(res, 'item', None) and getattr(res.item, 'category', None) else "Routine"
            
            status_color = "#16a34a" if res.passed else "#dc2626"
            status_text = "PASSED / COMPLETED" if res.passed else "FAILED / PENDING"
            
            item_header = f"<b>[{item_category}]</b> {item_label} — <font color='{status_color}'><b>{status_text}</b></font>"
            story.append(Paragraph(item_header, body_style))
            
            photo_data = getattr(res, 'photo_data', None)
            if photo_data:
                try:
                    p_base64 = photo_data.split(",")[1] if "," in photo_data else photo_data
                    p_bytes = base64.b64decode(p_base64)
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tf_item:
                        tf_item.write(p_bytes)
                        item_img_path = tf_item.name
                        temp_files.append(item_img_path)
                    story.append(Spacer(1, 4))
                    story.append(RLImage(item_img_path, width=180, height=120))
                    story.append(Spacer(1, 6))
                except Exception as p_err:
                    print(f"[PDF] Checklist item photo error: {p_err}")
                    story.append(Paragraph("<i><font color='red'>Could not render photo evidence</font></i>", body_style))
            else:
                story.append(Paragraph("<font color='#a1a1aa'><i>No photo evidence attached.</i></font>", body_style))
                story.append(Spacer(1, 4))
    else:
        story.append(Paragraph("<i>No individual checklist results recorded for this log.</i>", body_style))
        
    story.append(Spacer(1, 10))
    
    # Notes & Recommendations
    story.append(Paragraph("Inspector Notes & Operational Remarks", section_title))
    notes = escape_xml(maintenance_log.notes) if getattr(maintenance_log, 'notes', None) else "No additional notes provided."
    story.append(Paragraph(notes, body_style))
    
    story.append(Spacer(1, 15))
    story.append(Paragraph("Authorized digital maintenance certificate generated by WillyFastSolutions Fleet Telemetry System.", subtitle_style))
    
    doc.build(story)
    
    # Clean up temporary files safely
    for tf in temp_files:
        try:
            if os.path.exists(tf):
                os.remove(tf)
        except Exception:
            pass
            
    return output_path
