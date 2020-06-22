import React, { SyntheticEvent } from 'react'
import { RootStore } from './rootStore';
import { observable, computed, action } from 'mobx';
import { IActivity, IActivityBooking } from '../models/Activity';
import agent from '../../components/cars/api/agent';

export default class ActivityStore {

    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @observable adminActivityList: IActivity[] = [];
    @observable clientActivityList: IActivity[] = [];
    @observable selectedActivity: IActivity | undefined | null;
    @observable OfferedActivity: IActivity | undefined = undefined;
    @observable loadingInitial = false;
    @observable editMode = false;
    @observable submitting = false;
    @observable target = '';
    @observable activityBookingToAdd: IActivityBooking | undefined = {
        productid: "",
        activityDate: undefined,
        adults: "",
        kids: ""
    };

    @computed get adminActivitiesByPrice() {
        return this.adminActivityList.slice().sort(
            (a, b) => Number(a.price) - Number(b.price)
        );
    }

    @computed get ClientActivitiesByPrice() {
        return this.clientActivityList.slice().sort(
            (a, b) => Number(a.price) - Number(b.price)
        );
    }

    @action loadAdminActivities = async (name: string | undefined) => {
        this.loadingInitial = true;
        try {

            const activities = await agent.Activities.adminActivities(name);
            activities.forEach((activity) => {
                this.adminActivityList.push(activity);
            });
            this.loadingInitial = false;
        } catch (error) {
            console.log(error);
            this.loadingInitial = false;
        }
    };

    @action loadAllActivities = async () => {
        this.loadingInitial = true;
        try {

            const activities = await agent.Activities.list();
            activities.forEach((activity) => {
                this.clientActivityList.push(activity);
            });
            this.loadingInitial = false;
        } catch (error) {
            console.log(error);
            this.loadingInitial = false;
        }
    };

    @action loadOfferedActivity = async (id: string) => {
        let activity = this.clientActivityList.find(x => x.id === id);
        if (activity) {
            this.OfferedActivity = activity;
        }
        else
            try {
                activity = await agent.Activities.details(id);
                this.OfferedActivity = activity;
            } catch (error) {
                console.log(error);
            }
    }

    @action emptyAdminActivities = () => {
        this.adminActivityList = [];
    }

    @action emptyAllActivities = () => {
        this.clientActivityList = [];
    }

    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);
            this.adminActivityList.push(activity);
            this.editMode = false;
            this.submitting = false;
        } catch (error) {
            this.submitting = false;
            console.log(error);
        }
    };

    @action createActivityBooking = async (activityBooking: IActivityBooking) => {
        this.submitting = true;
        try {
            this.activityBookingToAdd = activityBooking;
            await agent.Activities.createBooking(activityBooking);
            this.rootStore.modalStore.closeModal();
        } catch (error) {
            this.submitting = false;
            console.log(error);
        }
    };


    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity);
            this.adminActivityList.splice(this.adminActivityList.findIndex(a => a.id === activity.id), 1);
            this.adminActivityList.push(activity);
            this.selectedActivity = activity;
            this.editMode = false;
            this.submitting = false;
        } catch (error) {
            this.submitting = false;
            console.log(error);
        }
    }

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
        this.submitting = true;
        this.target = event.currentTarget.name;
        try {
            await agent.Activities.delete(id);
            this.adminActivityList.splice(this.adminActivityList.findIndex(a => a.id === id), 1);
            this.submitting = false;
            this.target = '';
        } catch (error) {
            this.submitting = false;
            this.target = '';
            console.log(error);
        }
    }

    @action openCreateForm = () => {
        this.editMode = true;
        this.selectedActivity = undefined;
    };

    @action openEditForm = (id: string) => {
        this.selectedActivity = this.adminActivityList.find(a => a.id === id);
        this.editMode = true;
    }

    @action cancelSelectedActivity = () => {
        this.selectedActivity = undefined;
    }

    @action cancelFormOpen = () => {
        this.editMode = false;
    }

    @action selectActivity = (id: string) => {
        this.selectedActivity = this.adminActivityList.find(a => a.id === id);
        this.editMode = false;
    };


}