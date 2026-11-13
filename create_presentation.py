import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_eventhub_deck():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Theme colors
    COLOR_BG = RGBColor(15, 23, 42)       # Slate 900
    COLOR_CARD = RGBColor(30, 41, 59)     # Slate 800
    COLOR_BORDER = RGBColor(51, 65, 85)   # Slate 700
    COLOR_SKY = RGBColor(14, 165, 233)    # Sky 500
    COLOR_SKY_LIGHT = RGBColor(56, 189, 248) # Sky 400
    COLOR_WHITE = RGBColor(248, 250, 252) # Slate 50
    COLOR_MUTED = RGBColor(148, 163, 184) # Slate 400
    COLOR_GREEN = RGBColor(52, 211, 153)  # Emerald 400
    COLOR_RED = RGBColor(248, 113, 113)   # Red 400

    def set_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, tag_text, title_text):
        # Tag
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        p = tb.text_frame.paragraphs[0]
        p.text = tag_text.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = COLOR_SKY
        p.font.name = "Arial"

        # Title
        tb2 = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.8))
        p2 = tb2.text_frame.paragraphs[0]
        p2.text = title_text
        p2.font.size = Pt(28)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_WHITE
        p2.font.name = "Arial"

    # ==================== SLIDE 1: Title ====================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)

    # Accent pill
    tag = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.5), Inches(1.2), Inches(4.333), Inches(0.45))
    tag.fill.solid()
    tag.fill.fore_color.rgb = RGBColor(14, 165, 233)
    tag.line.fill.background()
    tp = tag.text_frame.paragraphs[0]
    tp.text = "✨ FULL-STACK VIVA & SYSTEM DESIGN"
    tp.font.size = Pt(11)
    tp.font.bold = True
    tp.font.color.rgb = COLOR_WHITE
    tp.alignment = PP_ALIGN.CENTER

    # Main Title
    tb = s1.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(11.333), Inches(1.4))
    p = tb.text_frame.paragraphs[0]
    p.text = "EventHub"
    p.font.size = Pt(56)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE
    p.alignment = PP_ALIGN.CENTER
    p.font.name = "Arial"

    # Subtitle
    tb_sub = s1.shapes.add_textbox(Inches(1.5), Inches(3.2), Inches(10.333), Inches(0.8))
    p_sub = tb_sub.text_frame.paragraphs[0]
    p_sub.text = "A Serverless, Zero-Friction Event Management & Live QR Ticketing Platform"
    p_sub.font.size = Pt(20)
    p_sub.font.color.rgb = COLOR_SKY_LIGHT
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.font.name = "Arial"

    # 4 Meta Badges
    specs = [
        ("FRONTEND", "React 18 + Vite (Tailwind CSS)"),
        ("BACKEND", "FastAPI (Python 3.12 ASGI)"),
        ("DATABASE", "Supabase PostgreSQL (PgBouncer)"),
        ("HOSTING", "100% Serverless on Vercel ($0 Cost)")
    ]
    for i, (label, val) in enumerate(specs):
        x = Inches(1.2 + i * 2.8)
        card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(4.3), Inches(2.55), Inches(1.1))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD
        card.line.color.rgb = COLOR_BORDER
        card.line.width = Pt(1)
        cp1 = card.text_frame.paragraphs[0]
        cp1.text = label
        cp1.font.size = Pt(10)
        cp1.font.bold = True
        cp1.font.color.rgb = COLOR_SKY
        cp2 = card.text_frame.add_paragraph()
        cp2.text = val
        cp2.font.size = Pt(11)
        cp2.font.color.rgb = COLOR_WHITE

    # Production URL Banner
    url_box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.5), Inches(5.8), Inches(8.333), Inches(0.6))
    url_box.fill.solid()
    url_box.fill.fore_color.rgb = RGBColor(6, 78, 59)
    url_box.line.color.rgb = COLOR_GREEN
    up = url_box.text_frame.paragraphs[0]
    up.text = "🟢 Live Production: https://eventhub-delta-two.vercel.app  •  API Docs: /docs"
    up.font.size = Pt(12)
    up.font.bold = True
    up.font.color.rgb = COLOR_GREEN
    up.alignment = PP_ALIGN.CENTER

    s1.notes_slide.notes_text_frame.text = (
        "Respected examiners, good morning. Today I am proud to present EventHub—a modern, full-stack event "
        "management and real-time ticketing platform. EventHub was built from the ground up to solve two fundamental "
        "problems: attendee registration friction and expensive server infrastructure. The entire application is deployed "
        "live in production on Vercel without requiring any persistent paid servers, running completely serverless with "
        "enterprise-grade PostgreSQL, dynamic custom form schemas, automated email pass delivery, and live camera-based QR door verification."
    )

    # ==================== SLIDE 2: Problem vs Solution ====================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_header(s2, "Why EventHub?", "Problem Statement vs. Our Architectural Solution")

    # Left: Problems
    p_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9))
    p_box.fill.solid()
    p_box.fill.fore_color.rgb = RGBColor(69, 10, 10)
    p_box.line.color.rgb = COLOR_RED
    pt = p_box.text_frame
    p0 = pt.paragraphs[0]
    p0.text = "❌  THE INDUSTRY FRICTION"
    p0.font.bold = True
    p0.font.size = Pt(14)
    p0.font.color.rgb = COLOR_RED

    problems = [
        ("Mandatory Sign-Up Wall", "Forcing casual attendees to create passwords and verify accounts leads to >40% checkout abandonment."),
        ("Expensive 24/7 Hosting", "Traditional servers (AWS EC2, Railway, Render) cost money every month even when zero events are active."),
        ("Slow Gate Check-Ins & Fraud", "Manual paper guest lists and static PDFs cause long bottlenecks and allow duplicate pass sharing."),
        ("Rigid Registration Forms", "Asking custom questions (T-shirt, Roll Number) requires cumbersome database migrations.")
    ]
    for title, desc in problems:
        p_t = pt.add_paragraph()
        p_t.text = f"\n• {title}:"
        p_t.font.bold = True
        p_t.font.size = Pt(11)
        p_t.font.color.rgb = COLOR_WHITE
        p_d = pt.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(10)
        p_d.font.color.rgb = COLOR_MUTED

    # Right: Solutions
    s_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.9))
    s_box.fill.solid()
    s_box.fill.fore_color.rgb = RGBColor(8, 47, 73)
    s_box.line.color.rgb = COLOR_SKY
    st = s_box.text_frame
    s0 = st.paragraphs[0]
    s0.text = "✅  THE EVENTHUB INNOVATION"
    s0.font.bold = True
    s0.font.size = Pt(14)
    s0.font.color.rgb = COLOR_SKY_LIGHT

    solutions = [
        ("Zero-Login Guest RSVP", "Attendees register in under 15 seconds with just Name, Email & event questions without account walls."),
        ("100% Serverless on Vercel", "Zero server maintenance and $0 idle cost. Functions execute on-demand and scale to zero."),
        ("Real-Time Camera QR Scanner", "Sub-second WebRTC smartphone camera scan with database-enforced duplicate prevention."),
        ("Dynamic JSONB Form Builder", "Organizers add custom form fields on-the-fly without database alterations or downtime.")
    ]
    for title, desc in solutions:
        s_t = st.add_paragraph()
        s_t.text = f"\n• {title}:"
        s_t.font.bold = True
        s_t.font.size = Pt(11)
        s_t.font.color.rgb = COLOR_WHITE
        s_d = st.add_paragraph()
        s_d.text = desc
        s_d.font.size = Pt(10)
        s_d.font.color.rgb = COLOR_MUTED

    s2.notes_slide.notes_text_frame.text = (
        "When looking at existing platforms like Eventbrite or Google Forms, we observed critical friction. "
        "When users are forced to create passwords and verify accounts just to attend a meetup, over 40% abandon the registration midway. "
        "On the other hand, Google Forms lacks automated ticketing, scannable QR passes, and capacity management. "
        "EventHub bridges this gap: guests get zero-login instant registrations, organizers get dynamic form building and live gate scanning, "
        "and the entire system runs on a serverless architecture that scales from zero to thousands of users at zero idle cost."
    )

    # ==================== SLIDE 3: System Design & Architecture ====================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_header(s3, "System Design", "Three-Tier Decoupled Serverless Architecture")

    tiers = [
        ("TIER 1: PRESENTATION", "Client & Edge CDN", [
            "React 18 Single Page App (SPA)",
            "Vite 5.4 Lightning Build & HMR",
            "Tailwind CSS Minimalist UI",
            "html5-qrcode WebRTC Camera Stream",
            "Served via Vercel Global Edge CDN (<50ms)"
        ]),
        ("TIER 2: COMPUTE", "Serverless API Gateway", [
            "FastAPI (Python 3.12) ASGI Handler",
            "Runs as AWS Lambda Function (iad1)",
            "Pydantic 2.0 Request Validation",
            "In-Memory Vector QR Code Engine",
            "Asynchronous Background Email Workers"
        ]),
        ("TIER 3: DATA & SERVICES", "Cloud Services & Persistence", [
            "Supabase PostgreSQL 17 Database",
            "IPv4 PgBouncer Connection Pooler (6543)",
            "Supabase GoTrue Auth (Organisers)",
            "Supabase Storage (Poster CDN Bucket)",
            "Brevo SMTP Relay (Transactional Delivery)"
        ])
    ]

    for i, (tag_name, title_name, bullets) in enumerate(tiers):
        x = Inches(0.8 + i * 4.0)
        box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(3.7), Inches(4.8))
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_CARD
        box.line.color.rgb = COLOR_BORDER
        bt = box.text_frame
        p_tag = bt.paragraphs[0]
        p_tag.text = tag_name
        p_tag.font.bold = True
        p_tag.font.size = Pt(11)
        p_tag.font.color.rgb = COLOR_SKY
        p_h = bt.add_paragraph()
        p_h.text = title_name
        p_h.font.bold = True
        p_h.font.size = Pt(14)
        p_h.font.color.rgb = COLOR_WHITE

        for b in bullets:
            bp = bt.add_paragraph()
            bp.text = f"• {b}"
            bp.font.size = Pt(10)
            bp.font.color.rgb = COLOR_MUTED

    s3.notes_slide.notes_text_frame.text = (
        "Here is our system architecture. It follows a decoupled three-tier serverless pattern: "
        "At the presentation layer, we have a React Single Page Application styled with Tailwind CSS, served through Vercel's global CDN. "
        "When the user performs an action, the request is routed to our API layer, which is powered by FastAPI running on Python 3.12 inside a serverless lambda. "
        "It validates the data using Pydantic and executes business logic asynchronously. "
        "At the persistence layer, we use PostgreSQL hosted on Supabase, routed through an IPv4 transaction pooler on port 6543 to prevent connection exhaustion. "
        "Finally, ticket confirmation and QR pass delivery are handled by Brevo SMTP in an asynchronous background worker."
    )

    # ==================== SLIDE 4: Dual User Journeys ====================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_header(s4, "User Workflows", "Dual-Persona User Journeys: Attendee vs. Organiser")

    tracks = [
        ("🎟️  GUEST ATTENDEE LIFECYCLE (ZERO FRICTION)", COLOR_SKY, [
            ("1. Discover Events", "Browse published events by title, venue, or category slug with live seat counters."),
            ("2. Instant 15-Sec Registration", "Enter Name, Email, and answer custom form questions without creating an account."),
            ("3. Atomic Ticket Creation", "Backend verifies capacity, allocates seat, and generates unique token (TK-xxxx)."),
            ("4. Instant On-Screen Pass", "Immediate redirect to /ticket/:id showing verified, printable digital QR code pass."),
            ("5. Automated Inbox Delivery", "Brevo SMTP dispatches transactional email pass with inline embedded QR code.")
        ]),
        ("🧑‍💼  EVENT ORGANISER LIFECYCLE (FULL SUITE)", COLOR_GREEN, [
            ("1. Organiser Studio", "Create events with title, venue, schedule, seat capacity, fee, and poster upload."),
            ("2. Dynamic Form Builder", "Add custom questions (Phone, College ID, T-Shirt) with required/optional toggles."),
            ("3. Event Editor", "Edit dates, venue, capacity, or custom questions anytime with real-time sync."),
            ("4. Live Camera QR Scanner", "WebRTC camera scanner decodes pass and checks in attendee with sub-second latency."),
            ("5. Real-Time Analytics & CSV", "Monitor check-in velocity and export attendee responses via 1-click CSV.")
        ])
    ]

    for i, (title_name, border_col, steps) in enumerate(tracks):
        x = Inches(0.8 + i * 5.9)
        box = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(5.7), Inches(4.9))
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_CARD
        box.line.color.rgb = border_col
        bt = box.text_frame
        p0 = bt.paragraphs[0]
        p0.text = title_name
        p0.font.bold = True
        p0.font.size = Pt(12)
        p0.font.color.rgb = border_col

        for s_title, s_desc in steps:
            st = bt.add_paragraph()
            st.text = f"\n{s_title}"
            st.font.bold = True
            st.font.size = Pt(11)
            st.font.color.rgb = COLOR_WHITE
            sd = bt.add_paragraph()
            sd.text = s_desc
            sd.font.size = Pt(10)
            sd.font.color.rgb = COLOR_MUTED

    s4.notes_slide.notes_text_frame.text = (
        "We built EventHub for two distinct personas: For the Attendee, there is zero friction. They find an event, "
        "enter their name and email, and within seconds their ticket is generated on screen and dispatched to their email inbox. "
        "For the Organiser, we built a full administrative suite. They can create events, configure custom questions without writing code, "
        "and edit event details whenever venue or schedules change. On event day, the organiser opens the mobile scanner right inside the browser. "
        "Using the phone's native camera, it scans the attendee's QR pass and checks them in instantaneously."
    )

    # ==================== SLIDE 5: Database Schema & Integrity ====================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_header(s5, "Data Architecture", "Relational Database Schema & Fraud Prevention")

    tables = [
        ("profiles", "Organisers & Admins", [
            "id (UUID, PK)",
            "full_name (VARCHAR)",
            "role ('organiser' | 'admin')",
            "avatar_url (VARCHAR)",
            "created_at (TIMESTAMP)"
        ]),
        ("events", "Event Metadata & Forms", [
            "id (UUID, PK)",
            "organiser_id (FK -> profiles)",
            "title, venue, dates",
            "capacity, fee, status",
            "custom_fields (JSONB)"
        ]),
        ("registrations", "Tickets & Attendees", [
            "id (UUID, PK)",
            "user_id (NULLABLE FK)",
            "event_id (FK -> events)",
            "attendee_name, email",
            "ticket_token (UNIQUE, INDEXED)",
            "form_responses (JSONB)"
        ]),
        ("attendance", "Fraud-Proof Gate Entry", [
            "id (UUID, PK)",
            "registration_id (UNIQUE FK)",
            "checked_in_by (FK -> profiles)",
            "checked_in_at (TIMESTAMP)",
            "[Enforces single entry only]"
        ])
    ]

    for i, (t_name, t_sub, cols) in enumerate(tables):
        x = Inches(0.8 + i * 2.95)
        box = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(2.8), Inches(4.0))
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_CARD
        box.line.color.rgb = COLOR_BORDER
        bt = box.text_frame
        p0 = bt.paragraphs[0]
        p0.text = t_name
        p0.font.bold = True
        p0.font.size = Pt(13)
        p0.font.color.rgb = COLOR_SKY
        p_sub = bt.add_paragraph()
        p_sub.text = t_sub
        p_sub.font.size = Pt(10)
        p_sub.font.color.rgb = COLOR_MUTED

        for col in cols:
            cp = bt.add_paragraph()
            cp.text = f"• {col}"
            cp.font.size = Pt(9.5)
            cp.font.color.rgb = COLOR_WHITE if "UNIQUE" in col or "NULLABLE" in col else COLOR_MUTED

    # Bottom Callout Banner
    callout = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.7), Inches(0.8))
    callout.fill.solid()
    callout.fill.fore_color.rgb = RGBColor(14, 116, 144)
    callout.line.color.rgb = COLOR_SKY_LIGHT
    ct = callout.text_frame.paragraphs[0]
    ct.text = "💡 Architectural Rationale: 1) user_id is nullable for zero-login checkouts; 2) ticket_token is a cryptographic string protecting internal DB IDs; 3) attendance.registration_id has a UNIQUE constraint enforcing duplicate prevention at the PostgreSQL engine level."
    ct.font.size = Pt(10)
    ct.font.bold = True
    ct.font.color.rgb = COLOR_WHITE

    s5.notes_slide.notes_text_frame.text = (
        "Turning to the database design: we selected PostgreSQL 17 on Supabase because event ticketing demands absolute ACID compliance. "
        "Notice four critical engineering decisions in this schema: First, in the registrations table, user_id is nullable. "
        "This enables zero-login guest checkout while maintaining relational links for registered users. "
        "Second, we do not encode internal database IDs into the QR code; instead, we generate a high-entropy random string called ticket_token. "
        "Third, in the attendance table, registration_id is defined with a UNIQUE constraint. This means duplicate check-in prevention is enforced "
        "by the database engine itself, completely immune to race conditions. Finally, we leverage PostgreSQL's native JSONB datatype to store dynamic form fields."
    )

    # ==================== SLIDE 6: 4 Technical Challenges ====================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_header(s6, "Engineering Highlights", "Four Critical Technical Challenges & How We Solved Them")

    challenges = [
        ("1. Serverless FastAPI on Vercel ($0 Hosting)",
         "FastAPI typically requires a 24/7 server (EC2/Railway), incurring monthly compute fees.",
         "Wrapped app into an ASGI serverless handler (api/index.py) with URL rewrites in vercel.json. FastAPI boots on-demand and scales to zero."),
        ("2. Supabase IPv6 vs. Vercel IPv4 Routing",
         "Direct Supabase DB endpoints only resolve IPv6 addresses, whereas Vercel Lambdas are IPv4-only.",
         "Routed database connections through Supabase's IPv4 PgBouncer Transaction Pooler on port 6543, achieving 100% IPv4 connectivity."),
        ("3. PgBouncer Prepared Statement Collision",
         "Python's asyncpg caches prepared statements by default, which conflicts with PgBouncer connection multiplexing.",
         "Configured statement_cache_size=0 on SQLAlchemy async engine, disabling prepared statement caching for PgBouncer compatibility."),
        ("4. Universal Inline QR Email Delivery",
         "Email providers (Gmail, Outlook) often block remote external image URLs or mark tickets as spam.",
         "Generated vector QR bytes in memory and embedded them as inline MIME Multipart CID attachments via Brevo SMTP relay.")
    ]

    for i, (ch_title, ch_prob, ch_sol) in enumerate(challenges):
        row = i // 2
        col = i % 2
        x = Inches(0.8 + col * 5.9)
        y = Inches(1.8 + row * 2.6)
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.7), Inches(2.4))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD
        card.line.color.rgb = COLOR_BORDER
        ct = card.text_frame
        p0 = ct.paragraphs[0]
        p0.text = ch_title
        p0.font.bold = True
        p0.font.size = Pt(12)
        p0.font.color.rgb = COLOR_SKY_LIGHT

        p_p = ct.add_paragraph()
        p_p.text = f"• Problem: {ch_prob}"
        p_p.font.size = Pt(9.5)
        p_p.font.color.rgb = COLOR_RED

        p_s = ct.add_paragraph()
        p_s.text = f"• Solution: {ch_sol}"
        p_s.font.size = Pt(9.5)
        p_s.font.color.rgb = COLOR_GREEN

    s6.notes_slide.notes_text_frame.text = (
        "During implementation, we encountered and resolved four significant technical challenges: "
        "First, to keep hosting 100% free, we converted FastAPI into an on-demand ASGI serverless lambda on Vercel using intelligent path rewriting. "
        "Second, Vercel's serverless Lambdas operate strictly on IPv4, whereas Supabase's direct database endpoint only resolves IPv6. "
        "We solved this by routing connections through Supabase's IPv4 PgBouncer transaction pooler. "
        "Third, Python's asyncpg driver caches prepared statements, which conflicted with PgBouncer; we resolved this by explicitly disabling statement caching. "
        "Fourth, we attached QR codes as inline MIME CID elements so the pass displays immediately in all inboxes without being blocked."
    )

    # ==================== SLIDE 7: Tech Stack Comparison ====================
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_header(s7, "Architectural Choices", "Technology Stack Comparison & Architectural Justification")

    techs = [
        ("Frontend", "React 18 + Vite", "Component reusability, lightning fast HMR, optimized SPA bundle", "Next.js (Too heavy for decoupled API)", "Plain HTML/JS (Spaghetti code)"),
        ("Styling", "Tailwind CSS", "Utility-first, exact brand control, minimal CSS footprint, zero runtime overhead", "Bootstrap (Dated styling)", "MUI (Bloated bundle size)"),
        ("Backend", "FastAPI (Python 3.12)", "Native async/await concurrency, automatic Pydantic validation, interactive Swagger docs", "Flask (Synchronous, lacks validation)", "Django (Too monolithic for lambdas)"),
        ("Database", "PostgreSQL (Supabase)", "ACID capacity locks, relational foreign keys, native JSONB support, PgBouncer pooler", "MongoDB (Lacks atomic seat locks)", "Firebase (Vendor lock-in, loose relations)"),
        ("Hosting", "Vercel Serverless", "Zero server maintenance, $0 idle costs, edge CDN caching worldwide", "Railway / Render (Paid monthly fee)", "AWS EC2 (Manual ops & continuous costs)")
    ]

    # Draw table container
    table_box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.0))
    table_box.fill.solid()
    table_box.fill.fore_color.rgb = COLOR_CARD
    table_box.line.color.rgb = COLOR_BORDER
    tt = table_box.text_frame

    p0 = tt.paragraphs[0]
    p0.text = f"{'LAYER':<12} | {'SELECTED TECH':<22} | {'PRIMARY ADVANTAGE':<45} | {'REJECTED ALTERNATIVES':<30}"
    p0.font.bold = True
    p0.font.size = Pt(10)
    p0.font.color.rgb = COLOR_SKY

    for layer, sel, adv, rej1, rej2 in techs:
        tp = tt.add_paragraph()
        tp.text = f"\n{layer.upper():<12} | {sel:<22} | {adv}\n             -> Rejected: {rej1}, {rej2}"
        tp.font.size = Pt(9.5)
        tp.font.color.rgb = COLOR_WHITE

    s7.notes_slide.notes_text_frame.text = (
        "A critical part of our engineering was selecting the right tool for each layer: "
        "We chose FastAPI over Flask or Django because of its asynchronous non-blocking nature and automatic data validation through Pydantic. "
        "It also gives us complete, live OpenAPI interactive documentation out of the box. "
        "We chose PostgreSQL over NoSQL solutions like MongoDB because event ticketing requires strict ACID transactions. "
        "If two users attempt to book the last seat simultaneously, relational row locks guarantee that only one succeeds, eliminating overbooking. "
        "For email delivery, we integrated Brevo SMTP because it allows 300 free transactional emails per day to any recipient without paid sandboxes."
    )

    # ==================== SLIDE 8: Live Demo & Conclusion ====================
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)

    # Accent pill
    tag = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.5), Inches(0.8), Inches(4.333), Inches(0.45))
    tag.fill.solid()
    tag.fill.fore_color.rgb = RGBColor(6, 78, 59)
    tag.line.color.rgb = COLOR_GREEN
    tp = tag.text_frame.paragraphs[0]
    tp.text = "🚀 VERIFIED & LIVE IN PRODUCTION"
    tp.font.size = Pt(11)
    tp.font.bold = True
    tp.font.color.rgb = COLOR_GREEN
    tp.alignment = PP_ALIGN.CENTER

    tb = s8.shapes.add_textbox(Inches(1.0), Inches(1.4), Inches(11.333), Inches(1.0))
    p = tb.text_frame.paragraphs[0]
    p.text = "Ready for Live Demonstration"
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE
    p.alignment = PP_ALIGN.CENTER

    # Demo links
    links = [
        ("🌐 PRODUCTION APPLICATION", "https://eventhub-delta-two.vercel.app", COLOR_SKY),
        ("📖 INTERACTIVE SWAGGER DOCS", "https://eventhub-delta-two.vercel.app/docs", COLOR_GREEN),
        ("💻 OPEN-SOURCE REPOSITORY", "https://github.com/anutoshyadaw2506-beep/eventhub", COLOR_WHITE)
    ]
    for i, (label, url, col) in enumerate(links):
        x = Inches(1.2 + i * 3.8)
        card = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.6), Inches(3.5), Inches(1.4))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD
        card.line.color.rgb = col
        card.line.width = Pt(1.5)
        cp1 = card.text_frame.paragraphs[0]
        cp1.text = label
        cp1.font.size = Pt(11)
        cp1.font.bold = True
        cp1.font.color.rgb = col
        cp2 = card.text_frame.add_paragraph()
        cp2.text = f"\n{url}"
        cp2.font.size = Pt(9.5)
        cp2.font.color.rgb = COLOR_MUTED

    # Future Scope Box
    scope_box = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(4.3), Inches(10.9), Inches(1.8))
    scope_box.fill.solid()
    scope_box.fill.fore_color.rgb = COLOR_CARD
    scope_box.line.color.rgb = COLOR_BORDER
    sct = scope_box.text_frame
    scp0 = sct.paragraphs[0]
    scp0.text = "FUTURE ROADMAP & EXTENSIONS"
    scp0.font.bold = True
    scp0.font.size = Pt(11)
    scp0.font.color.rgb = COLOR_SKY_LIGHT

    scopes = [
        "1. Offline-First Scanner Sync: Progressive Web App with IndexedDB caching for venues with poor cellular reception.",
        "2. Multi-Channel Ticket Delivery: Direct WhatsApp and SMS pass dispatch via Twilio API integration.",
        "3. Multi-Currency Payment Gateways: Seamless Stripe and Razorpay integrations for international ticketing."
    ]
    for sc in scopes:
        scp = sct.add_paragraph()
        scp.text = f"• {sc}"
        scp.font.size = Pt(10)
        scp.font.color.rgb = COLOR_MUTED

    # Thank you
    tb_ty = s8.shapes.add_textbox(Inches(1.0), Inches(6.3), Inches(11.333), Inches(0.6))
    pty = tb_ty.text_frame.paragraphs[0]
    pty.text = "Thank you! We are now open for faculty questions and live demo."
    pty.font.size = Pt(14)
    pty.font.bold = True
    pty.font.color.rgb = COLOR_WHITE
    pty.alignment = PP_ALIGN.CENTER

    s8.notes_slide.notes_text_frame.text = (
        "To conclude: EventHub proves that modern full-stack web applications can deliver zero-friction user experiences, "
        "high security, and real-time gate operations without expensive server bills. "
        "Everything you have seen today is fully implemented, thoroughly tested, and live in production on Vercel at eventhub-delta-two.vercel.app. "
        "In the future, we plan to expand EventHub with offline-first scanner sync using IndexedDB for venues with poor cellular reception, "
        "and automated WhatsApp pass delivery. Thank you for your time and attention. I would be glad to answer any questions or demonstrate any part of the system live."
    )

    output_dir = "/Users/anutosh/.gemini/antigravity/brain/d9a7cd33-b171-46c1-bb62-9511621719fc"
    output_path = os.path.join(output_dir, "EventHub_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    create_eventhub_deck()
