import axios, { AxiosResponse } from "axios";
import { ICar, ICarBooking } from "../../../app/models/Car";
import { IUser, IUserFormValues } from "../../../app/models/User";
import { history } from "../../..";
import { toast } from "react-toastify";

axios.defaults.baseURL = 'http://localhost:5000';

axios.interceptors.request.use((config) => {
    const token = window.localStorage.getItem('jwt');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config
}, error => {
    return Promise.reject(error);
})

axios.interceptors.response.use(undefined, (error) => {
    if (error.message === 'Network Error' && !error.response) {
        toast.error('Network error - Make sure your API is running!')
    }

    const { status } = error.response;
    if (error.response.status === 404) {
        history.push('/notfound');
    }

    if (status === 500) {
        toast.error('Server error - check the terminal for more info');
    }
    throw error.response;
})


const responseBody = (response: AxiosResponse) => response.data;

const sleep = (ms: number) => (response: AxiosResponse) =>
    new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms));

const requests = {
    get: (url: string) => axios.get(url).then(sleep(1000)).then(responseBody),
    post: (url: string, body: {}) => axios.post(url, body).then(sleep(1000)).then(responseBody),
    put: (url: string, body: {}) => axios.put(url, body).then(sleep(1000)).then(responseBody),
    del: (url: string) => axios.delete(url).then(sleep(1000)).then(responseBody),
};

const Cars = {
    list: (): Promise<ICar[]> => requests.get('/cars'),
    adminCars: (name: string | undefined):Promise<ICar[]> => requests.get(`cars/adminCars/${name}`),
    details: (id: string) => requests.get(`/cars/${id}`),
    create: (car: ICar) => requests.post('/cars', car),
    update: (car: ICar) => requests.put(`/cars/${car.id}`, car),
    delete: (id: string) => requests.del(`/cars/${id}`),
    createBooking:(carbooking: ICarBooking) => requests.post('carbooking', carbooking)
}

const User = {
    listadmins: (): Promise<IUserFormValues[]> => requests.get('users/admins'),
    listsudoadmins: (): Promise<IUserFormValues[]> => requests.get('users/sudoadmins'),
    current: (): Promise<IUser> => requests.get('/users'),
    login: (user: IUserFormValues): Promise<IUser> => requests.post('/users/login', user),
    register: (user: IUserFormValues): Promise<IUser> => requests.post('/users/register', user),
}

export default {
    Cars,
    User
}