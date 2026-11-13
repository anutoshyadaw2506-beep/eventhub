import subprocess
import os

applescript_code = """
tell application "Keynote"
    activate
    
    -- Create new document with Slate theme
    set myDoc to make new document with properties {document theme:theme "Slate"}
    
    tell myDoc
        -- Delete the initial default slide
        delete first slide
        
        -- ==================== SLIDE 1 ====================
        set s1 to make new slide with properties {base slide:master slide "Title - Centre"}
        set object text of default title item of s1 to "EventHub"
        set object text of default body item of s1 to "A Serverless, Zero-Friction Event Management & Live QR Ticketing Platform" & return & return & "Full-Stack Viva Defense | React 18 • FastAPI • PostgreSQL • Vercel" & return & "Live: https://eventhub-delta-two.vercel.app"
        set presenter notes of s1 to "Respected examiners, good morning. Today I am proud to present EventHub—a modern, full-stack event management and real-time ticketing platform. EventHub was built from the ground up to solve two fundamental problems: attendee registration friction and expensive server infrastructure. The entire application is deployed live in production on Vercel without requiring any persistent paid servers, running completely serverless with enterprise-grade PostgreSQL, dynamic custom form schemas, automated email pass delivery, and live camera-based QR door verification."
        
        -- ==================== SLIDE 2 ====================
        set s2 to make new slide with properties {base slide:master slide "Title & Bullets"}
        set object text of default title item of s2 to "Problem Statement vs. EventHub Solution"
        set object text of default body item of s2 to "❌ THE INDUSTRY FRICTION:" & return & "• Mandatory Sign-up Walls: 40%+ drop-off from forcing casual attendees to create passwords." & return & "• Costly 24/7 Hosting: Traditional servers (EC2/Railway/Render) incur continuous monthly bills." & return & "• Gate Bottlenecks & Fraud: Paper lists cause long queues; static PDFs allow ticket sharing." & return & "• Rigid Form Schemas: Custom questions require cumbersome SQL table migrations." & return & return & "✅ THE EVENTHUB INNOVATION:" & return & "• Zero-Login Guest RSVP: Instant 15-second registration with Name, Email & custom fields." & return & "• 100% Serverless on Vercel: Runs on on-demand Python ASGI Lambdas with $0 idle cost." & return & "• Sub-Second Camera Scanner: WebRTC camera scan with atomic duplicate scan blocking." & return & "• Dynamic JSONB Form Builder: Custom form fields configured on-the-fly without altering DB tables."
        set presenter notes of s2 to "When looking at existing platforms like Eventbrite or Google Forms, we observed critical friction. When users are forced to create passwords and verify accounts just to attend a meetup, over 40% abandon the registration midway. On the other hand, Google Forms lacks automated ticketing, scannable QR passes, and capacity management. EventHub bridges this gap: guests get zero-login instant registrations, organizers get dynamic form building and live gate scanning, and the entire system runs on a serverless architecture that scales from zero to thousands of users at zero idle cost."
        
        -- ==================== SLIDE 3 ====================
        set s3 to make new slide with properties {base slide:master slide "Title & Bullets"}
        set object text of default title item of s3 to "Three-Tier Decoupled Serverless Architecture"
        set object text of default body item of s3 to "TIER 1: PRESENTATION (Client & Global Edge CDN)" & return & "• React 18 Single Page Application built with Vite 5.4 & Tailwind CSS" & return & "• html5-qrcode WebRTC library for smartphone camera scanning" & return & "• Served globally via Vercel Edge CDN with sub-50ms asset caching" & return & return & "TIER 2: COMPUTE (Serverless API Gateway)" & return & "• FastAPI (Python 3.12) ASGI Handler running on AWS Lambda (iad1)" & return & "• Pydantic 2.0 schema validation & in-memory vector QR generator" & return & "• Asynchronous background workers for non-blocking email dispatch" & return & return & "TIER 3: DATA & CLOUD SERVICES (Persistence & Delivery)" & return & "• Supabase PostgreSQL 17 via IPv4 PgBouncer Connection Pooler (Port 6543)" & return & "• Brevo SMTP Relay for transactional email passes with inline QR codes" & return & "• Supabase Storage bucket for event poster image uploads"
        set presenter notes of s3 to "Here is our system architecture. It follows a decoupled three-tier serverless pattern: At the presentation layer, we have a React Single Page Application styled with Tailwind CSS, served through Vercel's global CDN. When the user performs an action, the request is routed to our API layer, which is powered by FastAPI running on Python 3.12 inside a serverless lambda. It validates the data using Pydantic and executes business logic asynchronously. At the persistence layer, we use PostgreSQL hosted on Supabase, routed through an IPv4 transaction pooler on port 6543 to prevent connection exhaustion. Finally, ticket confirmation and QR pass delivery are handled by Brevo SMTP in an asynchronous background worker."
        
        -- ==================== SLIDE 4 ====================
        set s4 to make new slide with properties {base slide:master slide "Title & Bullets"}
        set object text of default title item of s4 to "Dual-Persona Workflows: Attendee vs. Organiser"
        set object text of default body item of s4 to "🎟️ GUEST ATTENDEE LIFECYCLE (Zero Friction):" & return & "1. Discover Events: Search events by keyword, category, or venue with live seat counters." & return & "2. 15-Second RSVP: Enter Name, Email & custom questions without password walls." & return & "3. Instant On-Screen Pass: Immediate redirect to /ticket/:id with scannable QR pass." & return & "4. Inbox Delivery: Automated Brevo transactional email with inline embedded QR pass." & return & return & "🧑‍💼 EVENT ORGANISER LIFECYCLE (Full Control):" & return & "1. Organiser Studio: Configure schedule, venue, seat capacity, fee, and poster." & return & "2. Dynamic Form Builder: Add custom questions (T-shirt, Roll No) in 1 click." & return & "3. Event Editor: Update venue, timings, or questions anytime with real-time sync." & return & "4. Door Scanner: Smartphone camera scans QR pass with instant green/red status." & return & "5. Live Analytics & CSV: Real-time capacity metrics & 1-click attendee CSV export."
        set presenter notes of s4 to "We built EventHub for two distinct personas: For the Attendee, there is zero friction. They find an event, enter their name and email, and within seconds their ticket is generated on screen and dispatched to their email inbox. For the Organiser, we built a full administrative suite. They can create events, configure custom questions without writing code, and edit event details whenever venue or schedules change. On event day, the organiser opens the mobile scanner right inside the browser. Using the phone's native camera, it scans the attendee's QR pass and checks them in instantaneously."
        
        -- ==================== SLIDE 5 ====================
        set s5 to make new slide with properties {base slide:master slide "Title & Bullets"}
        set object text of default title item of s5 to "PostgreSQL Schema & Fraud Prevention Models"
        set object text of default body item of s5 to "CORE RELATIONAL TABLES (PostgreSQL 17 on Supabase):" & return & "• profiles: Organiser accounts and roles ('participant', 'organiser', 'admin')." & return & "• events: Event metadata, schedules, capacity, fee, and custom_fields (JSONB)." & return & "• registrations: user_id is NULLABLE (for guest checkouts) + unique ticket_token." & return & "• attendance: Stores verified check-ins with a UNIQUE constraint on registration_id." & return & "• categories: Taxonomies with unique names and URL slugs." & return & return & "SECURITY & FRAUD PREVENTION HIGHLIGHTS:" & return & "• Non-Exposed IDs: QR codes encode cryptographic random tokens (TK-xxxx), not DB IDs." & return & "• Engine-Level Duplicate Prevention: UNIQUE constraint on attendance.registration_id ensures only the first scan succeeds; subsequent scans return HTTP 409 Conflict." & return & "• JSONB Dynamic Storage: Custom attendee form responses stored as structured JSON."
        set presenter notes of s5 to "Turning to the database design: we selected PostgreSQL 17 on Supabase because event ticketing demands absolute ACID compliance. Notice four critical engineering decisions in this schema: First, in the registrations table, user_id is nullable. This enables zero-login guest checkout while maintaining relational links for registered users. Second, we do not encode internal database IDs into the QR code; instead, we generate a high-entropy random string called ticket_token. Third, in the attendance table, registration_id is defined with a UNIQUE constraint. This means duplicate check-in prevention is enforced by the database engine itself, completely immune to race conditions. Finally, we leverage PostgreSQL's native JSONB datatype to store dynamic form fields."
        
        -- ==================== SLIDE 6 ====================
        set s6 to make new slide with properties {base slide:master slide "Title & Bullets"}
        set object text of default title item of s6 to "Critical Engineering Challenges & Solutions"
        set object text of default body item of s6 to "1. SERVERLESS ASGI FASTAPI ON VERCEL ($0 COST):" & return & "• Challenge: FastAPI normally requires paid 24/7 servers (Railway/Render/EC2)." & return & "• Solution: Wrapped app into ASGI Lambda handler (api/index.py) + vercel.json rewrites." & return & return & "2. SUPABASE IPv6 VS. VERCEL IPv4 ROUTING:" & return & "• Challenge: Direct Supabase host only resolves IPv6; Vercel AWS Lambdas are IPv4-only." & return & "• Solution: Routed traffic through Supabase's IPv4 PgBouncer Pooler on port 6543." & return & return & "3. PGBOUNCER PREPARED STATEMENT COLLISION:" & return & "• Challenge: AsyncPG statement caching clashed with PgBouncer connection multiplexing." & return & "• Solution: Configured statement_cache_size=0 on SQLAlchemy async engine." & return & return & "4. UNIVERSAL INLINE QR EMAIL DELIVERY:" & return & "• Challenge: Email clients block external image links or route passes to spam." & return & "• Solution: Generated vector QR bytes in memory and embedded as inline MIME/CID elements."
        set presenter notes of s6 to "During implementation, we encountered and resolved four significant technical challenges: First, to keep hosting 100% free, we converted FastAPI into an on-demand ASGI serverless lambda on Vercel using intelligent path rewriting. Second, Vercel's serverless Lambdas operate strictly on IPv4, whereas Supabase's direct database endpoint only resolves IPv6. We solved this by routing connections through Supabase's IPv4 PgBouncer transaction pooler. Third, Python's asyncpg driver caches prepared statements, which conflicted with PgBouncer; we resolved this by explicitly disabling statement caching. Fourth, we attached QR codes as inline MIME CID elements so the pass displays immediately in all inboxes without being blocked."
        
        -- ==================== SLIDE 7 ====================
        set s7 to make new slide with properties {base slide:master slide "Title & Bullets"}
        set object text of default title item of s7 to "Technology Stack Comparison & Architectural Justification"
        set object text of default body item of s7 to "• FRONTEND: React 18 + Vite" & return & "  -> Chosen for modular SPA architecture, sub-second HMR, and small production bundle." & return & "  -> Rejected Next.js (unnecessary SSR overhead for decoupled client-side app)." & return & return & "• BACKEND: FastAPI (Python 3.12)" & return & "  -> Chosen for native async/await I/O, automatic Pydantic validation, and Swagger /docs." & return & "  -> Rejected Flask (synchronous, lacks typing) and Django (too monolithic for lambdas)." & return & return & "• DATABASE: PostgreSQL 17 (Supabase)" & return & "  -> Chosen for strict ACID capacity locks, relational foreign keys, and JSONB flexibility." & return & "  -> Rejected MongoDB (lacks transactional locks needed to prevent overselling)." & return & return & "• HOSTING: Vercel Serverless" & return & "  -> Chosen for global Edge CDN caching, automated scaling, and $0 idle server cost." & return & "  -> Rejected Railway / Render (incurs ongoing monthly hosting charges)."
        set presenter notes of s7 to "A critical part of our engineering was selecting the right tool for each layer: We chose FastAPI over Flask or Django because of its asynchronous non-blocking nature and automatic data validation through Pydantic. It also gives us complete, live OpenAPI interactive documentation out of the box. We chose PostgreSQL over NoSQL solutions like MongoDB because event ticketing requires strict ACID transactions. If two users attempt to book the last seat simultaneously, relational row locks guarantee that only one succeeds, eliminating overbooking. For email delivery, we integrated Brevo SMTP because it allows 300 free transactional emails per day to any recipient without paid sandboxes."
        
        -- ==================== SLIDE 8 ====================
        set s8 to make new slide with properties {base slide:master slide "Title & Bullets"}
        set object text of default title item of s8 to "Live Production Verification & Future Scope"
        set object text of default body item of s8 to "VERIFIED LIVE IN PRODUCTION:" & return & "• Production Web Application: https://eventhub-delta-two.vercel.app" & return & "• Interactive Swagger API Documentation: https://eventhub-delta-two.vercel.app/docs" & return & "• Open-Source GitHub Repository: github.com/anutoshyadaw2506-beep/eventhub" & return & return & "FEATURE VERIFICATION STATUS:" & return & "• ✅ Guest attendee registration with zero login friction" & return & "• ✅ Instant verified QR ticket generation and pass rendering" & return & "• ✅ Automated Brevo transactional email pass delivery" & return & "• ✅ Organiser studio with dynamic question builder & event editor" & return & "• ✅ Real-time camera QR scanner with duplicate check-in blocking" & return & return & "FUTURE ROADMAP:" & return & "• Offline-first PWA scanner sync with IndexedDB for weak network environments" & return & "• Automated WhatsApp ticket pass delivery via Twilio API" & return & "• Multi-currency payment gateway integration (Stripe & Razorpay)"
        set presenter notes of s8 to "To conclude: EventHub proves that modern full-stack web applications can deliver zero-friction user experiences, high security, and real-time gate operations without expensive server bills. Everything you have seen today is fully implemented, thoroughly tested, and live in production on Vercel at eventhub-delta-two.vercel.app. In the future, we plan to expand EventHub with offline-first scanner sync using IndexedDB for venues with poor cellular reception, and automated WhatsApp pass delivery. Thank you for your time and attention. I would be glad to answer any questions or demonstrate any part of the system live."
        
    end tell
    
    set outPath to POSIX file "/Users/anutosh/.gemini/antigravity/scratch/eventhub/EventHub_Presentation.key"
    save myDoc in outPath
    close myDoc
end tell
"""

def generate():
    process = subprocess.run(["osascript", "-e", applescript_code], capture_output=True, text=True)
    if process.returncode == 0:
        print("Successfully generated EventHub_Presentation.key!")
        # Copy to artifact folder
        art_path = "/Users/anutosh/.gemini/antigravity/brain/d9a7cd33-b171-46c1-bb62-9511621719fc/EventHub_Presentation.key"
        os.system(f"cp -R /Users/anutosh/.gemini/antigravity/scratch/eventhub/EventHub_Presentation.key {art_path}")
        print("Copied to artifacts directory as well.")
    else:
        print("Error generating Keynote presentation:", process.stderr)

if __name__ == "__main__":
    generate()
