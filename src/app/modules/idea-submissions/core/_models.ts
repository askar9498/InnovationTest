export enum Accuracy {
  Accepted = 2,
  Pending = 1,
  Deleted = 3,
}

export interface IdeaSubmissionDto {
    id: number;
    fullName: string;
    ideaName: string;
    email: string;
    phoneNumber: string;
    ideaSummary: string;
    howDidYouHearAboutUs: string;
    filePath?: string; // Updated to string based on the sample data path
    lastModifiedDate: string;
    entryDate: string;
    entryPerson: string;
    accuracy: Accuracy; // Use the Accuracy enum
    tags : string;
}

export type { IdeaStage } from '../../auth/core/_requests'; 