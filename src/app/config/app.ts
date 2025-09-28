import { GetBaseUrl } from "../../config/api";

export const API_URL = GetBaseUrl();

export const API_ENDPOINTS = {
  INNOVATION: {
    CALLS: `${API_URL}/api/Innovation/calls`,
    CALLS_SEARCH: `${API_URL}/api/Innovation/calls/search`,
    CALL: (id: number) => `${API_URL}/api/Innovation/calls/${id}`,
    CALL_FAQS: (callId: number) => `${API_URL}/api/Innovation/calls/${callId}/faqs`,
    IDEAS: `${API_URL}/api/Innovation/ideas`,
    IDEA: (id: number) => `${API_URL}/api/Innovation/ideas/${id}`,
    IDEA_TAGS: (ideaId: number) => `${API_URL}/api/Innovation/ideas/${ideaId}/tags`,
    STAGES:(callId: number) =>  `${API_URL}/api/Innovation/${callId}/stages`,
    STAGE: (callId: number, stageId: number) => `${API_URL}/api/Innovation/${callId}/stages/${stageId}`,
    IDEA_STAGES: `${API_URL}/api/Innovation/idea-stages`,
    TAGS: `${API_URL}/api/Innovation/tags`,
    TAG: (id: number) => `${API_URL}/api/Innovation/tags/${id}`,
    ATTACHMENTS: {
      DOWNLOAD: (id: number) => `${API_URL}/api/Innovation/attachments/${id}/download`,
      DELETE: (id: number) => `${API_URL}/api/Innovation/call-attachments/${id}`,
    },
    FAQS: {
      DELETE: (id: number) => `${API_URL}/api/Innovation/faqs/${id}`,
    },
  },
}; 