import Calendar from 'react-calendar';
import '@/components/css/Calendar.css'
export const metadata = {
  title: 'CampusConnect | Event',
};

export default async function Page() {
    return (
        <div className="px-4 pt-4">
            <h1 className="mb-4 text-4xl font-bold">Event</h1>
            <div className="grid place-content-center">
                <Calendar />
            </div>
        </div>
    );
}
