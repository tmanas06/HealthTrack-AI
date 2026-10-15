export interface CandidateCondition {
  rank: number;
  condition: string;
  score: number;
  score_label: string;
  description: string | null;
  precautions: string[];
  matching_symptoms: string[];
}

export interface PredictResponse {
  candidates: CandidateCondition[];
  known_symptoms: string[];
  unknown_symptoms: string[];
  model_version: string;
  disclaimer: string;
  uncertainty_note: string;
}

export interface PredictRequest {
  symptoms: string[];
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model_version: string | null;
  vocabulary_size: number;
}

export interface SymptomsResponse {
  symptoms: string[];
}
