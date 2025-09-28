import {getApiUrl} from '../../../../config/api';
import { getToken } from '../../auth/core/_requests';
import {ContactUsRequestDto, ContactUsResponseDto} from './_models';

export const getAllContactUs = async (): Promise<ContactUsResponseDto[]> => {
  const response = await fetch(getApiUrl('/api/ContactUs'), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch contact us messages');
  }
  return response.json();
};

export const getContactUsById = async (id: number): Promise<ContactUsResponseDto> => {
  const response = await fetch(getApiUrl(`/api/ContactUs/${id}`), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch contact us message');
  }
  return response.json();
};

export const createContactUs = async (data: ContactUsRequestDto): Promise<ContactUsResponseDto> => {
  const response = await fetch(getApiUrl('/api/ContactUs'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create contact us message');
  }
  return response.json();
};

export const updateContactUs = async (id: number, data: ContactUsRequestDto): Promise<ContactUsResponseDto> => {
  const response = await fetch(getApiUrl(`/api/ContactUs/${id}`), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update contact us message');
  }
  return response.json();
};

export const deleteContactUs = async (id: number): Promise<void> => {
  const response = await fetch(getApiUrl(`/api/ContactUs/${id}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete contact us message');
  }
};

export const searchContactUs = async (searchTerm: string): Promise<{items: ContactUsResponseDto[]; totalCount: number}> => {
  const response = await fetch(getApiUrl(`/api/ContactUs/search?searchDto=${encodeURIComponent(searchTerm)}`), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to search contact us messages');
  }
  return response.json();
}; 