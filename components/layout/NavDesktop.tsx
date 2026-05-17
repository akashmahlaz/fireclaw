"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

type DropdownItem = { name: string; desc: string; href: string }
type DropdownSection = { title: string; items: DropdownItem[] }
type DropdownDef = { sections: DropdownSection[] }

const navItems: Array<{ label: string; href?: string; dropdown?: DropdownDef }> = [
  {
    label: "Platform",
    dropdown: {
      sections: [
        {
          title: "Deploy",
          items: [
            { name: "Agent Templates", desc: "Ready-made agents for business workflows", href: "#agent-templates" },
            { name: "Managed AI", desc: "MiniMax included by default, no user API key required", href: "#how-it-works" },
            { name: "Simple Plans", desc: "Pricing by deployed agents and usage limits", href: "#pricing" },
          ],
        },
        {
          title: "Manage",
          items: [
            { name: "Dashboard", desc: "Monitor deployed agents and provisioning logs", href: "/dashboard" },
            { name: "Custom Agents", desc: "Founder-led builds for your exact workflow", href: "#custom-agents" },
            { name: "Roadmap", desc: "Channels, workflow templates, and marketplace direction", href: "#features" },
          ],
        },
      ],
    },
  },
  {
    label: "Solutions",
    dropdown: {
      sections: [
        {
          title: "Use Cases",
          items: [
            { name: "Agencies", desc: "Deploy agents for multiple clients from one dashboard", href: "#features" },
            { name: "Small Teams", desc: "Automate support, research, content, and document work", href: "#features" },
            { name: "Support Teams", desc: "Start with a customer support agent template", href: "#agent-templates" },
          ],
        },
        {
          title: "Future App Deploys",
          items: [
            { name: "Express", desc: "Straightforward backend Docker template", href: "#faq" },
            { name: "Next.js", desc: "Docker-first app deploy template path", href: "#faq" },
            { name: "WordPress", desc: "Supportable as a separate managed app product", href: "#faq" },
          ],
        },
      ],
    },
  },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "/docs" },
]

// Subtle icon per dropdown section for visual polish
const sectionIcons: Record<string, string> = {
  "Agent Templates": "⬡",
  "Managed AI": "◈",
  "Simple Plans": "◇",
  Dashboard: "▦",
  "Custom Agents": "◉",
  Roadmap: "◎",
  Agencies: "▣",
  "Small Teams": "◫",
  "Support Teams": "◧",
  Express: "▷",
  "Next.js": "▸",
  WordPress: "▹",
}

export function NavDesktop() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(label)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150)
  }

  return (
    <>
      {/* Inject styles once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap');

        .nav-desktop-root {
          font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 4px;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: #3f3f46;
          transition: color 0.15s ease;
          white-space: nowrap;
          background: none;
          border: none;
          cursor: pointer;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #09090b;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1.5px;
          background: #09090b;
          border-radius: 99px;
          transform: scaleX(0);
          transition: transform 0.15s ease;
          transform-origin: center;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          transform: scaleX(1);
        }

        .nav-chevron {
          width: 13px;
          height: 13px;
          stroke-width: 2.2px;
          color: #a1a1aa;
          transition: transform 0.2s ease, color 0.15s ease;
          flex-shrink: 0;
        }

        .nav-link.active .nav-chevron,
        .nav-link:hover .nav-chevron {
          color: #09090b;
        }

        .nav-chevron.open {
          transform: rotate(180deg);
        }

        /* Dropdown panel */
        .dropdown-panel {
          position: absolute;
          left: 50%;
          top: calc(100% + 10px);
          transform: translateX(-50%);
          min-width: 520px;
          background: #ffffff;
          border: 1px solid #e4e4e7;
          border-radius: 12px;
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.04),
            0 4px 6px -1px rgba(0,0,0,0.06),
            0 16px 32px -4px rgba(0,0,0,0.10);
          padding: 6px;
          overflow: hidden;
        }

        /* Arrow tip */
        .dropdown-arrow {
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 9px;
          height: 9px;
          background: #ffffff;
          border-left: 1px solid #e4e4e7;
          border-top: 1px solid #e4e4e7;
          border-radius: 2px 0 0 0;
        }

        .dropdown-grid {
          display: grid;
          gap: 2px;
        }

        .dropdown-grid.two-col {
          grid-template-columns: 1fr 1fr;
        }

        .dropdown-section {
          padding: 10px 4px 6px;
        }

        .dropdown-section-divider {
          position: relative;
        }

        .dropdown-section-divider::before {
          content: '';
          position: absolute;
          left: 4px;
          right: 0;
          top: 0;
          bottom: 0;
          border-left: 1px solid #f4f4f5;
        }

        .section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #a1a1aa;
          padding: 0 10px 8px;
        }

        .dropdown-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.12s ease;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background: #fafafa;
        }

        .item-icon {
          margin-top: 1px;
          font-size: 14px;
          line-height: 1;
          color: #d4d4d8;
          width: 18px;
          text-align: center;
          flex-shrink: 0;
          transition: color 0.12s ease;
          font-style: normal;
        }

        .dropdown-item:hover .item-icon {
          color: #a1a1aa;
        }

        .item-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .item-name {
          font-size: 13px;
          font-weight: 500;
          color: #18181b;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }

        .item-desc {
          font-size: 11.5px;
          color: #a1a1aa;
          line-height: 1.45;
          font-weight: 400;
        }

        /* Separator line inside grid */
        .grid-separator {
          width: 1px;
          background: #f4f4f5;
          margin: 10px 0;
        }
      `}</style>

      <nav className="nav-desktop-root hidden items-center gap-1 md:flex">
        {navItems.map((item) =>
          item.dropdown ? (
            <div
              key={item.label}
              style={{ position: "relative" }}
              onMouseEnter={() => handleEnter(item.label)}
              onMouseLeave={handleLeave}
            >
              <button className={`nav-link ${activeDropdown === item.label ? "active" : ""}`}>
                {item.label}
                <ChevronDown className={`nav-chevron ${activeDropdown === item.label ? "open" : ""}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                    className="dropdown-panel"
                    onMouseEnter={() => handleEnter(item.label)}
                    onMouseLeave={handleLeave}
                  >
                    <div className="dropdown-arrow" />

                    <div className={`dropdown-grid ${item.dropdown.sections.length > 1 ? "two-col" : ""}`}>
                      {item.dropdown.sections.map((section, si) => (
                        <div
                          key={section.title}
                          className={`dropdown-section ${si > 0 ? "dropdown-section-divider" : ""}`}
                          style={si > 0 ? { paddingLeft: 14 } : {}}
                        >
                          <p className="section-label">{section.title}</p>
                          <div>
                            {section.items.map((di) => (
                              <Link
                                key={di.name}
                                href={di.href}
                                className="dropdown-item"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <i className="item-icon">{sectionIcons[di.name] ?? "·"}</i>
                                <span className="item-text">
                                  <span className="item-name">{di.name}</span>
                                  <span className="item-desc">{di.desc}</span>
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link key={item.label} href={item.href ?? "#"} className="nav-link">
              {item.label}
            </Link>
          ),
        )}
      </nav>
    </>
  )
}