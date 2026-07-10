/**
 * Student API Service - Gọi API từ Exam Service
 * Base URL: http://localhost:3001/api/student
 */
import axios, { AxiosError } from "axios";
import { getAuthTokens } from "../utils/auth";

const STUDENT_API_URL = import.meta.env.VITE_STUDENT_API_URL || "http://localhost:3001/api/student";

// Tạo axios instance
const studentApi = axios.create({
  baseURL: STUDENT_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào request
studentApi.interceptors.request.use(
  (config) => {
    const tokens = getAuthTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý response
studentApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token hết hạn - clear auth data và redirect
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Types
export interface StudentInfo {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phone?: string | null;
  studentCode?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  schoolName?: string | null;
  academic?: {
    yearLevel?: string;
    semester?: string;
    academicYear?: string;
  };
}

export interface DashboardOverview {
  classCount: number;
  upcomingAssignments: number;
  openAssignments: number;
  averageScore: number;
}

export interface NextAssignment {
  assignmentId: string;
  title: string;
  className: string;
  courseName?: string;
  teacherName?: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface MyClass {
  classId: string;
  className: string;
  classCode: string;
  courseName?: string;
  teacherName: string;
  semester?: string;
  academicYear?: string;
}

export interface RecentResult {
  attemptId: string;
  assignmentId: string;
  title: string;
  className: string;
  score: number | null;
  percentage: number | null;
  submittedAt: string;
}

export interface Notification {
  id: string;
  type: "assignment" | "grade" | "system" | "verification" | "email";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface DashboardData {
  student: StudentInfo;
  overview: DashboardOverview;
  nextAssignment: NextAssignment | null;
  myClasses: MyClass[];
  recentResults: RecentResult[];
  notifications: Notification[];
}

export interface ClassStats {
  totalAssignments: number;
  completedAssignments: number;
  openAssignments: number;
  upcomingAssignments: number;
  averageScore: number;
}

export interface ClassData {
  classId: string;
  className: string;
  classCode: string;
  courseId: number;
  courseName?: string;
  teacherId: string;
  teacherName: string;
  yearLevel?: string;
  semester?: string;
  academicYear?: string;
  isActive: boolean;
  joinedAt: string;
  stats: ClassStats;
}

export interface AssignmentLatestAttempt {
  attemptId: string;
  score: number | null;
  percentage: number | null;
  submittedAt: string | null;
}

export interface AssignmentQuestionAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface AssignmentQuestion {
  questionId: string;
  content: string;
  answers: AssignmentQuestionAnswer[];
}

export interface Assignment {
  studentAssignmentId: string;
  assignmentId: string;
  title: string;
  courseName: string;
  className: string;
  classCode: string;
  teacherName: string;
  instructions: string | null;
  startTime: string;
  endTime: string;
  duration: number;
  maxAttempts: number;
  attemptsUsed: number;
  passingScore: number;
  totalPoints: number;
  status: "open" | "upcoming" | "submitted" | "expired";
  latestAttempt: AssignmentLatestAttempt | null;
  questions?: AssignmentQuestion[];
}

export interface AssignmentsResponse {
  items: Assignment[];
  summary: {
    total: number;
    open: number;
    upcoming: number;
    submitted: number;
    expired: number;
  };
}

export interface Result {
  attemptId: string;
  examId: string;
  assignmentId: string;
  title: string;
  className: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  timeTaken: number | null;
  status: "submitted" | "graded";
  score: number | null;
  percentage: number | null;
  correctAnswers: number;
  wrongAnswers: number;
}

export interface ClassDetailData {
  classInfo: {
    classId: string;
    className: string;
    classCode: string;
    courseName?: string;
    teacherName: string;
    semester?: string;
    academicYear?: string;
  };
  stats: ClassStats;
  assignments: Assignment[];
}

export interface AssignmentStartResponse {
  status: string;
  assignment: {
    id: string;
    exam_id: string;
    title: string;
    instructions: string | null;
    duration: number;
    total_points: number;
    examQuestions?: AssignmentQuestion[];
  };
  attempt: {
    attemptId: string;
    attempt_number: number;
    started_at: string;
  };
}

export interface AssignmentSubmitAnswer {
  questionId: string;
  answerId: string | null;
  isCorrect: boolean;
  timeSpent: number;
}

export interface AssignmentSubmitPayload {
  answers: AssignmentSubmitAnswer[];
}

export interface AssignmentSubmitResponse {
  attempt: {
    attemptId: string;
    score: number;
    percentage: number;
    correct_answers: number;
    wrong_answers: number;
    submitted_at: string;
  };
  summary: {
    score: number;
    percentage: number;
    correctAnswers: number;
    wrongAnswers: number;
  };
}

// API Functions

/**
 * Lấy dashboard data
 */
export const getStudentDashboard = async (): Promise<DashboardData> => {
  const response = await studentApi.get<DashboardData>("/dashboard");
  return response.data;
};

/**
 * Lấy danh sách lớp học
 */
export const getStudentClasses = async (): Promise<ClassData[]> => {
  const response = await studentApi.get<ClassData[]>("/classes");
  return response.data;
};

/**
 * Lấy chi tiết một lớp học
 */
export const getClassDetail = async (classId: string): Promise<ClassDetailData> => {
  const response = await studentApi.get<ClassDetailData>(`/classes/${classId}`);
  return response.data;
};

/**
 * Lấy danh sách bài thi
 */
export const getStudentAssignments = async (filters?: {
  status?: string;
  search?: string;
  classId?: string;
}): Promise<AssignmentsResponse> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.classId) params.append("classId", filters.classId);

  const response = await studentApi.get<AssignmentsResponse>(
    `/assignments?${params.toString()}`
  );
  return response.data;
};

/**
 * Bắt đầu làm bài thi
 */
export const startAssignment = async (assignmentId: string): Promise<AssignmentStartResponse> => {
  const response = await studentApi.post<AssignmentStartResponse>(`/assignments/${assignmentId}/start`);
  return response.data;
};

export interface AssignmentQuestionsResponse {
  assignmentId: string;
  title: string;
  instructions: string | null;
  duration: number;
  totalPoints: number;
  questions: AssignmentQuestion[];
}

export const getAssignmentQuestions = async (assignmentId: string): Promise<AssignmentQuestionsResponse> => {
  const response = await studentApi.get<AssignmentQuestionsResponse>(`/assignments/${assignmentId}/questions`);
  return response.data;
};

/**
 * Nộp bài thi
 */
export const submitStudentAssignment = async (
  assignmentId: string,
  attemptId: string,
  answers: AssignmentSubmitAnswer[]
): Promise<AssignmentSubmitResponse> => {
  const response = await studentApi.post<AssignmentSubmitResponse>(`/assignments/${assignmentId}/attempts/${attemptId}/submit`, {
    answers,
  });
  return response.data;
};

/**
 * Lấy kết quả bài thi
 */
export const getStudentResults = async (limit = 20): Promise<Result[]> => {
  const response = await studentApi.get<Result[]>(`/results?limit=${limit}`);
  return response.data;
};

// ============== Class Posts (Thông báo lớp học) ==============

export interface ClassPostAttachment {
  name: string;
  url: string;
  type: string;
}

export interface ClassPost {
  postId: string;
  title: string | null;
  content: string;
  type: "announcement" | "material" | "assignment" | "question";
  isPinned: boolean;
  attachments: ClassPostAttachment[];
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassPostsResponse {
  items: ClassPost[];
  total: number;
  page: number;
  totalPages: number;
}

export const getClassPosts = async (
  classId: string,
  filters?: { type?: string; search?: string; page?: number; limit?: number }
): Promise<ClassPostsResponse> => {
  const params = new URLSearchParams();
  if (filters?.type) params.append("type", filters.type);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const response = await studentApi.get<ClassPostsResponse>(`/classes/${classId}/posts?${params.toString()}`);
  return response.data;
};

// ============== Join Class ==============

export interface JoinClassResponse {
  success: boolean;
  message: string;
  member: {
    id: string;
    classId: string;
    className: string;
    classCode: string;
    courseName?: string;
    teacherName?: string;
  };
}

export const joinClass = async (classCode: string): Promise<JoinClassResponse> => {
  const response = await studentApi.post<JoinClassResponse>("/classes/join", { classCode });
  return response.data;
};

// ============== User Settings ==============

export interface NotificationSettings {
  emailNotifications: boolean;
  examReminders: boolean;
  deadlineReminders: boolean;
  gradeNotifications: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phone?: string | null;
  studentCode?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
}

/**
 * Lấy thông tin profile
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = await studentApi.get<UserProfile>("/profile");
  return response.data;
};

/**
 * Cập nhật thông tin profile
 */
export const updateProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  const response = await studentApi.put<UserProfile>("/profile", data);
  return response.data;
};

/**
 * Lấy cài đặt thông báo
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const response = await studentApi.get<NotificationSettings>("/settings/notifications");
  return response.data;
};

/**
 * Cập nhật cài đặt thông báo
 */
export const updateNotificationSettings = async (settings: NotificationSettings): Promise<NotificationSettings> => {
  const response = await studentApi.put<NotificationSettings>("/settings/notifications", settings);
  return response.data;
};

/**
 * Đổi mật khẩu
 */
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  const response = await studentApi.post<{ success: boolean; message: string }>("/settings/change-password", data);
  return response.data;
};

export default studentApi;
