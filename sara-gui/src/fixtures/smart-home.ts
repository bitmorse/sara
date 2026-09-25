import type {
  CommitInfo,
  CoverageReport,
  FileDiff,
  FileStatus,
  ItemContent,
  ItemDetail,
  ValidationReport,
} from "@/types/domain";

/** Fixture repo root (mirrors the real example under examples/smart-home). */
export const REPO_ROOT = "/Users/you/projects/smart-home";

/**
 * The smart-home knowledge graph as GUI DTOs. Content is lifted verbatim from
 * `examples/smart-home/**` so Storybook shows real, connected requirements.
 */
export const items: ItemDetail[] = [
  {
    id: "SOL-001",
    type: "solution",
    name: "Smart Home Control System",
    filePath: "solutions/SOL-SMARTHOME.md",
    repository: REPO_ROOT,
    description:
      "Centralized home automation platform for controlling lights, thermostats, and security devices",
    attributes: [],
    relationships: [],
  },
  {
    id: "UC-001",
    type: "use_case",
    name: "Lighting Control",
    filePath: "use_cases/UC-LIGHTS.md",
    repository: REPO_ROOT,
    description: "Control and automate smart lighting throughout the home",
    attributes: [],
    relationships: [{ relation: "refines", targetId: "SOL-001", direction: "upstream" }],
  },
  {
    id: "UC-002",
    type: "use_case",
    name: "Security Monitoring",
    filePath: "use_cases/UC-SECURITY.md",
    repository: REPO_ROOT,
    description:
      "Monitor and manage home security devices including cameras and door sensors",
    attributes: [],
    relationships: [{ relation: "refines", targetId: "SOL-001", direction: "upstream" }],
  },
  {
    id: "SCEN-001",
    type: "scenario",
    name: "Dimmer Adjustment",
    filePath: "scenarios/SCEN-DIMMER.md",
    repository: REPO_ROOT,
    description: "Homeowner adjusts a light's brightness from the mobile app",
    attributes: [],
    relationships: [{ relation: "refines", targetId: "UC-001", direction: "upstream" }],
  },
  {
    id: "SCEN-002",
    type: "scenario",
    name: "Door Sensor Triggered While Away",
    filePath: "scenarios/SCEN-INTRUSION.md",
    repository: REPO_ROOT,
    description: "System detects door opening while homeowner is away and armed",
    attributes: [],
    relationships: [{ relation: "refines", targetId: "UC-002", direction: "upstream" }],
  },
  {
    id: "SYSREQ-001",
    type: "system_requirement",
    name: "Device Command Latency",
    filePath: "system_requirements/SYSREQ-LATENCY.md",
    repository: REPO_ROOT,
    description: "Maximum allowed latency for device control commands",
    attributes: [
      {
        name: "specification",
        displayName: "Specification",
        fieldType: "text",
        value: "The system SHALL deliver device commands within 500ms of user action",
      },
    ],
    relationships: [{ relation: "derives_from", targetId: "SCEN-001", direction: "upstream" }],
  },
  {
    id: "SYSREQ-002",
    type: "system_requirement",
    name: "Security Alert Delivery",
    filePath: "system_requirements/SYSREQ-ALERT.md",
    repository: REPO_ROOT,
    description: "Timely delivery of security alerts to users",
    attributes: [
      {
        name: "specification",
        displayName: "Specification",
        fieldType: "text",
        value:
          "The system SHALL deliver security alerts to user devices within 5 seconds of event detection",
      },
    ],
    relationships: [
      { relation: "derives_from", targetId: "SCEN-002", direction: "upstream" },
      { relation: "depends_on", targetId: "SYSREQ-001", direction: "peer" },
    ],
  },
  {
    id: "SYSARCH-001",
    type: "system_architecture",
    name: "Communication Architecture",
    filePath: "system_architecture/SYSARCH-COMM.md",
    repository: REPO_ROOT,
    description: "System architecture for device communication and alert delivery",
    attributes: [
      {
        name: "platform",
        displayName: "Platform",
        fieldType: "text",
        value: "Central hub (MQTT broker) + cloud gateway",
      },
    ],
    relationships: [
      { relation: "satisfies", targetId: "SYSREQ-001", direction: "upstream" },
      { relation: "satisfies", targetId: "SYSREQ-002", direction: "upstream" },
    ],
  },
  {
    id: "HWREQ-001",
    type: "hardware_requirement",
    name: "Zigbee Radio Module",
    filePath: "hardware_requirements/HWREQ-ZIGBEE.md",
    repository: REPO_ROOT,
    description: "Zigbee 3.0 radio for device-to-hub mesh networking",
    attributes: [
      {
        name: "specification",
        displayName: "Specification",
        fieldType: "text",
        value: "The hub SHALL include an IEEE 802.15.4 Zigbee 3.0 radio module",
      },
    ],
    relationships: [{ relation: "derives_from", targetId: "SYSARCH-001", direction: "upstream" }],
  },
  {
    id: "HWREQ-002",
    type: "hardware_requirement",
    name: "Central Hub Hardware",
    filePath: "hardware_requirements/HWREQ-HUB.md",
    repository: REPO_ROOT,
    description: "Compute and connectivity specification for the central hub",
    attributes: [
      {
        name: "specification",
        displayName: "Specification",
        fieldType: "text",
        value: "The hub SHALL provide Ethernet, dual-band WiFi and >= 1GB RAM",
      },
    ],
    relationships: [{ relation: "derives_from", targetId: "SYSARCH-001", direction: "upstream" }],
  },
  {
    id: "SWREQ-001",
    type: "software_requirement",
    name: "MQTT Client Library",
    filePath: "software_requirements/SWREQ-MQTTCLIENT.md",
    repository: REPO_ROOT,
    description: "Software requirement for the embedded MQTT client implementation",
    attributes: [
      {
        name: "specification",
        displayName: "Specification",
        fieldType: "text",
        value:
          "The device firmware SHALL implement an MQTT 3.1.1 compliant client with TLS, QoS 0/1/2 and automatic reconnection",
      },
    ],
    relationships: [{ relation: "derives_from", targetId: "SYSARCH-001", direction: "upstream" }],
  },
  {
    id: "SWREQ-002",
    type: "software_requirement",
    name: "Push Notification SDK Integration",
    filePath: "software_requirements/SWREQ-PUSHSDK.md",
    repository: REPO_ROOT,
    description: "Integration of FCM/APNs push SDKs for alert delivery",
    attributes: [
      {
        name: "specification",
        displayName: "Specification",
        fieldType: "text",
        value: "The cloud service SHALL route alerts through FCM and APNs within 2 seconds",
      },
    ],
    relationships: [
      { relation: "derives_from", targetId: "SYSARCH-001", direction: "upstream" },
      { relation: "depends_on", targetId: "SWREQ-001", direction: "peer" },
    ],
  },
  {
    id: "SWDD-001",
    type: "software_detailed_design",
    name: "MQTT Protocol Design",
    filePath: "detailed_design/SWDD-MQTT.md",
    repository: REPO_ROOT,
    description: "Detailed design of the MQTT topic hierarchy and reconnection logic",
    attributes: [],
    relationships: [{ relation: "satisfies", targetId: "SWREQ-001", direction: "upstream" }],
  },
  {
    id: "HWDD-001",
    type: "hardware_detailed_design",
    name: "Hub Board Design",
    filePath: "detailed_design/HWDD-HUBBOARD.md",
    repository: REPO_ROOT,
    description: "PCB layout and component selection for the central hub board",
    attributes: [],
    relationships: [{ relation: "satisfies", targetId: "HWREQ-002", direction: "upstream" }],
  },
  {
    id: "ADR-001",
    type: "architecture_decision_record",
    name: "Hub-Based Hybrid Architecture",
    filePath: "adrs/ADR-HYBRIDHUB.md",
    repository: REPO_ROOT,
    description:
      "Decision to use a local hub-based architecture with cloud connectivity rather than pure cloud-only or local-only.",
    attributes: [
      { name: "status", displayName: "Status", fieldType: "enum", value: "accepted" },
      {
        name: "deciders",
        displayName: "Deciders",
        fieldType: "list",
        value: ["Smart Home Architecture Team"],
      },
    ],
    relationships: [{ relation: "justifies", targetId: "SYSARCH-001", direction: "upstream" }],
  },
];

/** Markdown body (no frontmatter) per item, for the editor. */
export const bodies: Record<string, ItemContent> = {
  "SOL-001": {
    frontmatter: [
      'id: "SOL-001"',
      "type: solution",
      'name: "Smart Home Control System"',
      "description: >",
      "  Centralized home automation platform for controlling lights, thermostats,",
      "  and security devices",
    ].join("\n"),
    body: `# Solution: Smart Home Control System

## Overview

A unified platform enabling homeowners to monitor and control their smart
devices from a single interface. The system supports voice commands, scheduled
automation, and remote access via mobile app.

## Goals & KPIs

- **Goal**: Simplify smart home management
    - *KPI*: Reduce average apps per household from 5+ to 1
- **Goal**: Deliver energy savings through automation
    - *KPI*: Average 23% reduction in utility bills

![System overview](assets/overview.png)
`,
  },
  "SYSARCH-001": {
    frontmatter: [
      'id: "SYSARCH-001"',
      "type: system_architecture",
      'name: "Communication Architecture"',
      "satisfies:",
      '  - "SYSREQ-001"',
      '  - "SYSREQ-002"',
    ].join("\n"),
    body: `# Communication Architecture

## Components

### Local Communication Layer

- MQTT broker running on central hub
- Zigbee mesh network for device-to-hub communication
- Local processing for sub-500ms command latency

\`\`\`mermaid
sequenceDiagram
    participant App as Mobile App
    participant Hub as Central Hub
    participant Device as Smart Device
    App->>Hub: Send command
    Hub->>Device: Deliver (Zigbee)
    Device->>Hub: Acknowledge
    Hub->>App: Command confirmed
\`\`\`
`,
  },
  "SYSREQ-001": {
    frontmatter: [
      'id: "SYSREQ-001"',
      "type: system_requirement",
      'name: "Device Command Latency"',
      "specification: >",
      "  The system SHALL deliver device commands within 500ms of user action",
      "derives_from:",
      '  - "SCEN-001"',
    ].join("\n"),
    body: `# Device Command Latency

Commands sent to devices must be delivered with minimal delay to ensure
responsive user experience.

## Verification

- Measure round-trip time from button press to device state change
- 95th percentile must be under 500ms on local network
`,
  },
};

/** Working-tree status, as VS Code's Source Control view would show it. */
export const gitStatus: FileStatus[] = [
  { path: "system_requirements/SYSREQ-LATENCY.md", staged: false, kind: "modified" },
  { path: "software_requirements/SWREQ-PUSHSDK.md", staged: true, kind: "modified" },
  { path: "adrs/ADR-OAUTH.md", staged: false, kind: "untracked" },
  { path: "scenarios/SCEN-OLD.md", staged: false, kind: "deleted" },
];

export const branch = { name: "main", ahead: 2, behind: 0, detached: false };

export const commits: CommitInfo[] = [
  {
    sha: "9f3c1a2b8e7d6c5f4a3b2c1d0e9f8a7b6c5d4e3f",
    shortSha: "9f3c1a2",
    author: "Sam Sulaimanov",
    email: "sam@octanis.ch",
    date: "2026-09-22T14:12:00Z",
    summary: "feat(sysreq): tighten command latency budget to 500ms",
  },
  {
    sha: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    shortSha: "1a2b3c4",
    author: "Sam Sulaimanov",
    email: "sam@octanis.ch",
    date: "2026-09-20T09:41:00Z",
    summary: "docs(latency): add verification method and rationale",
  },
  {
    sha: "abcdef0123456789abcdef0123456789abcdef01",
    shortSha: "abcdef0",
    author: "A. Reviewer",
    email: "reviewer@example.com",
    date: "2026-09-18T17:03:00Z",
    summary: "chore: initial import of latency requirement",
  },
];

/** A unified diff for SYSREQ-LATENCY.md (working tree vs HEAD). */
export const sampleDiff: FileDiff = {
  path: "system_requirements/SYSREQ-LATENCY.md",
  binary: false,
  lines: [
    { kind: "hunk", text: "@@ -5,7 +5,7 @@ specification: >" },
    { kind: "context", oldNo: 5, newNo: 5, text: "specification: >" },
    {
      kind: "remove",
      oldNo: 6,
      text: "  The system SHALL deliver device commands within 800ms of user action",
    },
    {
      kind: "add",
      newNo: 6,
      text: "  The system SHALL deliver device commands within 500ms of user action",
    },
    { kind: "context", oldNo: 7, newNo: 7, text: "derives_from:" },
    { kind: "context", oldNo: 8, newNo: 8, text: '  - "SCEN-001"' },
  ],
};

/** Validation report with a couple of intentional issues for the panel. */
export const validationReport: ValidationReport = {
  valid: false,
  itemsChecked: items.length,
  relationshipsChecked: 14,
  itemsByType: items.reduce<Record<string, number>>((acc, it) => {
    acc[it.type] = (acc[it.type] ?? 0) + 1;
    return acc;
  }, {}),
  issues: [
    {
      severity: "error",
      rule: "broken-reference",
      message: 'SWREQ-002 references "SWREQ-999" via depends_on, which does not exist',
      itemId: "SWREQ-002",
    },
    {
      severity: "warning",
      rule: "orphan-item",
      message: "HWDD-001 has no downstream coverage",
      itemId: "HWDD-001",
    },
    {
      severity: "warning",
      rule: "id-format",
      message: 'ADR-001 id "ADR-001" is fine, but ADR-OAUTH does not match {prefix}-{seq:03}',
      itemId: "ADR-001",
    },
  ],
};

export const coverageReport: CoverageReport = {
  overallCoverage: 72,
  totalItems: items.length,
  completeItems: Math.round(items.length * 0.72),
  byType: [
    { type: "solution", total: 1, complete: 1, coveragePercent: 100 },
    { type: "use_case", total: 2, complete: 2, coveragePercent: 100 },
    { type: "scenario", total: 2, complete: 2, coveragePercent: 100 },
    { type: "system_requirement", total: 2, complete: 2, coveragePercent: 100 },
    { type: "system_architecture", total: 1, complete: 1, coveragePercent: 100 },
    { type: "hardware_requirement", total: 2, complete: 1, coveragePercent: 50 },
    { type: "software_requirement", total: 2, complete: 2, coveragePercent: 100 },
    { type: "hardware_detailed_design", total: 1, complete: 0, coveragePercent: 0 },
    { type: "software_detailed_design", total: 1, complete: 1, coveragePercent: 100 },
    { type: "architecture_decision_record", total: 1, complete: 1, coveragePercent: 100 },
  ],
};
