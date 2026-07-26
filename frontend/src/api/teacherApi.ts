/**
 * Teacher API Service
 * Base URL: http://localhost:3001/api/teacher
 */
import axios, { AxiosError } from "axios";
import { getAuthTokens } from "../utils/auth";

const TEACHER_API_URL = import.meta.env.VITE_TEACHER_API_URL || "http://localhost:3000/api/teacher";

const teacherApi = axios.create({
  baseURL: TEACHER_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

teacherApi.interceptors.request.use(
  (config) => {
    const tokens = getAuthTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

teacherApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded. Please wait a moment.");
      return Promise.reject(new Error("Too many requests. Please wait and try again."));
    }
    return Promise.reject(error);
  }
);

// ==========================================
// TYPES - bám đúng Task1.md DTO
// ==========================================

export interface TeacherInfo {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  teacherCode?: string;
  department?: string;
  specialization?: string;
}

export interface DashboardOverview {
  classCount: number;
  studentCount: number;
  examCount: number;
  assignmentCount: number;
  openAssignments: number;
  pendingGrades: number;
  notificationCount: number;
}

export interface UpcomingAssignment {
  assignmentId: string;
  title: string;
  examName: string;
  className: string;
  startTime: string;
  endTime: string;
  studentAssigned: number;
  submitted: number;
  status: string;
}

export interface RecentResult {
  attemptId: string;
  studentName: string;
  className: string;
  examName: string;
  score: number | null;
  percentage: number | null;
  submittedAt: string;
  status: string;
}

export interface MyClass {
  classId: string;
  className: string;
  classCode: string;
  courseName: string;
  semester: string;
  academicYear: string;
  studentCount: number;
  assignmentCount: number;
  averageScore: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardData {
  teacher: TeacherInfo;
  overview: DashboardOverview;
  upcomingAssignments: UpcomingAssignment[];
  recentResults: RecentResult[];
  myClasses: MyClass[];
  notifications: Notification[];
}

export interface Course {
  courseId: number;
  name: string;
  code: string;
  description: string;
  credits: number;
  facultyName: string;
  classCount: number;
  examCount: number;
  questionCount: number;
}

export interface ClassData {
  classId: string;
  className: string;
  classCode: string;
  courseId: number;
  courseName: string;
  semester: string;
  academicYear: string;
  yearLevel: string;
  studentCount: number;
  assignmentCount: number;
  openAssignments: number;
  averageScore: number;
  teacherName: string;
  isActive: boolean;
  createdAt: string;
}

export interface ClassStudent {
  userId: string;
  fullName: string;
  email: string;
  studentCode: string;
  avatarUrl: string | null;
  joinedAt: string;
  completedAssignments: number;
  averageScore: number | null;
}

export interface ClassAssignment {
  assignmentId: string;
  title: string;
  examName: string;
  startTime: string;
  endTime: string;
  maxAttempts: number;
  submittedCount: number;
  gradedCount: number;
  status: "open" | "closed" | "upcoming";
}

export interface ClassDetailData {
  classInfo: ClassData;
  students: ClassStudent[];
  assignments: ClassAssignment[];
  recentResults: RecentResult[];
}

export interface Exam {
  examId: string;
  title: string;
  description: string;
  courseId: number;
  courseName: string;
  questionCount: number;
  duration: number;
  totalPoints: number;
  passingScore: number;
  published: boolean;
  createdAt: string;
}

export interface Assignment {
  assignmentId: string;
  title: string;
  examName: string;
  className: string;
  classId: string;
  startTime: string;
  endTime: string;
  maxAttempts: number;
  studentAssigned: number;
  submitted: number;
  graded: number;
  status: "open" | "closed" | "upcoming";
}

export interface AssignmentSummary {
  total: number;
  open: number;
  upcoming: number;
  closed: number;
}

export interface AssignmentsResponse {
  items: Assignment[];
  summary: AssignmentSummary;
}

export interface Result {
  attemptId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCode: string;
  classId: string;
  className: string;
  assignmentId: string;
  assignmentTitle: string;
  examName: string;
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

export interface ScheduleItem {
  assignmentId: string;
  examTitle: string;
  className: string;
  scheduledAt: string;
  startTime: string;
  endTime: string;
  status: "open" | "upcoming" | "closed";
  studentCount: number;
}

// ==========================================
// API FUNCTIONS - gọi backend thật
// ==========================================

export const getTeacherDashboard = async (): Promise<DashboardData> => {
  const response = await teacherApi.get<DashboardData>("/dashboard");
  return response.data;
};

export interface CreateCoursePayload {
  name: string;
  code: string;
  description?: string;
  credits?: number;
  semesterType?: string;
}

export interface UpdateCoursePayload {
  name?: string;
  code?: string;
  description?: string;
  credits?: number;
  semesterType?: string;
}

export interface CourseDetail {
  courseId: number;
  name: string;
  code: string;
  description: string;
  credits: number;
  semesterType: string | null;
  facultyName: string;
  classCount: number;
  examCount: number;
  questionCount: number;
  classes: Array<{
    classId: number;
    name: string;
    studentCount: number;
  }>;
}

export const getCourses = async (): Promise<Course[]> => {
  const response = await teacherApi.get<Course[]>("/courses");
  return response.data;
};

export const getCourseDetail = async (courseId: number): Promise<CourseDetail> => {
  const response = await teacherApi.get<CourseDetail>(`/courses/${courseId}`);
  return response.data;
};

export const createCourse = async (payload: CreateCoursePayload): Promise<Course> => {
  const response = await teacherApi.post<Course>("/courses", payload);
  return response.data;
};

export const updateCourse = async (courseId: number, payload: UpdateCoursePayload): Promise<Course> => {
  const response = await teacherApi.put<Course>(`/courses/${courseId}`, payload);
  return response.data;
};

export const deleteCourse = async (courseId: number): Promise<{ success: boolean }> => {
  const response = await teacherApi.delete<{ success: boolean }>(`/courses/${courseId}`);
  return response.data;
};

// ============== Class CRUD ==============

export interface CreateClassPayload {
  name: string;
  classCode: string;
  courseId?: number;
  yearLevel?: string;
  academicYear?: string;
  semester?: string;
}

export interface UpdateClassPayload {
  name?: string;
  classCode?: string;
  courseId?: number;
  yearLevel?: string;
  academicYear?: string;
  semester?: string;
  isActive?: boolean;
}

export const getClasses = async (): Promise<ClassData[]> => {
  const response = await teacherApi.get<ClassData[]>("/classes");
  return response.data;
};

export const createClass = async (payload: CreateClassPayload): Promise<ClassData> => {
  const response = await teacherApi.post<ClassData>("/classes", payload);
  return response.data;
};

export const updateClass = async (classId: string, payload: UpdateClassPayload): Promise<ClassData> => {
  const response = await teacherApi.put<ClassData>(`/classes/${classId}`, payload);
  return response.data;
};

export const deleteClass = async (classId: string): Promise<{ success: boolean }> => {
  const response = await teacherApi.delete<{ success: boolean }>(`/classes/${classId}`);
  return response.data;
};

// ============== Exam CRUD ==============

export interface CreateExamPayload {
  title: string;
  description?: string;
}

export interface UpdateExamPayload {
  title?: string;
  description?: string;
  duration?: number;
  totalPoints?: number;
  passingScore?: number;
  published?: boolean;
}

export interface ExamDetail {
  examId: string;
  title: string;
  description: string;
  courseId: number | null;
  courseName: string;
  questionCount: number;
  duration: number;
  totalPoints: number;
  passingScore: number;
  published: boolean;
  createdAt: string;
  questions: Array<{
    questionId: string;
    order: number;
    score: number;
  }>;
}

export const getExams = async (filters?: { search?: string }): Promise<Exam[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  const response = await teacherApi.get<Exam[]>(`/exams?${params.toString()}`);
  return response.data;
};

export const getExamDetail = async (examId: string): Promise<ExamDetail> => {
  const response = await teacherApi.get<ExamDetail>(`/exams/${examId}`);
  return response.data;
};

export const createExam = async (payload: CreateExamPayload): Promise<Exam> => {
  const response = await teacherApi.post<Exam>("/exams", payload);
  return response.data;
};

export const updateExam = async (examId: string, payload: UpdateExamPayload): Promise<Exam> => {
  const response = await teacherApi.put<Exam>(`/exams/${examId}`, payload);
  return response.data;
};

export const deleteExam = async (examId: string): Promise<{ success: boolean }> => {
  const response = await teacherApi.delete<{ success: boolean }>(`/exams/${examId}`);
  return response.data;
};

// ==========================================
// Exam Question Management
// ==========================================

export interface ExamQuestionItem {
  id: string;
  questionId: string;
  order: number;
  points: number;
  timeLimit: number | null;
  isRequired: boolean;
}

export interface ExamQuestionsResponse {
  examId: string;
  title: string;
  questions: ExamQuestionItem[];
}

export interface AddExamQuestionsPayload {
  questionIds: string[];
  defaultPoints?: number;
}

export interface AddExamQuestionsResponse {
  success: boolean;
  addedCount: number;
  totalQuestions: number;
}

export const getExamQuestions = async (examId: string): Promise<ExamQuestionsResponse> => {
  const response = await teacherApi.get<ExamQuestionsResponse>(`/exams/${examId}/questions`);
  return response.data;
};

export const addExamQuestions = async (
  examId: string,
  payload: AddExamQuestionsPayload
): Promise<AddExamQuestionsResponse> => {
  const response = await teacherApi.post<AddExamQuestionsResponse>(
    `/exams/${examId}/questions`,
    payload
  );
  return response.data;
};

export const updateExamQuestion = async (
  examId: string,
  questionId: string,
  data: { order?: number; points?: number; timeLimit?: number; isRequired?: boolean }
): Promise<{ success: boolean; questionId: string; order: number; points: number }> => {
  const response = await teacherApi.put(
    `/exams/${examId}/questions/${questionId}`,
    data
  );
  return response.data;
};

export const removeExamQuestion = async (
  examId: string,
  questionId: string
): Promise<{ success: boolean }> => {
  const response = await teacherApi.delete<{ success: boolean }>(
    `/exams/${examId}/questions/${questionId}`
  );
  return response.data;
};

export const getClassDetail = async (classId: string): Promise<ClassDetailData> => {
  const response = await teacherApi.get<ClassDetailData>(`/classes/${classId}`);
  return response.data;
};

export const getAssignments = async (filters?: {
  status?: string;
  classId?: string;
  search?: string;
}): Promise<AssignmentsResponse> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.classId) params.append("classId", filters.classId);
  if (filters?.search) params.append("search", filters.search);

  const response = await teacherApi.get<AssignmentsResponse>(`/assignments?${params.toString()}`);
  return response.data;
};

export const updateAssignment = async (id: string, payload: { status: string }): Promise<void> => {
  await teacherApi.put(`/assignments/${id}`, payload);
};

export const deleteAssignment = async (id: string): Promise<void> => {
  await teacherApi.delete(`/assignments/${id}`);
};

export const getResults = async (filters?: {
  classId?: string;
  assignmentId?: string;
  status?: string;
}): Promise<Result[]> => {
  const params = new URLSearchParams();
  if (filters?.classId) params.append("classId", filters.classId);
  if (filters?.assignmentId) params.append("assignmentId", filters.assignmentId);
  if (filters?.status) params.append("status", filters.status);

  const response = await teacherApi.get<Result[]>(`/results?${params.toString()}`);
  return response.data;
};

export interface ScheduleResponse {
  items: ScheduleItem[];
  summary: {
    totalAssignments: number;
    upcomingCount: number;
    openCount: number;
    completedCount: number;
  };
}

export const getSchedule = async (year: number, month: number): Promise<ScheduleResponse> => {
  const response = await teacherApi.get<ScheduleResponse>("/assignments/schedule", {
    params: { year, month },
  });
  return response.data;
};

export interface TeacherProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  teacherCode: string | null;
  department: string | null;
  specialization: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  schoolName: string | null;
  createdAt: string;
  stats: {
    classCount: number;
    studentCount: number;
    examCount: number;
    assignmentCount: number;
  };
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  schoolName?: string;
  teacherCode?: string;
  department?: string;
  specialization?: string;
}

export const getTeacherProfile = async (): Promise<TeacherProfile> => {
  const response = await teacherApi.get<TeacherProfile>("/profile");
  return response.data;
};

export const updateTeacherProfile = async (payload: UpdateProfilePayload): Promise<TeacherProfile> => {
  const response = await teacherApi.put<TeacherProfile>("/profile", payload);
  return response.data;
};

// ============== Class Posts (Thông báo lớp học) ==============

export interface ClassPost {
  postId: string;
  title: string | null;
  content: string;
  type: "announcement" | "material" | "assignment" | "question";
  isPinned: boolean;
  attachments: Attachment[];
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ClassPostsResponse {
  items: ClassPost[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateClassPostPayload {
  title?: string;
  content: string;
  type?: "announcement" | "material" | "assignment" | "question";
  isPinned?: boolean;
  attachments?: Attachment[];
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

  const response = await teacherApi.get<ClassPostsResponse>(`/classes/${classId}/posts?${params.toString()}`);
  return response.data;
};

export const createClassPost = async (
  classId: string,
  payload: CreateClassPostPayload
): Promise<ClassPost> => {
  const response = await teacherApi.post<ClassPost>(`/classes/${classId}/posts`, payload);
  return response.data;
};

export const updateClassPost = async (
  postId: string,
  payload: Partial<CreateClassPostPayload>
): Promise<ClassPost> => {
  const response = await teacherApi.put<ClassPost>(`/posts/${postId}`, payload);
  return response.data;
};

export const deleteClassPost = async (postId: string): Promise<{ success: boolean }> => {
  const response = await teacherApi.delete<{ success: boolean }>(`/posts/${postId}`);
  return response.data;
};

export default teacherApi;
