import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_machinery_pdf(machine_name: str, brand: str, model: str, serial: str, current_hours: float, last_hours: float, limit_hours: float, company_name: str, output_path: str):
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

    # Document Title Header
    story.append(Paragraph("WillyFastSolutions Telemetry Audit", title_style))
    story.append(Paragraph("AUTOMATED FLEET PREVENTIVE MAINTENANCE WARNING REPORT", subtitle_style))
    
    # Alert Banner Block
    overdue_hours = current_hours - last_hours
    excess_hours = overdue_hours - limit_hours
    warning_text = f"<b>CRITICAL MAINTENANCE WARNING:</b> This B2B asset has operated for <b>{overdue_hours:.1f} hours</b> since its last recorded maintenance. This exceeds the safety threshold of <b>{limit_hours:.1f} hours</b> by <b>{excess_hours:.1f} hours</b>. Immediate maintenance field inspection is required to avoid physical equipment degradation."
    story.append(Paragraph(warning_text, warning_style))
    
    # Metadata Table
    story.append(Paragraph("Asset & Client Specifications", section_title))
    data = [
        [Paragraph("<b>Client Company:</b>", body_style), Paragraph(company_name, body_style), Paragraph("<b>Date Generated:</b>", body_style), Paragraph(datetime.now().strftime('%Y-%m-%d %H:%M:%S'), body_style)],
        [Paragraph("<b>Asset Name:</b>", body_style), Paragraph(machine_name, body_style), Paragraph("<b>Brand / Model:</b>", body_style), Paragraph(f"{brand} {model}", body_style)],
        [Paragraph("<b>Serial Number:</b>", body_style), Paragraph(serial, body_style), Paragraph("<b>Operating Hours:</b>", body_style), Paragraph(f"{current_hours:.1f} hrs", body_style)],
        [Paragraph("<b>Last Service Hours:</b>", body_style), Paragraph(f"{last_hours:.1f} hrs", body_style), Paragraph("<b>Safety Interval:</b>", body_style), Paragraph(f"{limit_hours:.1f} hrs", body_style)]
    ]
    
    t = Table(data, colWidths=[110, 160, 110, 160])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#f4f4f5')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t)
    
    story.append(Spacer(1, 10))
    
    # Verification Checklist
    story.append(Paragraph("Required Verification Checklist Items (OSHA / ANSI Standards)", section_title))
    
    checklist_data = [
        [Paragraph("<b>Checklist Area</b>", body_style), Paragraph("<b>Target Sub-system</b>", body_style), Paragraph("<b>Verification Status</b>", body_style)],
        [Paragraph("Routine Services", body_style), Paragraph("Engine / Hydraulic Oil & Filter Replacement", body_style), Paragraph("<font color='red'><b>OVERDUE (High wear risk)</b></font>", body_style)],
        [Paragraph("Routine Services", body_style), Paragraph("Air Filter Replacement & Spark Plugs Inspect", body_style), Paragraph("<font color='red'><b>OVERDUE (Combustion risk)</b></font>", body_style)],
        [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Battery connections & charge level", body_style), Paragraph("<font color='orange'><b>Pending Field Check</b></font>", body_style)],
        [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Working Lights, Alarms & Horn check", body_style), Paragraph("<font color='orange'><b>Pending Field Check</b></font>", body_style)],
        [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Ignition System & Fuel Line check", body_style), Paragraph("<font color='orange'><b>Pending Field Check</b></font>", body_style)],
        [Paragraph("Safety Check (OSHA)", body_style), Paragraph("Tires & structural integrity check", body_style), Paragraph("<font color='orange'><b>Pending Field Check</b></font>", body_style)]
    ]
    
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
