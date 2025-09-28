export interface AuthModel {
  api_token: string
  refreshToken?: string
}

export interface UserAddressModel {
  addressLine: string
  city: string
  state: string
  postCode: string
}

export interface UserCommunicationModel {
  email: boolean
  sms: boolean
  phone: boolean
}

export interface UserEmailSettingsModel {
  emailNotification?: boolean
  sendCopyToPersonalEmail?: boolean
  activityRelatesEmail?: {
    youHaveNewNotifications?: boolean
    youAreSentADirectMessage?: boolean
    someoneAddsYouAsAsAConnection?: boolean
    uponNewOrder?: boolean
    newMembershipApproval?: boolean
    memberRegistration?: boolean
  }
  updatesFromKeenthemes?: {
    newsAboutKeenthemesProductsAndFeatureUpdates?: boolean
    tipsOnGettingMoreOutOfKeen?: boolean
    thingsYouMissedSindeYouLastLoggedIntoKeen?: boolean
    newsAboutStartOnPartnerProductsAndOtherServices?: boolean
    tipsOnStartBusinessProducts?: boolean
  }
}

export interface UserSocialNetworksModel {
  linkedIn: string
  facebook: string
  twitter: string
  instagram: string
}

export interface UserGroup {
  name: string
  description: string | null
  users: any | null
}

export interface UserModel {
  id: number
  accuracy: number
  activityField: string | null
  birthDate: string | null
  companyDescription: string | null
  companyName: string | null
  companyNationalId: string | null
  companyPhone: string | null
  educationLevel: string | null
  email: string
  entryDate: string
  entryPerson: string
  expertise: string[] | null
  firstName: string | null
  fullAddress: string | null
  googleScholarLink: string | null
  interests: string[] | null
  lastModifiedDate: string
  lastName: string | null
  logo: string | null
  nationalCode: string | null
  officialDocuments: any | null
  orcidLink: string | null
  password: string
  phoneNumber: string
  profileImage: string | null
  registrationNumber: string | null
  representativeEmail: string | null
  representativeName: string | null
  representativeNationalId: string | null
  representativePhone: string | null
  researchGateLink: string | null
  resume: any | null
  savedInterests: string[] | null
  showPublicProfile: boolean
  skillLevel: string | null
  twoFactorEnabled: boolean
  userGroup: UserGroup
  userGroupId: number
  userType: number // 0 for individual, 1 for legal entity
  website: string | null
}
