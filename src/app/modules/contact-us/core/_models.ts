export interface ContactUsRequestDto {
  name: string;
  family: string;
  phoneNumber: string;
  email: string;
  title: string;
  content: string;
}

export interface ContactUsResponseDto {
  id: number;
  name: string;
  family: string;
  phoneNumber: string;
  email: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
} 