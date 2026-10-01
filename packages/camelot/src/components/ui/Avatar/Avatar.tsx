import { cn } from "../../../lib/cn";
import { initials } from "../../../lib/initials";
import styles from "./Avatar.module.css";

export { initials };

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 20 | 24 | 28 | 32 | 36;
  square?: boolean;
  className?: string;
}

export function Avatar({ name, src, size = 28, square, className }: AvatarProps) {
  return (
    <span
      className={cn(styles.avatar, square && styles.square, className)}
      style={{ width: size, height: size, fontSize: size <= 24 ? 9.5 : 11 }}
      title={name}
    >
      {src ? <img src={src} alt="" className={styles.img} /> : <span aria-hidden="true">{initials(name)}</span>}
      <span className="visually-hidden">{name}</span>
    </span>
  );
}
