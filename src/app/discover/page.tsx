import { Filters } from './Filters';
import { DiscoverProfiles } from './DiscoverProfiles';

export default async function Discover() {
  return (
    <div className="pt-4 px-4">
      <Filters />
      <DiscoverProfiles />
    </div>
  );
}
