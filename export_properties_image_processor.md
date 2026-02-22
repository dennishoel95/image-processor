# Image Metadata Requirements for SEO and GEO

## Overview

Digital Asset Management (DAM) requires specific metadata properties to maximize visibility in search engines (SEO) and generative AI systems (GEO). This guide covers essential properties, metadata standards, and implementation approaches.

---

## Required Properties for SEO and GEO

### Core Required Properties

#### 1. Filename
- **Purpose:** Search engine indexing and user-friendly URLs
- **Format:** Kebab-case with descriptive keywords
- **Example:** `2025-02-22-security-camera-setup.jpg`
- **Why:** Filenames are crawled by search engines and AI systems; descriptive names improve discoverability
- **Standard:** File system naming convention
- **GEO Impact:** Critical for AI crawler understanding of image context

#### 2. Alt Text (Accessibility)
- **Purpose:** Image accessibility and semantic understanding
- **Format:** Plain text, 125 characters maximum
- **Metadata Location:** IPTC "Alt Text (Accessibility)" field
- **Example:** "Security guard monitoring bank entrance on CCTV display"
- **Why:** Essential for screen readers, AI vision understanding, and accessibility compliance
- **GEO Impact:** AI systems rely heavily on alt text when image recognition fails
- **Note:** IPTC standard 2021.1+ introduced dedicated Alt Text field
- **Required For:** Both SEO and GEO

#### 3. Title/Caption
- **Purpose:** User context and search ranking signal
- **Format:** Concise text, 50-100 characters
- **Metadata Location:** IPTC Title field
- **Example:** "Modern Security Surveillance System"
- **Why:** Displayed under images in search results and on pages
- **Distinct From:** Filename (title is human-readable heading)
- **Required For:** SEO

#### 4. Description
- **Purpose:** Detailed image context and content comprehension
- **Format:** Full sentence or paragraph (up to 2000 characters in IPTC-IIM)
- **Metadata Location:** Maps to:
  - EXIF ImageDescription
  - IPTC Caption (descriptive)
  - XMP dc:description
- **Example:** "Professional security team conducting perimeter inspection of commercial building. Multiple officers visible with radio communication equipment and standard security uniforms."
- **Why:** Provides context for both users and AI systems; improves semantic understanding
- **GEO Impact:** Generative AI systems use descriptions for answer synthesis
- **Required For:** SEO/GEO

#### 5. Keywords/Tags
- **Purpose:** Categorization, discoverability, and search refinement
- **Format:** Comma-separated terms or individual tags
- **Metadata Location:** IPTC Keywords and XMP tags
- **Example:** `security, surveillance, CCTV, monitoring, access control, safety`
- **Why:** Used by image search engines for refinement suggestions and categorization
- **GEO Impact:** Keywords help AI systems categorize and relate images to queries
- **Google Behavior:** Extracts IPTC keywords for search refinement filters
- **Required For:** SEO/GEO

#### 6. Copyright Notice
- **Purpose:** Legal protection and usage rights clarity
- **Format:** Standard copyright notation
- **Metadata Location:** IPTC Copyright Notice field
- **Example:** "© 2025 Securitas Norge. All rights reserved."
- **Why:** Prevents unauthorized use and copyright violations
- **Critical Risk:** Google has removed 5 billion URLs from search for copyright infringement
- **Required For:** Legal protection and SEO credibility

#### 7. Creator/Author
- **Purpose:** Attribution and content provenance
- **Format:** Person or organization name
- **Metadata Location:** 
  - EXIF Artist field
  - IPTC Creator field
  - XMP photoshop:credit (for credit line display)
- **Example:** "Photography: John Smith | Edit: Design Team"
- **Why:** Google reads this for image attribution; required for proper citation in GEO systems
- **GEO Impact:** AI systems use creator information for source credibility assessment
- **Note:** May include multiple contributors with role specification
- **Required For:** SEO/GEO

#### 8. Date Created
- **Purpose:** Temporal context and content freshness signaling
- **Format:** ISO format (YYYY-MM-DD) with optional time (HH:MM:SS)
- **Metadata Location:**
  - EXIF DateTimeOriginal (camera-generated)
  - IPTC Date Created (manual entry)
- **Example:** `2025-02-22T14:30:00`
- **Why:** Signals content freshness; helps organize assets chronologically
- **GEO Impact:** Temporal data helps AI systems understand content currency
- **Required For:** SEO/GEO

#### 9. Web Statement of Rights
- **Purpose:** License and usage rights URL reference
- **Format:** Full URL to rights/licensing information
- **Metadata Location:** IPTC "Web Statement of Rights" / XMP "Copyright Info URL"
- **Example:** `https://example.com/image-licensing-terms`
- **Why:** Directs users and automated systems to proper licensing information
- **GEO Impact:** AI systems check rights statements before citation
- **Required For:** SEO/GEO

#### 10. Location Data (Critical for GEO)
- **Purpose:** Geographic relevance for local search and GEO systems
- **Format:** Hierarchical structure
- **Metadata Location:** IPTC Location Created / Location Shown fields
- **Requires:**
  - **Location Name:** Specific place (e.g., "Oslo City Center")
  - **Sublocation:** Specific area within location (e.g., "Karl Johans gate")
  - **City/Town:** City name
  - **State/Province:** County or region
  - **Country:** Full country name (not abbreviation)
  - **GPS Coordinates:** Latitude/Longitude (optional but powerful)
  
- **Example Structure:**
  ```
  Location: Oslo, Norway
  Sublocation: Securitas Office, Grünerløkka
  City: Oslo
  State/Province: Oslo County
  Country: Norway
  GPS: 59.9289° N, 10.7522° E
  ```

- **Why:** Essential for geographic ranking in traditional search and generative search
- **GEO Impact:** Foundational for GEO optimization; AI systems use location data for context and localization
- **Note:** GEO systems amplify the importance of complete location hierarchies
- **Required For:** GEO (increasingly important for SEO)

---

## Metadata Standards Reference

### EXIF (Exchangeable Image File Format)
- **Developed:** 1998 (JEITA/CIPA standard)
- **Best For:** Camera and technical image data
- **Contains:**
  - Camera make/model
  - Exposure settings (shutter speed, aperture, ISO)
  - Focal length
  - Date/time of capture
  - GPS coordinates (if camera has GPS)
  - Flash status
  - Thumbnail image
- **Technical Details:** Binary format, embedded natively in JPEG and TIFF
- **Limitations:** Character encoding limited to ASCII in most fields (UTF-8 violations by some devices)
- **Current Version:** EXIF 3.0 (2023)

### IPTC (International Press Telecommunications Council)
- **Developed:** Early 1990s, updated continuously (latest 2025.1)
- **Best For:** Editorial and professional metadata
- **Contains:**
  - Creator/author
  - Copyright and usage rights
  - Keywords and categories
  - Location information (hierarchical)
  - Title and description
  - Date created
  - Alt text (2021.1+)
  - Extended description for accessibility (2021.1+)
  - Contributor information (2022.1+)
  - Data mining restrictions (2023.1+)
- **Technical Details:** Available in two formats:
  - **IIM (legacy):** Binary structure, character limit 2000 bytes
  - **XMP:** Modern XML-based implementation
- **Current Standard:** IPTC Photo Metadata 2025.1

### XMP (Extensible Metadata Platform)
- **Developed:** Adobe 2002, now ISO 16684 standard
- **Best For:** Modern, flexible, interoperable metadata
- **Contains:**
  - Can represent EXIF, IPTC, and custom metadata
  - Post-processing information
  - Editing history (when used with Lightroom, Capture One, etc.)
  - Custom application-specific data
- **Technical Details:**
  - XML-based (human-readable)
  - Can be embedded in file or stored as sidecar (.xmp) file
  - Supports multiple languages per field
  - ISO standard since 2012
- **Advantages:** Non-destructive editing, better language support, more flexible
- **Caution:** Sidecar files must travel with image files to prevent metadata loss

---

## Implementation Approach

### Simple Approach (Small to Medium Teams)

**Best for:** Teams with <1000 images monthly, simpler workflows, limited budget

1. **Establish filename convention**
   - Format: `YYYY-MM-DD-[keyword]-[descriptor].jpg`
   - Example: `2025-02-22-security-training-oslo.jpg`

2. **Use DAM metadata templates** with these core IPTC fields:
   - Alt Text
   - Title
   - Description
   - Keywords
   - Creator
   - Copyright Notice
   - Date Created
   - Location (at minimum: City, Country)

3. **Embed metadata** into images when exporting from DAM
   - Most DAM systems automate this process
   - Ensure metadata is embedded, not just stored in DAM database

4. **CMS auto-extraction**
   - Configure website CMS to extract and use embedded metadata
   - Map metadata fields to HTML alt attributes, title tags, schema.org markup

**Scaling limitation:** Without standardization across metadata versions (EXIF/IPTC/XMP), metadata can diverge across different applications and platforms.

### Advanced Approach (Enterprise/Scaling)

**Best for:** Teams with >10,000 images, multi-regional operations, strict compliance needs, complex workflows

Implement all three metadata standards with synchronization:

1. **EXIF Management**
   - Preserve camera technical data
   - Verify GPS data accuracy and remove if sensitive
   - Use for temporal sorting and technical context

2. **IPTC Implementation**
   - Implement both IIM and XMP versions using IPTC mapping guidelines
   - Create automated synchronization between IIM and XMP
   - Use IPTC checksum to resolve conflicts when both formats present
   - Implement IPTC Extended Schema for additional properties
   - Use full location hierarchy structure

3. **XMP Management**
   - Use XMP sidecars for RAW workflows (non-destructive editing)
   - Embed XMP in final deliverables (JPEG, PNG)
   - Support multiple language versions per field for global distribution
   - Store processing history and version information

4. **Automation & Workflow**
   - Automated embedding via DAM system (Sitecore Content Hub, Extensis Portfolio)
   - Batch processing with ExifTool for bulk operations
   - Sync validation to prevent metadata divergence
   - Automated location geocoding from GPS coordinates

5. **Integration**
   - DAM to CMS integration for real-time metadata pulling
   - DAM to PIM (Product Information Management) for ecommerce
   - Automated schema.org structured data generation from metadata
   - Integration with CDN for performance optimization

---

## Nice-to-Have Custom Properties for DAM Organization

### Business & Brand Properties

| Property | Use Case | Recommended Values |
|---|---|---|
| Brand Category | Organize by business unit | "Security Services", "Technology", "Managed Services" |
| Campaign/Project ID | Link to marketing campaigns | Internal campaign code (e.g., "CAMP-2025-Q1-SECURE") |
| Product/Service Type | Map to service offerings | "Access Control", "Surveillance", "Guarding", "Risk Assessment" |
| Geographic Market | Multi-region strategy support | "Norway", "Nordics", "EMEA", "Global", "Local" |
| Industry Vertical | Target industry | "Banking", "Healthcare", "Retail", "Manufacturing" |

### Workflow & Status Properties

| Property | Use Case | Recommended Values |
|---|---|---|
| Approval Status | Workflow automation | "Draft", "Review", "Approved", "Archived", "Retired" |
| Version Number | Asset iteration tracking | Semantic versioning (1.0, 1.1, 2.0) |
| Review Date | Compliance and freshness | ISO date format |
| Last Modified By | Audit trail | User name or ID |

### Rights & Licensing Properties

| Property | Use Case | Recommended Values |
|---|---|---|
| Usage Rights | Prevent misuse | "Internal Only", "Customer-Facing", "Licensed Third-Party", "Public Domain" |
| Expiry Date | Automated archival | ISO date or campaign end date |
| License Type | Rights clarity | "All Rights Reserved", "Creative Commons", "Royalty-Free", "Limited License" |
| Third-Party Attribution | Credit requirements | "Required", "Optional", "None" |

### Distribution & Content Properties

| Property | Use Case | Recommended Values |
|---|---|---|
| Primary Channel | Platform targeting | "Website", "Social Media", "Email", "Print", "Video", "Presentation" |
| Content Type | Asset categorization | "Product Photo", "Lifestyle", "Infographic", "Data Visualization", "Team Photo", "Event" |
| Image Quality Level | Reuse discovery | "Hero Image", "Standard", "Thumbnail", "Social-Optimized" |
| Aspect Ratio | Multi-channel repurposing | "16:9", "1:1", "4:3", "9:16", "21:9" |

### Visual & Discovery Properties

| Property | Use Case | Recommended Values |
|---|---|---|
| Color Palette | Brand consistency & AI search | "Blue", "Red", "Neutral", "Minimal", "Corporate", "Vibrant" |
| Content Focus | Visual search optimization | "People", "Landscape", "Product", "Technical", "Abstract" |
| People Count | Demographic tagging | Numeric value or "Solo", "Small Group", "Large Group" |

### Securitas-Specific Properties

| Property | Use Case | Recommended Values |
|---|---|---|
| Securitas Brand Stream | One Securitas strategy | "Securitas AS", "Securitas Technology", "Unified" |
| Regional Compliance | Multi-region requirements | "Norway Standard", "EU Compliant", "GDPR Verified", "No Restrictions" |
| Partner/Agency Credit | Vendor attribution | Agency name or partner identifier |
| Localization Status | Global rollout tracking | "Global Version", "Norway Adapted", "Nordics Adapted", "Pending Localization" |
| Performance Metric Link | Data-driven reuse | Campaign performance ID or analytics link |

---

## Metadata Standards Comparison Table

| Aspect | EXIF | IPTC | XMP |
|---|---|---|---|
| **Origin** | 1998 (JEITA/CIPA) | 1990s (updated 2025) | 2002 Adobe, ISO 16684 |
| **Primary Use** | Camera technical data | Editorial & professional | Modern, flexible metadata |
| **Character Support** | ASCII primarily | UTF-8 (with limitations) | Full UTF-8 & multilingual |
| **File Size Impact** | Minimal | Moderate | Moderate (XML overhead) |
| **Embedded vs Sidecar** | Embedded only | Embedded (IIM) or XMP | Both supported |
| **Language Support** | Single value | Single value | Multiple languages per field |
| **Best For Editing** | Fixed data | Professional workflows | Non-destructive editing |
| **Current Version** | 3.0 (2023) | 2025.1 | ISO 16684-1 |
| **Standard Format** | Binary | IIM (binary) / XMP (XML) | XML (sidecar or embedded) |

---

## Implementation Best Practices

### Metadata Entry & Quality

1. **Consistency:** Use standardized templates and controlled vocabularies
2. **Completeness:** Fill all required fields before publishing
3. **Accuracy:** Verify geographic data (especially location hierarchies)
4. **Sensitivity:** Remove personal information, GPS data if sensitive
5. **Language:** Use consistent language across regions (or use multilingual XMP)

### File Format Considerations

| Format | EXIF Support | IPTC Support | XMP Support | Notes |
|---|---|---|---|---|
| JPEG | Native | Native (IIM) | Native | Most common web format |
| TIFF | Native | Native (IIM) | Native | Best for archival |
| PNG | Limited | No | Yes | Web-friendly, transparency |
| GIF | No | No | Limited | Animated/legacy use |
| WebP | No | No | Limited | Modern web format |
| RAW | Format-specific | No | Sidecar | Professional photography |

### Tools for Metadata Management

**Command Line (Advanced Users):**
- ExifTool: Most comprehensive, scriptable metadata editor
- Exiv2: Alternative command-line metadata utility

**Professional DAM Systems:**
- Sitecore Content Hub: Enterprise DAM with automation
- Extensis Portfolio: Media asset management
- Adobe Experience Manager (AEM)

**Photography Software:**
- Adobe Lightroom: Robust IPTC/XMP support
- Capture One: Professional metadata handling
- Darktable: Open-source with XMP sidecar support

**General Tools:**
- ACDSee Pro: EXIF/IPTC/XMP editing
- Photo Mechanic: Photo journalist-focused
- Windows/Mac file properties (basic metadata only)

---

## GEO Optimization (Generative Engine Optimization)

### Why GEO Differs from SEO

Generative AI systems (ChatGPT, Google Gemini, etc.) have different requirements:

1. **Metadata is Critical:** Unlike traditional search where ranking algorithms consider many signals, AI systems heavily rely on clean, complete metadata
2. **Location Context Amplified:** GEO systems prioritize geographic location data for context and source credibility
3. **Accessibility First:** Alt text and descriptions are essential because AI systems use them for understanding when image recognition is uncertain
4. **Source Attribution:** Creator and rights information influence whether AI systems cite your content
5. **Complete Descriptions:** Longer, more detailed descriptions help AI systems synthesize better answers

### GEO-Specific Metadata Checklist

- [ ] Alt text completed and accurate (125 chars)
- [ ] Extended description provided (full context for AI understanding)
- [ ] Location hierarchy complete (City, State/Province, Country minimum)
- [ ] GPS coordinates included if available
- [ ] Creator and copyright clearly stated
- [ ] Web statement of rights includes proper URL
- [ ] Date created accurate and in ISO format
- [ ] Description detailed enough for answer synthesis (100+ words recommended)
- [ ] Keywords match user intent for discovery
- [ ] No conflicting metadata between EXIF/IPTC/XMP

---

## Common Pitfalls to Avoid

1. **Inconsistent Location Formatting:** Use full names, not abbreviations (e.g., "Oslo County" not "O")
2. **Metadata Divergence:** EXIF, IPTC, and XMP showing different values—use IPTC mapping guidelines
3. **Incomplete Location Hierarchy:** City without country; country without city
4. **Sensitive Data:** GPS coordinates or personal information left in metadata before public sharing
5. **Generic Descriptions:** "Image" or "Photo" instead of specific, searchable descriptions
6. **Multiple Creators Without Role:** Specify "Photography: Name" vs "Design: Name"
7. **Outdated URLs:** Links in Web Statement of Rights that 404
8. **No Alt Text:** Skipping accessibility fields affects both SEO and GEO
9. **Filename vs Title Confusion:** Using same value for both; should be complementary
10. **Sidecar Separation:** XMP sidecars separated from RAW files during transfer

---

## Securitas-Specific Recommendations

For implementing "One Securitas" brand strategy across regional markets:

### Priority Implementation Order

1. **Phase 1 (Immediate):**
   - Establish naming convention across all regional teams
   - Implement core 10 required properties (Alt Text through Location)
   - Set up template in DAM for consistency

2. **Phase 2 (30 days):**
   - Add Securitas-specific custom properties (Brand Stream, Regional Compliance)
   - Train regional teams on metadata entry
   - Implement approval workflow with metadata validation

3. **Phase 3 (60 days):**
   - Automate DAM to CMS metadata extraction
   - Implement location geocoding for GPS coordinates
   - Begin GEO optimization with full descriptions and extended metadata

4. **Phase 4 (90+ days):**
   - Implement advanced EXIF/IPTC/XMP synchronization
   - Set up performance tracking (link metadata to campaign metrics)
   - Establish quarterly metadata audit process

### Multi-Regional Considerations

- Use IPTC multilingual fields (XMP) for content in Norwegian, English, Swedish, Danish
- Store regional compliance metadata (GDPR verification, local requirements)
- Track localization status to prevent global version use in localized contexts
- Implement location-specific sub-folders or tagging for regional asset discovery

---

## Document Information

- **Version:** 1.0
- **Last Updated:** February 2025
- **Compliance Standards:** IPTC Photo Metadata 2025.1, EXIF 3.0, ISO 16684 (XMP)
- **Applicability:** Securitas Norge Digital Marketing
- **Scope:** DAM for web and digital marketing asset management

---

## References

- IPTC Photo Metadata Standard 2025.1: https://www.iptc.org/std/photometadata/
- EXIF Standard 3.0: CIPA/JEITA specification
- ISO 16684-1 (XMP): International Organization for Standardization
- Google Search Central: Image best practices
- IPTC Photo Metadata Mapping Guidelines: https://iptc.org/std/photometadata/documentation/mappingguidelines/
- Metadata Working Group Guidelines: Handling EXIF/IPTC/XMP synchronization