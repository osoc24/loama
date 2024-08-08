export interface Post {
    text: string;
    video?: string;
    image?: string;
}

export interface Appointment {
    type?: string;
    location?: string;
    provider?: string;
    date?: string;
    time?: string;
  }
  
