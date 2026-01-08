import axios from "axios";

const API = "http://localhost:5000/api/penanganan";

export const getAllPenanganan = () => axios.get(API);
export const getPenangananById = (id) => axios.get(`${API}/${id}`);
export const createPenanganan = (data) => axios.post(API, data);
export const updatePenanganan = (id, data) => axios.put(`${API}/${id}`, data);
export const deletePenanganan = (id) => axios.delete(`${API}/${id}`);
