import os
import html
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def escape_xml(text):
    if not text:
        return ""
    return html.escape(str(text))

def resolve_static_file(project_root, relative_url):
    if not relative_url:
        return None
    rel_path = relative_url.lstrip("/")
    
    # Try VPS path: project_root/frontend/rel_path
    vps_path = os.path.join(project_root, "frontend", rel_path)
    if os.path.exists(vps_path):
        return vps_path
        
    # Try local public path: project_root/frontend/public/rel_path
    local_public_path = os.path.join(project_root, "frontend", "public", rel_path)
    if os.path.exists(local_public_path):
        return local_public_path
        
    # Try local out path: project_root/frontend/out/rel_path
    local_out_path = os.path.join(project_root, "frontend", "out", rel_path)
    if os.path.exists(local_out_path):
        return local_out_path

    # Try backend root path
    fallback_path = os.path.join(project_root, rel_path)
    if os.path.exists(fallback_path):
        return fallback_path
        
    return None

def generate_machinery_pdf(machine_name: str, brand: str, model: str, serial: str, current_hours: float, last_hours: float, limit_hours: float, company_name: str, output_path: str, photo_base64: str = None):
    # Escape user inputs to prevent XML/HTML parsing crashes in ReportLab Paragraphs
    machine_name = escape_xml(machine_name)
    brand = escape_xml(brand)
    model = escape_xml(model)
    serial = escape_xml(serial)
    company_name = escape_xml(company_name)

    # Ensure output folder exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    
    # Custom Styles for premium presentation
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
    
    warning_style = ParagraphStyle(
        'DocWarning',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#7f1d1d'),
        backColor=colors.HexColor('#fef2f2'),
        borderColor=colors.HexColor('#fecaca'),
        borderWidth=1,
        borderPadding=8,
        spaceBefore=8,
        spaceAfter=12,
        leading=13
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

    # Resolve project root and folders
    services_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.dirname(services_dir)
    backend_dir = os.path.dirname(app_dir)
    project_root = os.path.dirname(backend_dir)

    logo_path = resolve_static_file(project_root, "/logo/logo.png")

    # Header Layout with Logo (top left) and Document Title
    logo_flowable = None
    if logo_path and os.path.exists(logo_path):
        try:
            from reportlab.platypus import Image as RLImage
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
    
    # Alert or Success Banner Block
    overdue_hours = current_hours - last_hours
    excess_hours = overdue_hours - limit_hours
    is_overdue = overdue_hours >= limit_hours
    
    if is_overdue:
        warning_text = f"<b>CRITICAL MAINTENANCE WARNING:</b> This B2B asset has operated for <b>{overdue_hours:.1f} hours</b> since its last recorded maintenance. This exceeds the safety threshold of <b>{limit_hours:.1f} hours</b> by <b>{excess_hours:.1f} hours</b>. Immediate maintenance field inspection is required to avoid physical equipment degradation."
        story.append(Paragraph(warning_text, warning_style))
    else:
        remaining_hours = limit_hours - overdue_hours
        success_text = f"<b>SAFE OPERATING STATUS:</b> This B2B asset is operating within its normal service parameters. It has operated for <b>{overdue_hours:.1f} hours</b> since its last recorded maintenance, which is below the safety threshold of <b>{limit_hours:.1f} hours</b> (remaining safe operating time: <b>{remaining_hours:.1f} hours</b>)."
        story.append(Paragraph(success_text, success_style))
    
    # Metadata Table side-by-side with Photo
    story.append(Paragraph("Asset & Client Specifications", section_title))
    
    metadata_data = [
        [Paragraph("<b>Client Company:</b>", body_style), Paragraph(company_name, body_style)],
        [Paragraph("<b>Asset Name:</b>", body_style), Paragraph(machine_name, body_style)],
        [Paragraph("<b>Brand / Model:</b>", body_style), Paragraph(f"{brand} {model}", body_style)],
        [Paragraph("<b>Serial Number:</b>", body_style), Paragraph(serial, body_style)],
        [Paragraph("<b>Operating Hours:</b>", body_style), Paragraph(f"{current_hours:.1f} hrs", body_style)],
        [Paragraph("<b>Last Service Hours:</b>", body_style), Paragraph(f"{last_hours:.1f} hrs", body_style)],
        [Paragraph("<b>Safety Interval:</b>", body_style), Paragraph(f"{limit_hours:.1f} hrs", body_style)]
    ]
    meta_table = Table(metadata_data, colWidths=[100, 180])
    meta_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#f4f4f5')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))

    # Handle Photo Base64 decoding or Static Image File Paths
    temp_image_path = None
    img_flowable = None
    if photo_base64:
        if photo_base64.startswith("data:image/") or ";" in photo_base64 or "," in photo_base64:
            # It is a Base64 string!
            try:
                import base64
                if "," in photo_base64:
                    photo_base64 = photo_base64.split(",")[1]
                image_data = base64.b64decode(photo_base64)
                temp_image_path = os.path.abspath(os.path.join(os.path.dirname(output_path), f"temp_{serial}.png"))
                with open(temp_image_path, "wb") as fh:
                    fh.write(image_data)
                
                from reportlab.platypus import Image as RLImage
                img_flowable = RLImage(temp_image_path, width=220, height=130)
            except Exception as ex:
                print(f"[PDF GENERATOR] Error decoding image base64: {str(ex)}")
                temp_image_path = None
                img_flowable = Paragraph("<i>Image decoding error</i>", body_style)
        else:
            # It is a static image path (e.g. "/images/forklift.png")
            resolved_img_path = resolve_static_file(project_root, photo_base64)
            if resolved_img_path and os.path.exists(resolved_img_path):
                try:
                    from reportlab.platypus import Image as RLImage
                    img_flowable = RLImage(resolved_img_path, width=220, height=130)
                except Exception as ex:
                    print(f"[PDF GENERATOR] Error loading resolved static image: {str(ex)}")
                    img_flowable = Paragraph("<i>Image load error</i>", body_style)
            else:
                print(f"[PDF GENERATOR] Static image path not found: {photo_base64}")
                img_flowable = Paragraph("<font color='#a1a1aa'><i>Image not found</i></font>", body_style)
    else:
        img_flowable = Paragraph("<font color='#a1a1aa'><i>No image uploaded for this asset</i></font>", body_style)

    # Combine metadata and image in a side-by-side layout table
    layout_data = [[meta_table, img_flowable]]
    layout_table = Table(layout_data, colWidths=[290, 250])
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
    
    # Verification Checklist
    story.append(Paragraph("Required Verification Checklist Items (OSHA / ANSI Standards)", section_title))
    
    # Query checklists dynamically
    from app.core.database import SessionLocal
    from app.models.models import ChecklistTemplate, ChecklistItem, Company
    
    db = SessionLocal()
    dynamic_items = []
    try:
        company = db.query(Company).filter(Company.name == company_name).first()
        comp_id = company.id if company else None
        
        # Fetch templates
        templates = db.query(ChecklistTemplate).filter(
            (ChecklistTemplate.company_id == comp_id) | 
            (ChecklistTemplate.company_id == None)
        ).all()
        
        for t in templates:
            for item in t.items:
                dynamic_items.append((escape_xml(t.name), escape_xml(item.label), item.category))
    except Exception as ex:
        print(f"[PDF GENERATOR] Error loading dynamic checklists: {str(ex)}")
    finally:
        db.close()
        
    checklist_data = [
        [Paragraph("<b>Checklist Area</b>", body_style), Paragraph("<b>Target Sub-system</b>", body_style), Paragraph("<b>Verification Status</b>", body_style)]
    ]
    
    if dynamic_items:
        for area, label, category in dynamic_items:
            if is_overdue:
                status_text = "<font color='red'><b>OVERDUE (High wear risk)</b></font>" if category == "routine" else "<font color='orange'><b>Pending Field Check</b></font>"
            else:
                status_text = "<font color='green'><b>OPERATIONAL (Safe)</b></font>" if category == "routine" else "<font color='green'><b>ACTIVE (Safe status)</b></font>"
            checklist_data.append([
                Paragraph(area, body_style),
                Paragraph(label, body_style),
                Paragraph(status_text, body_style)
            ])
    else:
        # Fallback to defaults
        if is_overdue:
            checklist_data.extend([
                [Paragraph("Routine Services", body_style), Paragraph("Engine / Hydraulic Oil & Filter Replacement", body_style), Paragraph("<font color='red'><b>OVERDUE (High wear risk)</b></font>", body_style)],
                [Paragraph("Routine Services", body_style), Paragraph("Air Filter Replacement & Spark Plugs Inspect", body_style), Paragraph("<font color='red'><b>OVERDUE (Combustion risk)</b></font>", body_style)],
                [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Battery connections & charge level", body_style), Paragraph("<font color='orange'><b>Pending Field Check</b></font>", body_style)],
                [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Working Lights, Alarms & Horn check", body_style), Paragraph("<font color='orange'><b>Pending Field Check</b></font>", body_style)],
                [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Ignition System & Fuel Line check", body_style), Paragraph("<font color='orange'><b>Pending Field Check</b></font>", body_style)],
                [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Tires & structural integrity check", body_style), Paragraph("<font color='orange'><b>Pending Field Check</b></font>", body_style)]
            ])
        else:
            checklist_data.extend([
                [Paragraph("Routine Services", body_style), Paragraph("Engine / Hydraulic Oil & Filter Replacement", body_style), Paragraph("<font color='green'><b>OPERATIONAL (Safe)</b></font>", body_style)],
                [Paragraph("Routine Services", body_style), Paragraph("Air Filter Replacement & Spark Plugs Inspect", body_style), Paragraph("<font color='green'><b>OPERATIONAL (Safe)</b></font>", body_style)],
                [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Battery connections & charge level", body_style), Paragraph("<font color='green'><b>PASSED</b></font>", body_style)],
                [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Working Lights, Alarms & Horn check", body_style), Paragraph("<font color='green'><b>PASSED</b></font>", body_style)],
                [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Ignition System & Fuel Line check", body_style), Paragraph("<font color='green'><b>PASSED</b></font>", body_style)],
                [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Tires & structural integrity check", body_style), Paragraph("<font color='green'><b>PASSED</b></font>", body_style)]
            ])
    
    ct = Table(checklist_data, colWidths=[140, 260, 140])
    ct.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f4f4f5')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e4e4e7')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(ct)
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("Authorized digital report generated automatically by WillyFastSolutions Telemetry Worker Daemon. No physical signature required.", subtitle_style))
    
    doc.build(story)

    # Clean up temporary image file after build completes
    if temp_image_path and os.path.exists(temp_image_path):
        try:
            os.remove(temp_image_path)
        except Exception as e:
            print(f"[PDF GENERATOR] Error cleaning up temporary file: {str(e)}")
