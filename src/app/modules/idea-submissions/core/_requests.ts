import { getApiUrl, GetBaseUrl } from '../../../../config/api';
import { IdeaSubmissionDto } from './_models';
// Assuming a base API request function exists elsewhere, e.g., in src/app/utils/api.ts or similar
// Replace `apiRequest` with your actual base request function

const API_URL = GetBaseUrl();
const IDEA_SUBMISSIONS_URL = `${API_URL}/api/IdeaSubmission`; // Adjust endpoint as necessary

// Placeholder for a generic API request function (replace with your actual implementation)
async function apiRequest<T>(method: string, url: string, data?: any, config?: any): Promise<T> {
    console.warn('Placeholder apiRequest function called.');
    console.log(`Method: ${method}, URL: ${url}, Data: `, data, `Config: `, config);
    // In a real application, you would use fetch, axios, or similar
    // Example: const response = await fetch(url, { method, body: JSON.stringify(data), ...config });
    // const result = await response.json();
    // return result as T;
    return {} as T; // Dummy return
}

export function getAllIdeaSubmissions(): Promise<IdeaSubmissionDto[]> {
    return apiRequest<IdeaSubmissionDto[]>('GET', IDEA_SUBMISSIONS_URL);
}

// Update the function signature to accept number and convert to string for the URL
export function getIdeaSubmissionById(id: number): Promise<IdeaSubmissionDto> {
    return apiRequest<IdeaSubmissionDto>('GET', `${IDEA_SUBMISSIONS_URL}/${id}`);
}

export function createIdeaSubmission(data: IdeaSubmissionDto): Promise<IdeaSubmissionDto> {
    const formData = new FormData();
    const dataAsRecord = data as Record<string, any>; // Cast to allow string indexing
    for (const key in dataAsRecord) {
        if (Object.prototype.hasOwnProperty.call(dataAsRecord, key)) {
            // Handle File separately
            if (key === 'filePath' && dataAsRecord[key] instanceof File) {
                 formData.append(key, dataAsRecord[key]);
            } else if (key !== 'filePath') {
                 formData.append(key, String(dataAsRecord[key]));
            }
        }
    }
    // Note: Sending files usually requires different headers (e.g., no 'Content-Type')
    // Your apiRequest function needs to handle FormData correctly.
    return apiRequest<IdeaSubmissionDto>('POST', IDEA_SUBMISSIONS_URL, formData);
}

// Placeholder for updating idea submission accuracy
export function updateIdeaSubmissionAccuracy(id: number, accuracy: number): Promise<void> {
  // Assuming the API expects a PUT request to /api/IdeaSubmission/{id}/accuracy
  // and the request body contains the new accuracy value.
  return apiRequest<void>('PUT', `${IDEA_SUBMISSIONS_URL}/${id}/accuracy`, { accuracy });
}

// Keeping the generic update function as well, in case it's needed for other fields later
export function updateIdeaSubmission(id: number, data: Partial<IdeaSubmissionDto>): Promise<IdeaSubmissionDto> {
     const formData = new FormData();
     const dataAsRecord = data as Record<string, any>; // Cast to allow string indexing
    for (const key in dataAsRecord) {
        if (Object.prototype.hasOwnProperty.call(dataAsRecord, key)) {
            // Handle File separately
            if (key === 'filePath' && dataAsRecord[key] instanceof File) {
                 formData.append(key, dataAsRecord[key]);
            } else if (key !== 'filePath') {
                 formData.append(key, String(dataAsRecord[key]));
            }
        }
    }
    // Note: Sending files usually requires different headers (e.g., no 'Content-Type')
    // Your apiRequest function needs to handle FormData correctly.
    // Also, PUT/PATCH with FormData might require specific backend handling.
    return apiRequest<IdeaSubmissionDto>('PUT', `${IDEA_SUBMISSIONS_URL}/${id}`, formData);
}

export function deleteIdeaSubmission(id: number): Promise<void> {
    return apiRequest<void>('DELETE', `${IDEA_SUBMISSIONS_URL}/${id}`);
} 