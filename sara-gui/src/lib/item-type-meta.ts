/**
 * Visual coding for item types: a Lucide icon and a design-token color name per
 * built-in type, with a neutral fallback for custom schema types. The color
 * name matches the `--color-type-*` tokens exposed to Tailwind (so
 * `text-type-solution`, `bg-type-adr`, … resolve).
 */

import {
  Boxes,
  UsersRound,
  Route,
  ListChecks,
  Network,
  Cpu,
  Braces,
  CircuitBoard,
  FileCode2,
  Scale,
  FileQuestion,
  type LucideIcon,
} from "lucide-react";

export interface TypeVisual {
  icon: LucideIcon;
  /** Tailwind color token stem, e.g. `type-solution`. */
  color: string;
}

const VISUALS: Record<string, TypeVisual> = {
  solution: { icon: Boxes, color: "type-solution" },
  use_case: { icon: UsersRound, color: "type-use-case" },
  scenario: { icon: Route, color: "type-scenario" },
  system_requirement: { icon: ListChecks, color: "type-system-req" },
  system_architecture: { icon: Network, color: "type-system-arch" },
  hardware_requirement: { icon: Cpu, color: "type-hardware-req" },
  software_requirement: { icon: Braces, color: "type-software-req" },
  hardware_detailed_design: { icon: CircuitBoard, color: "type-hardware-dd" },
  software_detailed_design: { icon: FileCode2, color: "type-software-dd" },
  architecture_decision_record: { icon: Scale, color: "type-adr" },
};

const FALLBACK: TypeVisual = { icon: FileQuestion, color: "type-fallback" };

export function typeVisual(typeId: string): TypeVisual {
  return VISUALS[typeId] ?? FALLBACK;
}
