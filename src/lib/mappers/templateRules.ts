import type { TemplateRule } from "@/types/scheduling";
import type { UUID } from "@/types/common";

type DbTemplateRule = {
  id: string;
  department: TemplateRule["department"];
  position: TemplateRule["position"];
  weekdays: string[];
  startTimeLocal: string;
  endTimeLocal: string;
  slots: number;
  active: boolean;
};

export function toTemplateRule(rule: DbTemplateRule): TemplateRule {
  return {
    id: rule.id as UUID,
    department: rule.department,
    position: rule.position,
    weekdays: rule.weekdays as TemplateRule["weekdays"],
    startTimeLocal: rule.startTimeLocal as TemplateRule["startTimeLocal"],
    endTimeLocal: rule.endTimeLocal as TemplateRule["endTimeLocal"],
    slots: rule.slots,
    active: rule.active,
  };
}

export function toTemplateRules(rules: DbTemplateRule[]): TemplateRule[] {
  return rules.map(toTemplateRule);
}
