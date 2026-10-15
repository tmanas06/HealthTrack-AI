import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getSymptoms, predict, checkHealth } from "@/lib/api";

describe("Frontend API Client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getSymptoms fetches list of symptoms", async () => {
    const mockSymptoms = { symptoms: ["itching", "skin_rash", "fatigue"] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSymptoms,
    } as Response);

    const result = await getSymptoms();
    expect(result).toEqual(mockSymptoms);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/symptoms"),
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("predict sends symptom list and returns prediction response", async () => {
    const mockPrediction = {
      candidates: [
        {
          rank: 1,
          condition: "Fungal infection",
          score: 0.92,
          score_label: "Very Strong Match",
          description: "A fungal skin infection.",
          precautions: ["keep area clean", "use antifungal cream"],
          matching_symptoms: ["itching", "skin_rash"],
        },
      ],
      known_symptoms: ["itching", "skin_rash"],
      unknown_symptoms: [],
      model_version: "rf_v1.0.0",
      disclaimer: "Educational use only",
      uncertainty_note: "Model predictions are probabilistic",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPrediction,
    } as Response);

    const result = await predict({ symptoms: ["itching", "skin_rash"] });
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].condition).toBe("Fungal infection");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/predict"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ symptoms: ["itching", "skin_rash"] }),
      })
    );
  });

  it("checkHealth returns health status", async () => {
    const mockHealth = {
      status: "healthy",
      model_loaded: true,
      model_version: "rf_v1.0.0",
      vocabulary_size: 131,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHealth,
    } as Response);

    const result = await checkHealth();
    expect(result.status).toBe("healthy");
    expect(result.model_loaded).toBe(true);
  });

  it("handles HTTP errors with detail message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ detail: "None of the provided symptoms are recognized." }),
    } as Response);

    await expect(predict({ symptoms: ["xyz_unknown"] })).rejects.toThrow(
      "None of the provided symptoms are recognized."
    );
  });
});
