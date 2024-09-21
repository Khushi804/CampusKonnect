import Link from 'next/link';
import { FallbackProfilePhoto } from './FallbackProfilePhoto';

export function ProfilePhoto({
  name,
  photoUrl,
  username,
  fallbackAvatarClassName,
}: {
  name: string;
  username: string;
  photoUrl?: string | null;
  fallbackAvatarClassName?: string;
}) {
  return (
    <Link href={`/${username}`}>
        <FallbackProfilePhoto name={name} className={fallbackAvatarClassName} />
    </Link>
  );
}
