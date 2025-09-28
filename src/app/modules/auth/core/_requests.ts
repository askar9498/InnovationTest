import axios from "axios";
import Cookies from "js-cookie";
import { AES, enc, mode, pad } from "crypto-js";
import { jwtDecode } from "jwt-decode";
import { getApiUrl } from "../../../../config/api";
import { PermissionDto, BaseDto, RolesDto } from "../../../../_metronic/partials/widgets/tables/TablesWidget6";
import { AuthModel } from "./_models";
import * as authHelper from "./AuthHelpers";
import { API_ENDPOINTS } from "../../../config/app";

export const GET_USER_BY_ACCESSTOKEN_URL = `${getApiUrl("/verify_token")}`;
export const LOGIN_URL = `${getApiUrl("/login")}`;
export const REGISTER_URL = `${getApiUrl("/register")}`;
export const REQUEST_PASSWORD_URL = `${getApiUrl("/forgot_password")}`;

export const login = async (username: string, password: string) => {
  removeToken();
  const authi = await axios.post(
    getApiUrl("/api/authentication/authenticate"),
    {
      userName: username,
      password: password,
    },
    {
      headers: {
        Accept: "text/plain",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  saveToken(authi.data);
  return authi;
};

export const defaultGroupId = "54";
export const register = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  profile?: File,
  phoneNumber?: string,
  nationalCode?: string
) => {
  const formData = new FormData();
  formData.append("FirstName", firstName);
  formData.append("LastName", lastName);
  formData.append("Email", email);
  formData.append("NationalCode", nationalCode || "");
  formData.append("PhoneNumber", phoneNumber || "");
  formData.append("GroupId", defaultGroupId);
  formData.append("Password", password);
  if (profile) {
    formData.append("Profile", profile);
  }
  const response = await axios.post(
    getApiUrl("/api/User/RegisterIndividual"),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export async function getAllSubmissions() {
  try {
    const res = await axios.get(getApiUrl("/api/Innovation/calls/myideas"), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    console.log('getAllSubmissions response:', res);
    return res.data || [];
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }
}

export async function updateSubmissionAccuracy(id: number, accuracy: number) {
  try {
    const res = await axios.put(
      getApiUrl("/api/IdeaSubmission/" + id.toString() + "/accuracy"),
      null,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        params: {
          accuracy: accuracy
        },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error updating submission accuracy:", error);
    throw error;
  }
}

export async function getSubmissionById(id: number) {
  try {
    const res = await axios.get(
      getApiUrl("/api/Innovation/calls/myideas"),
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log(res)
    return res.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return;
  }
}

export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  });
}

export const getUserByToken = async (token: string) => {
  return await axios.post(
    getApiUrl("/api/user/GetProfile"),
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
};

export const getUserByEmail = async (email: string) => {
  return await axios.post(
    getApiUrl("/api/user/GetUserByEmail"),
    {
      email: email,
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};
export const getAllUsers = async (token: string) => {
  try {
    const res = await axios.get(getApiUrl("/api/user/GetAll"), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return;
  }
};

export const searchUser = async (text: string) => {
  return await axios.post(
    getApiUrl("/api/user/searchUser"),
    {
      text: text,
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const SetAccuracy = async (email: string, status: boolean) => {
  return await axios.post(
    getApiUrl("/api/user/SetAccuracy"),
    {
      email: email,
      status: status,
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};
export const RegisterBlog = async (formData: FormData) => {
  try {
    const response = await axios.post(
      getApiUrl("/api/Blog/Register"),
      formData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Axios error:", error);
  }
};

export const GetBlogByTitle = async (title: string) => {
  try {
    const response = await axios.post(
      getApiUrl("/api/Blog/GetByTitle"),
      {
        Title: title,
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Axios error:", error);
  }
};

export const getUserRole = async () => {
  const res = await axios.post(
    getApiUrl("/api/user/roles"),
    {},
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};

export const updateUserRole = async (email: string, roleName: string) => {
  var res = await getUserByEmail(email);
  return await axios.post(
    getApiUrl("/api/user/SetRole"),
    {
      UserId: res.data.id,
      RoleName: roleName,
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const getAllPosts = async (token: string) => {
  try {
    const res = await axios.get(getApiUrl("/api/Blog/GetAllPosts"), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return;
  }
};

export const removeToken = () => {
  Cookies.remove("authToken");
  authHelper.removeAuth();
};

const saveToken = (token: string) => {
  // Save in Cookies
  Cookies.set("authToken", token, {
    expires: 7,
    secure: process.env.NODE_ENV === "production",
  });

  // Save in localStorage
  const auth: AuthModel = {
    api_token: token
  };
  authHelper.setAuth(auth);
};

export function decryptToJwt(token: string): any {
  const encryptionKey = enc.Utf8.parse("kZ4!xA9bF2WfP@j5nL#bZrJk");
  const iv = enc.Utf8.parse("0000000000000000");

  const decrypted = AES.decrypt(token, encryptionKey, {
    iv: iv,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  });

  const decryptedString = decrypted.toString(enc.Utf8);
  const jwt = jwtDecode(decryptedString);
  return jwt;
}

export enum PermissionEnums {
  GetUser = 0,
  RegisterUser = 1,
  GetRoles = 2,
  GetPermissionsOfUser = 3,
  ResetPassword = 4,
  SetRoleToUser = 5,
  DeleteUser = 6,
  UpdateUser = 7,
  GetUsersByFilter = 8,
  GetUsers = 9,
  GetPermissions = 10,
  GetUserByEmail = 11,
  SetAccuracyToUser = 12,
  SearchUser = 13,
  SetIdeaSubmissionAccuracy = 14,
  GetAllPosts = 15,
  RegisterPosts = 16,
  SearchPost = 17,
  GetPostByTitle = 18,
  GetAllPostTypes = 19,
  CreatePost = 20,
  UpdatePost = 21,
  DeletePost = 22,
  GetPostsByCategory = 23,
  GetAllCategories = 24,
  GetAllTags = 25,
  GetAllPostStatus = 26,
  UpdateCategories = 27,
  GetUserPermissions = 28,
  GetAllInnovations = 29,
  CreateInnovation = 30,
  UpdateInnovation = 31,
  DeleteInnovation = 32,
  GetAllDynamicPages = 33,
  GetDynamicPage = 34,
  CreateDynamicPage = 35,
  UpdateDynamicPage = 36,
  DeleteDynamicPage = 37,
  SearchDynamicPages = 38,
  GetAllMenuItems = 39,
  GetMenuItem = 40,
  GetRootMenuItems = 41,
  GetChildMenuItems = 42,
  CreateMenuItem = 43,
  UpdateMenuItem = 44,
  DeleteMenuItem = 45,
  SetUserPermissions = 46,
  AddRole = 47,
  GetUserLoginLogs = 48,
  GetAllAdminTickets = 49,
  GetUserTickets = 50,
  GetAllContactUs = 51,
  CreateContactUs = 52,
  UpdateContactUs = 53,
  DeleteContactUs = 54,
  SearchContactUs = 55,
  // دسترسی‌های اختصاصی هر منو
  ViewCompleteProfileMenu = 2001,
  ViewUserManageMenu = 2002,
  ViewIdeaSubmissionsMenu = 2003,
  ViewMenuManageMenu = 2004,
  ViewDynamicPagesMenu = 2005,
  ViewBlogManageMenu = 2006,
  ViewInnovationsMenu = 2007,
  ViewContactUsMenu = 2008,
  ViewTicketGroupsMenu = 2009,
  ViewSupportMenu = 2010,
  ViewUserSupportMenu = 2011,

  // Ticket Groups
  CreateTicketGroupButton = 4001,
  EditTicketGroupButton = 4002,
  DeleteTicketGroupButton = 4003,

  // Admin Tickets
  SendAdminMessageButton = 4101,
  CloseTicketButton = 4102,
  DownloadAttachmentButton = 4103,

  // --- User Management Actions ---
  AddNewRoleButton = 4201,
  ManageRolePermissionsButton = 4202,
  AssignRoleToUserButton = 4203,
  ChangeUserStatusButton = 4204,
  ViewUserInfoButton = 4205,

  // --- Idea Submissions Management Actions ---
  AddIdeaSubmissionButton = 4301,
  ChangeIdeaSubmissionAccuracyButton = 4302,
  ViewIdeaSubmissionDetailsButton = 4303,

  // مدیریت فراخوان
  CreateCallButton = 4401,
  UpdateCallButton = 4402,
  DeleteCallButton = 4403,
  ViewCallButton = 4404,
  ManageCallFaqsButton = 4405,
  ManageCallStagesButton = 4406,
  ManageCallIdeasButton = 4407,
  SendIdeaButton = 4408
}

export const getToken = () => {
  return Cookies.get("authToken");
};

export const UpdateBlog = async (blogData: {
  Id: number;
  Title: string;
  SubTitle: string;
  Content: string;
  Tags: string[];
  Status: string;
  PublicRelationsUnitId: number | null;
  AcceptMember: string;
  PublishTime: string;
  IsPublished: boolean;
}) => {
  try {
    const response = await axios.post(
      getApiUrl("/api/Blog/Update"),
      blogData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Axios error:", error);
  }
};

export const SearchBlog = async (SearchText: string) => {
  try {
    const response = await axios.post(
      getApiUrl("/api/Blog/Search"),
      { SearchText },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    throw error;
  }
};

export const GetAllPostTypes = async () => {
  try {
    const response = await axios.get(getApiUrl("/api/Blog/AllPostType"), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    throw error;
  }
};

export const GetAllRoles = async () => {
  try {
    const response = await axios.post(
      getApiUrl("/api/user/Roles"),
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    throw error;
  }
};

export const SaveRolePermissions = async (dataToSave: {
  UserGroupName: string;
  permissions: PermissionDto[];
}) => {
  try {
    const response = await axios.post(
      getApiUrl("/api/user/SetRolePermissions"),
      dataToSave,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    throw error;
  }
};
export const getAllPermissions = async () => {
  try {
    const response = await axios.post(
      getApiUrl("/api/user/Permissions"),
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    throw error;
  }
};
export const GetBlogsByCategory = async (category: string) => {
  try {
    const response = await axios.post(
      getApiUrl("/api/Blog/GetByCategory"),
      { category },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    throw error;
  }
};

export const RemoveBlog = async (title: string) => {
  try {
    const response = await axios.post(
      getApiUrl("/api/Blog/Remove"),
      { title },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    throw error;
  }
};

export const GetAllCategories = async () => {
  try {
    const response = await axios.get(getApiUrl("/api/Blog/GetAllCategory"), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    throw error;
  }
};

export const UpdateAllCategories = async (categories: string[]) => {
  try {
    const response = await axios.post(
      getApiUrl("/api/Blog/UpdateAllCategory"),
      { categories },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    throw error;
  }
};

const userHasAccess = (permission: string) => {
  const data = decryptToJwt(getToken()?.toString()!);
  return data.Permissions.includes(permission);
};

export const updateLegalUser = async (userData: {
  // Base fields
  email: string;
  phoneNumber: string;
  password?: string;
  profile?: File;

  // Corporate fields
  companyName: string;
  companyNationalId: string;
  registrationNumber?: string;
  activityField?: string;
  fullAddress?: string;
  companyPhone?: string;
  website?: string;
  companyDescription?: string;
  logo?: File;
  representativeName?: string;
  representativeNationalId?: string;
  representativeEmail?: string;
  representativePhone?: string;
  officialDocuments?: File[];
  showPublicProfile?: boolean;
}) => {
  const formData = new FormData();

  // Add base fields
  formData.append("Email", userData.email);
  formData.append("PhoneNumber", userData.phoneNumber);
  if (userData.password) formData.append("Password", userData.password);
  if (userData.profile) formData.append("Profile", userData.profile);

  // Add corporate fields
  formData.append("CompanyName", userData.companyName);
  formData.append("CompanyNationalId", userData.companyNationalId);
  if (userData.registrationNumber)
    formData.append("RegistrationNumber", userData.registrationNumber);
  if (userData.activityField)
    formData.append("ActivityField", userData.activityField);
  if (userData.fullAddress)
    formData.append("FullAddress", userData.fullAddress);
  if (userData.companyPhone)
    formData.append("CompanyPhone", userData.companyPhone);
  if (userData.website) formData.append("Website", userData.website);
  if (userData.companyDescription)
    formData.append("CompanyDescription", userData.companyDescription);
  if (userData.logo) formData.append("Logo", userData.logo);
  if (userData.representativeName)
    formData.append("RepresentativeName", userData.representativeName);
  if (userData.representativeNationalId)
    formData.append(
      "RepresentativeNationalId",
      userData.representativeNationalId
    );
  if (userData.representativeEmail)
    formData.append("RepresentativeEmail", userData.representativeEmail);
  if (userData.representativePhone)
    formData.append("RepresentativePhone", userData.representativePhone);
  if (userData.officialDocuments && userData.officialDocuments.length > 0) {
    userData.officialDocuments.forEach((file, index) => {
      formData.append(`OfficialDocuments[${index}]`, file);
    });
  }
  formData.append(
    "ShowPublicProfile",
    userData.showPublicProfile?.toString() || "false"
  );

  return await axios.post(
    getApiUrl("/api/user/CompleteCorporateProfile"),
    formData,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const updateUser = async (userData: {
  // Base fields from InputUserDto
  firstName: string;
  lastName: string;
  email: string;
  nationalCode: string;
  phoneNumber: string;
  password?: string;
  profile?: File;

  // IndividualUserDto specific fields
  birthDate?: string;
  educationLevel?: string;
  expertise?: string[];
  resume?: File;
  interests?: string[];
  skillLevel?: string;
  researchGateLink?: string;
  orcidLink?: string;
  googleScholarLink?: string;
  savedInterests?: string[];
}) => {
  const formData = new FormData();

  // Add base fields from InputUserDto
  formData.append("FirstName", userData.firstName);
  formData.append("LastName", userData.lastName);
  formData.append("Email", userData.email);
  formData.append("NationalCode", userData.nationalCode);
  formData.append("PhoneNumber", userData.phoneNumber);
  if (userData.password) formData.append("Password", userData.password);
  if (userData.profile) formData.append("Profile", userData.profile);

  // Add IndividualUserDto specific fields
  if (userData.birthDate) formData.append("BirthDate", userData.birthDate);
  if (userData.educationLevel)
    formData.append("EducationLevel", userData.educationLevel);
  if (userData.expertise)
    formData.append("Expertise", JSON.stringify(userData.expertise));
  if (userData.resume) formData.append("Resume", userData.resume);
  if (userData.interests)
    formData.append("Interests", JSON.stringify(userData.interests));
  if (userData.skillLevel) formData.append("SkillLevel", userData.skillLevel);
  if (userData.researchGateLink)
    formData.append("ResearchGateLink", userData.researchGateLink);
  if (userData.orcidLink) formData.append("OrcidLink", userData.orcidLink);
  if (userData.googleScholarLink)
    formData.append("GoogleScholarLink", userData.googleScholarLink);
  if (userData.savedInterests)
    formData.append("SavedInterests", JSON.stringify(userData.savedInterests));

  try {
    const response = await axios.post(
      getApiUrl("/api/user/CompleteIndividualProfile"),
      formData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// TODO: Implement the actual backend API endpoint for fetching user permissions
export const getUserPermissions = async (userId: number) => {
  console.log(`Fetching permissions for user ID: ${userId}`);
  // Placeholder data - replace with actual API call
  return {
    filterPagingDto: {
      totalRecords: 0,
      totalPage: 0,
      currentPage: 1,
      pageSize: 10,
    },
    items: [] as PermissionDto[], // Return an empty array of permissions initially
  };
};

// TODO: Implement the actual backend API endpoint for saving user permissions
export const SaveUserPermissions = async (dataToSave: {
  userId: number;
  permissions: PermissionDto[];
}) => {
  console.log("Saving user permissions:", dataToSave);
  // Placeholder implementation - replace with actual API call
  return { success: true }; // Simulate a successful save
};

// Placeholder for searching idea submissions by text and tags
export async function searchIdeaSubmissions(searchText: string, tags?: string[]) {
  console.log(`Searching for idea submissions with text: "${searchText}" and tags: ${tags}`);
  // TODO: Replace with actual API call to your backend endpoint for searching idea submissions
  // Example placeholder return value (you should replace this with actual API response handling)
  return [
    // { id: 1, fullName: 'John Doe', ideaName: 'New App Idea', email: 'john.doe@example.com', phoneNumber: '123-456-7890', ideaSummary: 'A great idea', howDidYouHearAboutUs: 'Friend', lastModifiedDate: '2023-10-27', entryDate: '2023-10-26', entryPerson: 'Admin', accuracy: 1, tags: 'technology,mobile' },
    // { id: 2, fullName: 'Jane Smith', ideaName: 'Innovative Marketing Strategy', email: 'jane.smith@example.com', phoneNumber: '987-654-3210', ideaSummary: 'A creative strategy', howDidYouHearAboutUs: 'Online Ad', lastModifiedDate: '2023-10-27', entryDate: '2023-10-26', entryPerson: 'Admin', accuracy: 2, tags: 'marketing,strategy' },
  ];
}

export const SetPublicRelationsUnitRequest = async (
  postTitle: string,
  publicRelationsUnitId: number | null,
  isAccepted: boolean
) => {
  try {
    const response = await axios.post(
      getApiUrl("/api/Blog/SetPublicRelationsUnit"),
      {
        PostTitle: postTitle,
        PublicRelationsUnitId: publicRelationsUnitId,
        IsAccepted: isAccepted,
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Axios error setting PublicRelationsUnit:", error);
    throw error;
  }
};

export const AddRole = async (name: string, permissions: number[] = []) => {
  try {
    const response = await axios.post(
      getApiUrl("/api/User/AddRole"),
      {
        name: name,
        permissions: permissions,
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding role:", error);
    throw error;
  }
};

export interface UserLoginLogDto {
  loginTime: string; // Assuming DateTime is returned as a string
}

export interface UserLoginLogsResponse {
  items: UserLoginLogDto[];
}

export const getUserLoginLogs = async (userId: number) => {
  try {
    const res = await axios.get(getApiUrl(`/api/user/GetUserLoginLogs?userId=${userId}`), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    console.log("getUserLoginLogs",res);
    return res.data as UserLoginLogsResponse;
  } catch (error) {
    console.error("Error fetching user login logs:", error);
    throw error;
  }
};

// Admin Ticket Endpoints
const ADMIN_TICKET_API_URL = getApiUrl("/api/AdminTickets");

// New DTO for sending admin messages
export interface SendAdminMessageDto {
  content: string;
}

export interface UserUnreadCountDto {
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  unreadCount: number;
}

export const getAllTickets = async () => {
  try {
    const res = await axios.get(`${ADMIN_TICKET_API_URL}/all`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getTicketDetails = async (id: number | string) => {
  try {
    const res = await axios.get(`${ADMIN_TICKET_API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error(`Error fetching ticket details for ID ${id}:`, error);
    throw error;
  }
};

// Updated function to send admin message with DTO
export const sendAdminMessage = async (ticketId: number | string, messageDto: SendAdminMessageDto) => {
  try {
    const res = await axios.post(
      `${ADMIN_TICKET_API_URL}/${ticketId}/messages/send`,
      messageDto, // Send the DTO object
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error(`Error sending message for ticket ID ${ticketId}:`, error);
    throw error;
  }
};

// Although not immediately needed for displaying unanswered tickets, adding update status and assign ticket functions
export const updateTicketStatus = async (id: number | string, status: string) => {
  try {
    const res = await axios.put(
      `${ADMIN_TICKET_API_URL}/${id}/status`,
      `"${status}"`, // Send status as a JSON string
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error(`Error updating status for ticket ID ${id}:`, error);
    throw error;
  }
};

export const assignTicket = async (id: number | string, assigneeId: number | string) => {
  try {
    const res = await axios.put(
      `${ADMIN_TICKET_API_URL}/${id}/assign/${assigneeId}`,
      null, // PUT request with parameters in the URL, no body needed
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error(`Error assigning ticket ID ${id} to user ${assigneeId}:`, error);
    throw error;
  }
};

// New function to get user unread counts
export const getUserUnreadCounts = async () => {
  try {
    const res = await axios.get(`${ADMIN_TICKET_API_URL}/user-unread-counts`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data as UserUnreadCountDto[];
  } catch (error) {
    console.error("Error fetching user unread counts:", error);
    throw error;
  }
};

// User Ticket Endpoints
const USER_TICKET_API_URL = getApiUrl("/api/UserTickets");

export interface CreateTicketDto {
  groupId: number; // Updated to match backend DTO
  title: string; // Updated to match backend DTO
}

export interface Ticket {
  id: number;
  subject: string;
  status: string;
  createdAt: string;
  lastUpdatedAt: string;
  userId: number;
  messages?: Message[]; // Include messages here for details view
}

export interface Message {
  id: number;
  ticketId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isReadByAdmin: boolean;
  fileAttachmentId?: number | null;
  sender?: { // Assuming sender details might be included
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface FileAttachment {
  id: number;
  fileName: string;
  filePath: string;
  fileExtension: string;
  size: number; // in bytes
  uploadTime: string;
  ticketId?: number | null; // Optional link back to ticket
  messageId?: number | null; // Optional link back to message
}

export interface TicketGroup {
  id: number;
  name: string;
  // Tickets property is not needed on the frontend for this purpose
}

// New DTO for sending messages with optional file
export interface SendMessageWithFileDto {
  content: string;
  file?: File; // Optional file
}

export const createTicket = async (ticketData: CreateTicketDto) => {
  try {
    // The backend now expects GroupId and Title in the body
    const res = await axios.post(`${USER_TICKET_API_URL}/create`, ticketData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data as Ticket;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};

export const getTicketById = async (id: number) => {
  try {
    const res = await axios.get(`${USER_TICKET_API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data as Ticket;
  } catch (error) {
    console.error(`Error fetching ticket details for ID ${id}:`, error);
    throw error;
  }
};

export const getMyTickets = async () => {
  try {
    const res = await axios.get(`${USER_TICKET_API_URL}/my`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data as Ticket[]; // Assuming the backend returns an array of Tickets
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    throw error;
  }
};

export const getTicketMessages = async (ticketId: number) => {
  try {
    const res = await axios.get(`${USER_TICKET_API_URL}/${ticketId}/messages`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data as Message[]; // Assuming the backend returns an array of Messages
  } catch (error) {
    console.error(`Error fetching messages for ticket ID ${ticketId}:`, error);
    throw error;
  }
};

// Updated function to send message with DTO
export const sendMessageWithFile = async (ticketId: number, messageDto: SendMessageWithFileDto) => {
  try {
    const formData = new FormData();
    formData.append('Content', messageDto.content); // Use 'Content' to match backend DTO property name
    if (messageDto.file) {
      formData.append('File', messageDto.file); // Use 'File' to match backend DTO property name
    }

    const res = await axios.post(
      `${USER_TICKET_API_URL}/${ticketId}/messages`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          // Axios automatically sets Content-Type to multipart/form-data
        },
        withCredentials: true,
      }
    );
    return res.data as Message; // Assuming the backend returns the created Message
  } catch (error) {
    console.error(`Error sending message for ticket ID ${ticketId}:`, error);
    throw error;
  }
};

export const downloadFileAttachment = async (fileAttachmentId: number) => {
  try {
    const res = await axios.get(`${USER_TICKET_API_URL}/files/${fileAttachmentId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      withCredentials: true,
      responseType: 'blob', // Important for file downloads
    });
    // The response will be a Blob, which can be used to create a download link
    return res.data as Blob;
  } catch (error) {
    console.error(`Error downloading file attachment ID ${fileAttachmentId}:`, error);
    throw error;
  }
};

export const closeTicket = async (id: number) => {
  try {
    const res = await axios.put(`${USER_TICKET_API_URL}/${id}/close`, null, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json", // Still set Content-Type even with no body
      },
      withCredentials: true,
    });
    return res.data as Ticket; // Assuming the backend returns the updated Ticket
  } catch (error) {
    console.error(`Error closing ticket ID ${id}:`, error);
    throw error;
  }
};

// New function to fetch ticket groups
export const getTicketGroups = async () => {
  try {
    const res = await axios.get(`${USER_TICKET_API_URL}/groups`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data as TicketGroup[]; // Assuming backend returns an array of TicketGroup
  } catch (error) {
    console.error("Error fetching ticket groups:", error);
    throw error;
  }
};

// Interfaces for Ticket Groups (based on the provided DTO and controller)
export interface TicketGroupDto {
  id: number; // Using number for frontend, assuming long in backend maps safely
  name: string;
}

export interface CreateTicketGroupDto {
  name: string;
}

export interface UpdateTicketGroupDto {
  id: number; // Using number for frontend
  name: string;
}

// New service functions for Ticket Groups (Admin side)
const ADMIN_TICKET_GROUP_API_URL = getApiUrl("/api/AdminTickets/groups");

export const getAllTicketGroups = async () => {
  try {
    const res = await axios.get(`${ADMIN_TICKET_GROUP_API_URL}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data as TicketGroupDto[]; // Assuming backend returns array of TicketGroupDto
  } catch (error) {
    console.error("Error fetching all ticket groups:", error);
    throw error;
  }
};

export const getTicketGroupById = async (id: number) => {
  try {
    const res = await axios.get(`${ADMIN_TICKET_GROUP_API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data as TicketGroupDto; // Assuming backend returns single TicketGroupDto
  } catch (error) {
    console.error(`Error fetching ticket group details for ID ${id}:`, error);
    throw error;
  }
};

export const createTicketGroup = async (groupData: CreateTicketGroupDto) => {
  try {
    const res = await axios.post(`${ADMIN_TICKET_GROUP_API_URL}`, groupData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data as TicketGroupDto; // Assuming backend returns created TicketGroupDto
  } catch (error) {
    console.error("Error creating ticket group:", error);
    throw error;
  }
};

export const updateTicketGroup = async (id: number, groupData: UpdateTicketGroupDto) => {
  try {
    // Ensure the ID in the path matches the ID in the body
    if (id !== groupData.id) {
      console.error("Mismatch between route ID and body ID for updateTicketGroup");
      throw new Error("Mismatch between route ID and body ID for updateTicketGroup");
    }
    const res = await axios.put(`${ADMIN_TICKET_GROUP_API_URL}/${id}`, groupData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return res.data as TicketGroupDto; // Assuming backend returns updated TicketGroupDto
  } catch (error) {
    console.error(`Error updating ticket group ID ${id}:`, error);
    throw error;
  }
};

export const deleteTicketGroup = async (id: number) => {
  try {
    const res = await axios.delete(`${ADMIN_TICKET_GROUP_API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      withCredentials: true,
    });
    return res.status === 204; // Assuming 204 No Content indicates success
  } catch (error) {
    console.error(`Error deleting ticket group ID ${id}:`, error);
    throw error;
  }
};

// اینترفیس‌های مربوط به مراحل ایده
export interface CallStage {
  id: number;
  callId: number;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface IdeaStage {
  id: number;
  ideaId: number;
  stageId: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  comment: string;
  createdAt: string;
  updatedAt?: string;
  evaluatedById?: number;
}

export interface IdeaTag {
  id: number;
  name: string;
  description: string;
}

export interface IdeaTagRelation {
  id: number;
  ideaId: number;
  tagId: number;
}

// سرویس‌های مربوط به مراحل فراخوان
export const getCallStages = async (callId: number) => {
  const response = await axios.get(
    `${API_ENDPOINTS.INNOVATION.CALLS}/${callId}/stages`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

export const createCallStage = async (callId: number, stage: Omit<CallStage, 'id' | 'createdAt' | 'updatedAt'>) => {
  const response = await axios.post(
    `${API_ENDPOINTS.INNOVATION.CALLS}/${callId}/stages`,
    stage,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

export const updateCallStage = async (id: number, stage: Partial<CallStage>) => {
  const response = await axios.put(
    `${API_ENDPOINTS.INNOVATION.STAGES}/${id}`,
    stage,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

export const deleteCallStage = async (callId: number, stageId: number) => {
  await axios.delete(
    `${API_ENDPOINTS.INNOVATION.STAGE(callId, stageId)}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

// سرویس‌های مربوط به مراحل ایده
export const getIdeaStages = async (ideaId: number) => {
  try {
    const response = await axios.get(
      getApiUrl(`/api/Innovation/ideas/${ideaId}/stages`),
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log('getIdeaStages response:', response);
    return response.data;
  } catch (error) {
    console.error("Error fetching idea stages:", error);
    return [];
  }
};

export const createIdeaStage = async (ideaId: number, stage: Omit<IdeaStage, 'id' | 'createdAt' | 'updatedAt'>) => {
  const response = await axios.post(
    `${API_ENDPOINTS.INNOVATION.IDEAS}/${ideaId}/stages`,
    stage,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

export const updateIdeaStage = async (id: number, stage: Partial<IdeaStage>) => {
  const response = await axios.put(
    `${API_ENDPOINTS.INNOVATION.IDEA_STAGES}/${id}`,
    stage,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

export const deleteIdeaStage = async (id: number) => {
  await axios.delete(
    `${API_ENDPOINTS.INNOVATION.IDEA_STAGES}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

export const moveIdeaToNextStage = async (ideaId: number, currentStageId: number, status: string, comment: string) => {
  const response = await axios.post(
    `${API_ENDPOINTS.INNOVATION.IDEAS}/${ideaId}/move-stage`,
    {
      currentStageId,
      status,
      comment,
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

export const rejectIdea = async (ideaId: number, stageId: number, comment: string) => {
  const response = await axios.post(
    `${API_ENDPOINTS.INNOVATION.IDEAS}/${ideaId}/reject`,
    {
      stageId,
      comment,
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

// سرویس‌های مربوط به برچسب‌ها
export const getAllTags = async () => {
  const response = await axios.get(
    API_ENDPOINTS.INNOVATION.TAGS,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

export const createTag = async (tag: Omit<IdeaTag, 'id'>) => {
  const response = await axios.post(
    API_ENDPOINTS.INNOVATION.TAGS,
    tag,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

export const updateTag = async (id: number, tag: Partial<IdeaTag>) => {
  const response = await axios.put(
    `${API_ENDPOINTS.INNOVATION.TAGS}/${id}`,
    tag,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

export const deleteTag = async (id: number) => {
  await axios.delete(
    `${API_ENDPOINTS.INNOVATION.TAGS}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

export const getIdeaTags = async (ideaId: number) => {
  const response = await axios.get(
    API_ENDPOINTS.INNOVATION.IDEA_TAGS(ideaId),
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

export const addTagToIdea = async (ideaId: number, tagId: number) => {
  const response = await axios.post(
    API_ENDPOINTS.INNOVATION.IDEA_TAGS(ideaId),
    { tagId },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.data;
};

export const removeTagFromIdea = async (ideaId: number, tagId: number) => {
  await axios.delete(
    `${API_ENDPOINTS.INNOVATION.IDEA_TAGS(ideaId)}/${tagId}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

export const createIdea = async (ideaData: any) => {
  const formData = new FormData();
  formData.append("Title", ideaData.title);
  formData.append("Description", ideaData.description);
  formData.append("Status", ideaData.status);
  formData.append("CurrentStageId", ideaData.currentStageId.toString());
  formData.append("CallId", ideaData.callId.toString());

  if (ideaData.files && ideaData.files.length > 0) {
    ideaData.files.forEach((file: File) => {
      formData.append("Files", file);
    });
  }

  const response = await axios.post(API_ENDPOINTS.INNOVATION.IDEAS, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateIdea = async (ideaId: number, ideaData: any) => {
  const formData = new FormData();
  formData.append("Title", ideaData.title || "");
  formData.append("Description", ideaData.description || "");
  formData.append("Status", ideaData.status || "");
  formData.append("CurrentStageId", (ideaData.currentStageId || "").toString());
  formData.append("CallId", (ideaData.callId || "").toString());

  if (ideaData.files && ideaData.files.length > 0) {
    ideaData.files.forEach((file: File) => {
      formData.append("Files", file);
    });
  }

  const response = await axios.put(
    `${API_ENDPOINTS.INNOVATION.IDEAS}/${ideaId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
