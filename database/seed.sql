-- ============================================================
-- Idea Graveyard – Seed Data & SQL Operations Demo
-- ============================================================
USE idea_graveyard_db;

-- ============================================================
-- INSERT: Users (passwords are bcrypt hashes of 'password123')
-- ============================================================
INSERT INTO USERS (username, email, password_hash) VALUES
('alex_founder',  'alex@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.2'),
('maya_builder',  'maya@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.2'),
('raj_techie',    'raj@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.2'),
('sara_product',  'sara@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.2'),
('dev_anonymous', 'dev@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.2');

-- ============================================================
-- INSERT: Failure Categories
-- ============================================================
INSERT INTO FAILURE_CATEGORIES (category_name, description) VALUES
('Market Mismatch',        'The product did not address a real market need or customer pain point.'),
('Poor Execution',         'The idea was sound but implementation was flawed or mismanaged.'),
('Funding Issues',         'Ran out of capital before achieving sustainability or product-market fit.'),
('Team Problems',          'Co-founder conflicts, key person departures, or lack of critical skills.'),
('Technical Challenges',   'Insurmountable engineering obstacles or wrong technology choices.'),
('Competition',            'Out-competed by existing players or better-funded newcomers.'),
('Regulatory Barriers',    'Legal, compliance, or regulatory hurdles that blocked the business.'),
('Timing',                 'Too early or too late to market; the world was not ready.'),
('Premature Scaling',      'Scaled operations before validating the core product or business model.'),
('Customer Acquisition',   'Could not find a cost-effective way to acquire and retain customers.');

-- ============================================================
-- INSERT: Ideas
-- ============================================================
INSERT INTO IDEAS (title, short_description, detailed_postmortem, industry_domain, posted_by, is_anonymous) VALUES
(
  'UberEats for Pets',
  'On-demand pet food delivery with live GPS tracking of delivery pets.',
  'We built a full logistics platform for pet food delivery believing pet owners needed ultra-fast 30-minute delivery. After 8 months and $120k spent, it turned out most pet owners planned ahead and bought in bulk from Amazon or Chewy. Our unit economics were terrible: average order $18, delivery cost $14. We underestimated the existing giant competitors and overestimated urgency in the market.',
  'Food & Delivery',
  1, FALSE
),
(
  'Blockchain Resume Verification',
  'Immutable resume verification using Ethereum smart contracts.',
  'We spent 14 months building a blockchain-based resume verification system. HR departments loved the demo but refused to pay monthly SaaS fees on top of existing LinkedIn and background-check tools. The crypto volatility also made enterprise contracts impossible to sign. We built an over-engineered solution using Web3 for a problem that could have been solved with a simple digitally-signed PDF.',
  'HR & Recruiting',
  2, FALSE
),
(
  'AR Grocery Shopping Guide',
  'Point your phone at supermarket shelves for nutrition scores and price comparisons.',
  'Our mobile AR app that let users scan shelves for nutrition and price data seemed genius. We raised a $200k angel round. Problems: retailers blocked our data scraping, barcode databases were incomplete (only 40% coverage), and 95% of users opened the app once and never returned. Battery drain was 3x a normal shopping trip and holding up your phone in a grocery store felt extremely awkward.',
  'Retail & Commerce',
  3, FALSE
),
(
  'Micro-Internship Marketplace',
  'Connect students with 1-week micro-internships at startups.',
  'We tried to disrupt traditional internships by offering 1-week project-based micro-internships. Students loved the idea; startups did not. Getting a new intern up to speed in a company takes longer than a week, so the ROI for startups was essentially zero. We also underestimated legal complexity around unpaid internship laws and liability. After 6 months with 3 students placed, we shut down.',
  'EdTech',
  4, FALSE
),
(
  'AI Therapist Chatbot',
  'An empathetic GPT-powered chatbot for mental health support.',
  'We built MindMate before ChatGPT was popular. The AI was surprisingly good at empathetic responses. However, we hit a wall: no therapist would endorse it (liability), no insurance would cover it, and every hospital said they needed 2+ years of clinical trials before integration. The regulatory and trust barriers in healthcare were simply too high for a 3-person startup without medical co-founders.',
  'HealthTech',
  1, TRUE
),
(
  'Local Artist NFT Marketplace',
  'Help local street artists sell their digital artwork as NFTs.',
  'We launched right at the NFT peak in early 2022. Artists love the concept; collectors were only interested in established names. We had 200 artists but only 12 sales in 4 months. Then the NFT market crashed 90%. We did not understand that NFTs were speculative assets, not a new art distribution channel for unknowns. Also gas fees often exceeded the artwork price.',
  'Web3 & NFT',
  5, FALSE
),
(
  'Smart Parking App',
  'Real-time street parking availability using ultrasonic sensors.',
  'We partnered with a city council to deploy 500 ultrasonic sensors on parking spots. Hardware was $80 per sensor, installation $40, maintenance $20/year. City refused to pay, expecting us to monetize via ads on the app (which nobody wants). Our $60k sensor deployment was made obsolete when Google Maps announced a similar partnership with 10 cities. Hardware startups need deep pockets.',
  'Smart City',
  2, FALSE
),
(
  'Subscription Box for Books',
  'Curated monthly book boxes with author notes and discussion guides.',
  'We launched a premium book subscription at $45/month. Month 1 was exciting: 200 subscribers. By month 3 it dropped to 80 due to book accumulation — readers could not keep up. Our CAC was $38 and LTV was only $90 at 2-month average retention. Book subscription economics are brutal. We competed with BookoftheMonth (100k+ subscribers) with no marketing budget.',
  'eCommerce',
  3, TRUE
),
(
  'Freelancer Insurance Platform',
  'Tailored insurance products for gig economy workers.',
  'The idea was strong: 50M US freelancers with no employer benefits. We spent 18 months navigating insurance licensing across 50 states. Got licensed in 3 states. Our insurance partners required minimum premium volumes we could never reach as a startup. Insurance is one of the most regulated and capital-intensive industries — we were naive to think a 5-person team could disrupt it.',
  'FinTech',
  4, FALSE
),
(
  'Social Network for Introverts',
  'A low-pressure async social platform for people who hate real-time chat.',
  'We built a beautifully designed async social app with 72-hour response windows and no read receipts. Got 5,000 signups from a viral Reddit post. Retention was terrible because the core loop of social networks is real-time emotional feedback (likes, reactions). Removing that feature IS the product for introverts, but it also removes the addictive engagement loop. We solved a real pain point but created an un-retentive product.',
  'Social Media',
  5, TRUE
);

-- ============================================================
-- INSERT: Idea–Failure Category Mappings
-- ============================================================
INSERT INTO IDEA_FAILURE_MAP (idea_id, category_id) VALUES
(1, 1), (1, 6), (1, 9),   -- UberEats for Pets
(2, 1), (2, 5), (2, 8),   -- Blockchain Resume
(3, 2), (3, 10), (3, 5),  -- AR Grocery
(4, 1), (4, 7), (4, 3),   -- Micro-Internship
(5, 7), (5, 8),            -- AI Therapist
(6, 1), (6, 8), (6, 6),   -- NFT Marketplace
(7, 3), (7, 5), (7, 6),   -- Smart Parking
(8, 6), (8, 10), (8, 9),  -- Book Subscription
(9, 7), (9, 3), (9, 4),   -- Freelancer Insurance
(10, 1), (10, 2), (10, 10); -- Social Network Introverts

-- ============================================================
-- INSERT: Feedback
-- ============================================================
INSERT INTO FEEDBACK (idea_id, posted_by, comment_text, is_anonymous) VALUES
(1, 2, 'The unit economics breakdown is really insightful. Same thing killed our grocery delivery startup.', FALSE),
(1, 3, 'Did you ever try B2B — partnering with pet clinics instead of going D2C?', FALSE),
(2, 1, 'Blockchain for resume is a classic over-engineering trap. SAML assertions would have done the same job.', FALSE),
(2, 4, 'We built something similar. The real lesson: enterprises don''t pay for trust, they pay for reduced liability.', FALSE),
(3, 5, 'The battery drain point is underrated. Any mobile app that drains battery gets deleted instantly.', TRUE),
(4, 1, 'The legal angle is so important. Did you consult an employment lawyer before building?', FALSE),
(5, 2, 'Healthcare + AI is an amazing space but you''re right about the clinical trial bottleneck. It''s a 5-year journey minimum.', FALSE),
(6, 3, 'You launched right at peak euphoria. The timing alone was the killer.', FALSE),
(7, 4, 'Hardware + B2G (business-to-government) is brutal. Did you consider a pure software approach with crowdsourced data?', FALSE),
(8, 5, 'Book subscription churn is a known industry problem. The best ones shifted to experience boxes, not just books.', FALSE),
(9, 1, 'Insurance licensing is genuinely a 2-3 year moat. Were you Series A funded because you need that runway.', FALSE),
(10, 2, 'The engagement loop insight is brilliant. Low-pressure + addictive is nearly impossible to solve.', TRUE);

-- ============================================================
-- DEMONSTRATE SQL OPERATIONS
-- ============================================================

-- SELECT with JOIN: Ideas with author names
SELECT
    i.idea_id,
    i.title,
    i.industry_domain,
    CASE WHEN i.is_anonymous THEN 'Anonymous' ELSE u.username END AS author,
    i.created_at
FROM IDEAS i
LEFT JOIN USERS u ON i.posted_by = u.user_id
ORDER BY i.created_at DESC;

-- SELECT with LIKE: Search ideas by title keyword
SELECT idea_id, title, short_description FROM IDEAS
WHERE title LIKE '%App%';

-- GROUP BY with HAVING: Domains with more than 1 idea
SELECT industry_domain, COUNT(*) AS idea_count
FROM IDEAS
GROUP BY industry_domain
HAVING COUNT(*) > 1
ORDER BY idea_count DESC;

-- DISTINCT: Get unique industry domains
SELECT DISTINCT industry_domain FROM IDEAS ORDER BY industry_domain;

-- COUNT: Total ideas and feedback
SELECT
    (SELECT COUNT(*) FROM IDEAS)    AS total_ideas,
    (SELECT COUNT(*) FROM FEEDBACK) AS total_feedback,
    (SELECT COUNT(*) FROM USERS)    AS total_users;

-- UPDATE: Update an idea's short description
UPDATE IDEAS
SET short_description = 'On-demand pet food and supplies delivery with live GPS tracking.'
WHERE idea_id = 1;

-- DELETE: Remove a specific feedback entry (demo only)
-- DELETE FROM FEEDBACK WHERE feedback_id = 12;

-- Complex JOIN: Ideas with their failure categories
SELECT
    i.idea_id,
    i.title,
    GROUP_CONCAT(fc.category_name ORDER BY fc.category_name SEPARATOR ', ') AS failure_reasons
FROM IDEAS i
JOIN IDEA_FAILURE_MAP ifm ON i.idea_id = ifm.idea_id
JOIN FAILURE_CATEGORIES fc  ON ifm.category_id = fc.category_id
GROUP BY i.idea_id, i.title;
