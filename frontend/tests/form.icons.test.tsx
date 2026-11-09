import { describe, it, expect } from "vitest";
import React from "react";
import {
  UserIcon,
  PhoneIcon,
  MailIcon,
  LockIcon,
  CalendarIcon,
  ClockIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CloseIcon,
  FileTextIcon,
  TagIcon,
  UsersIcon,
  SearchIcon,
  SendIcon,
} from "@/components/shared/FormIcons";

describe("FormIcons component rendering", () => {
  it("renders all SVG form icons without errors", () => {
    const icons = [
      UserIcon,
      PhoneIcon,
      MailIcon,
      LockIcon,
      CalendarIcon,
      ClockIcon,
      SparklesIcon,
      ChevronDownIcon,
      ChevronRightIcon,
      CheckIcon,
      CheckCircleIcon,
      AlertCircleIcon,
      CloseIcon,
      FileTextIcon,
      TagIcon,
      UsersIcon,
      SearchIcon,
      SendIcon,
    ];

    for (const Icon of icons) {
      const el = React.createElement(Icon, { size: 20, className: "test-icon" });
      expect(el).toBeDefined();
      expect(el.props.size).toBe(20);
      expect(el.props.className).toBe("test-icon");
    }
  });
});
