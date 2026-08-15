import apiClient from './apiClient';

export const assignmentService = {
  // Admin Endpoints
  async createAssignment(data) {
    const response = await apiClient.post('/assignments/admin', data);
    return response.data;
  },

  async getAdminAssignments(params = {}) {
    const response = await apiClient.get('/assignments/admin', { params });
    return response.data;
  },

  async getAssignmentByIdAdmin(id) {
    const response = await apiClient.get(`/assignments/admin/${id}`);
    return response.data;
  },

  async updateAssignmentAdmin(id, data) {
    const response = await apiClient.patch(`/assignments/admin/${id}`, data);
    return response.data;
  },

  async cancelAssignmentAdmin(id) {
    const response = await apiClient.patch(`/assignments/admin/${id}/cancel`);
    return response.data;
  },

  // Writer Endpoints
  async getWriterAssignments(params = {}) {
    const response = await apiClient.get('/assignments/writer', { params });
    return response.data;
  },

  async getWriterAssignmentById(id) {
    const response = await apiClient.get(`/assignments/writer/${id}`);
    return response.data;
  },

  async startAssignmentWriter(id) {
    const response = await apiClient.patch(`/assignments/writer/${id}/start`);
    return response.data;
  },
};

export default assignmentService;
