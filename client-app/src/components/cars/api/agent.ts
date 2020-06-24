import axios, { AxiosResponse } from "axios";
import { ICar, ICarBooking } from "../../../app/models/Car";
import { IUser, IUserFormValues } from "../../../app/models/User";
import { history } from "../../..";
import { toast } from "react-toastify";
import { IHotel, IHotelBooking } from "../../../app/models/Hotel";
import { IFlight, IFlightBooking } from "../../../app/models/Flight";
import { IActivity, IActivityBooking } from "../../../app/models/Activity";

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
    adminCars: (name: string | undefined): Promise<ICar[]> => requests.get(`cars/adminCars/${name}`),
    details: (id: string) => requests.get(`/cars/${id}`),
    create: (car: ICar) => requests.post('/cars', car),
    update: (car: ICar) => requests.put(`/cars/${car.id}`, car),
    delete: (id: string) => requests.del(`/cars/${id}`),
    createBooking: (carbooking: ICarBooking) => requests.post('carbooking', carbooking),
    listBookedCars: (name: string | undefined): Promise<ICarBooking[]> => requests.get(`carbooking/${name}`),
    deleteBooking: (id: number) => requests.del(`/carbooking/${id}`),
}

const Hotels = {
    list: (): Promise<IHotel[]> => requests.get('/hotel'),
    adminHotels: (name: string | undefined): Promise<IHotel[]> => requests.get(`hotel/adminHotels/${name}`),
    details: (id: string) => requests.get(`/hotel/${id}`),
    create: (hotel: IHotel) => requests.post('/hotel', hotel),
    update: (hotel: IHotel) => requests.put(`/hotel/${hotel.id}`, hotel),
    delete: (id: string) => requests.del(`/hotel/${id}`),
    createBooking: (hotelbooking: IHotelBooking) => requests.post('hotelbooking', hotelbooking),
    listBookedHotels: (name: string | undefined): Promise<IHotelBooking[]> => requests.get(`hotelbooking/${name}`),
    deleteBooking: (id: number) => requests.del(`/hotelbooking/${id}`),
}

const Flights = {
    list: (): Promise<IFlight[]> => requests.get('/flight'),
    adminFlights: (name: string | undefined): Promise<IFlight[]> => requests.get(`flight/adminFlights/${name}`),
    details: (id: string) => requests.get(`/flight/${id}`),
    create: (flight: IFlight) => requests.post('/flight', flight),
    update: (flight: IFlight) => requests.put(`/flight/${flight.id}`, flight),
    delete: (id: string) => requests.del(`/flight/${id}`),
    createBooking: (flightbooking: IFlightBooking) => requests.post('flightbooking', flightbooking),
    listBookedFlights: (name: string | undefined): Promise<IFlightBooking[]> => requests.get(`flightbooking/${name}`),
    deleteBooking: (id: number) => requests.del(`/flightbooking/${id}`),
}

const Activities = {
    list: (): Promise<IActivity[]> => requests.get('/activity'),
    adminActivities: (name: string | undefined): Promise<IActivity[]> => requests.get(`activity/adminactivities/${name}`),
    details: (id: string) => requests.get(`/activity/${id}`),
    create: (activity: IActivity) => requests.post('/activity', activity),
    update: (activity: IActivity) => requests.put(`/activity/${activity.id}`, activity),
    delete: (id: string) => requests.del(`/activity/${id}`),
    createBooking: (activitybooking: IActivityBooking) => requests.post('activitybooking', activitybooking),
    listBookedActivities: (name: string | undefined): Promise<IActivityBooking[]> => requests.get(`activitybooking/${name}`),
    deleteBooking: (id: number) => requests.del(`/activitybooking/${id}`),
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
    User,
    Hotels,
    Flights,
    Activities
}