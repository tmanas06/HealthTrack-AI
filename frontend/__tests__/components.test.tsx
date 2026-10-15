import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { Disclaimer } from "@/components/Disclaimer";
import { ScoreBar } from "@/components/ScoreBar";
import { ConditionCard } from "@/components/ConditionCard";
import { SymptomSelector } from "@/components/SymptomSelector";

describe("Frontend Components", () => {
  describe("Disclaimer", () => {
    it("renders medical disclaimer alert and key guidance", () => {
      render(<Disclaimer />);
      expect(screen.getByText(/Educational Prototype Only/i)).toBeInTheDocument();
      expect(screen.getByText(/Always consult a qualified healthcare professional/i)).toBeInTheDocument();
      expect(screen.getByText(/call your local emergency services/i)).toBeInTheDocument();
    });
  });

  describe("ScoreBar", () => {
    it("renders score progressbar and percentage value", () => {
      render(<ScoreBar score={0.854} rank={1} />);
      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toBeInTheDocument();
      expect(progressbar).toHaveAttribute("aria-valuenow", "85");
      expect(screen.getByText(/85%/)).toBeInTheDocument();
    });
  });

  describe("ConditionCard", () => {
    it("renders condition details, precautions, and matching symptoms", () => {
      const candidate = {
        rank: 1,
        condition: "Migraine",
        score: 0.88,
        score_label: "High Match",
        description: "A neurological condition causing headaches.",
        precautions: ["rest in quiet room", "stay hydrated", "avoid bright lights"],
        matching_symptoms: ["headache", "nausea"],
      };

      render(<ConditionCard candidate={candidate} />);
      expect(screen.getByText("Migraine")).toBeInTheDocument();
      expect(screen.getByText(/88%/)).toBeInTheDocument();
      expect(screen.getByText("#1")).toBeInTheDocument();
      expect(screen.getByText("A neurological condition causing headaches.")).toBeInTheDocument();
      expect(screen.getByText("rest in quiet room")).toBeInTheDocument();
      expect(screen.getByText("stay hydrated")).toBeInTheDocument();
      expect(screen.getByText("Headache")).toBeInTheDocument();
      expect(screen.getByText("Nausea")).toBeInTheDocument();
    });

    it("displays urgency badge for critical conditions", () => {
      const candidate = {
        rank: 1,
        condition: "Heart attack",
        score: 0.95,
        score_label: "Very High",
        description: "Emergency cardiovascular condition.",
        precautions: ["call ambulance immediately"],
        matching_symptoms: ["chest_pain"],
      };

      render(<ConditionCard candidate={candidate} />);
      expect(screen.getByText("Seek care")).toBeInTheDocument();
    });
  });

  describe("SymptomSelector", () => {
    const symptoms = ["itching", "skin_rash", "chills", "joint_pain", "fatigue"];

    it("renders selected symptoms and opens search dropdown on focus/typing", () => {
      const onAdd = vi.fn();
      const onRemove = vi.fn();

      render(
        <SymptomSelector
          allSymptoms={symptoms}
          selected={["itching"]}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      );

      // Selected tag is visible inside selected symptoms list
      expect(screen.getByText(/Selected symptoms/i)).toBeInTheDocument();
      const selectedList = screen.getByRole("list", { name: "Selected symptoms" });
      expect(within(selectedList).getByText("Itching")).toBeInTheDocument();

      // Search input filters symptoms
      const input = screen.getByPlaceholderText(/type to search symptoms/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "rash" } });

      const dropdown = screen.getByRole("listbox", { name: "Symptom suggestions" });
      expect(within(dropdown).getByText("Skin Rash")).toBeInTheDocument();
      expect(within(dropdown).queryByText("Joint Pain")).not.toBeInTheDocument();
    });

    it("triggers onAdd when an unselected symptom is clicked from dropdown", () => {
      const onAdd = vi.fn();
      const onRemove = vi.fn();

      render(
        <SymptomSelector
          allSymptoms={symptoms}
          selected={[]}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      );

      const input = screen.getByPlaceholderText(/type to search symptoms/i);
      fireEvent.focus(input);

      const dropdown = screen.getByRole("listbox", { name: "Symptom suggestions" });
      const symptomOption = within(dropdown).getByText("Skin Rash");
      fireEvent.click(symptomOption);
      expect(onAdd).toHaveBeenCalledWith("skin_rash");
    });

    it("triggers onRemove when a selected tag remove button is clicked", () => {
      const onAdd = vi.fn();
      const onRemove = vi.fn();

      render(
        <SymptomSelector
          allSymptoms={symptoms}
          selected={["itching"]}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      );

      const removeBtn = screen.getByRole("button", { name: /Remove Itching/i });
      fireEvent.click(removeBtn);
      expect(onRemove).toHaveBeenCalledWith("itching");
    });
  });
});
