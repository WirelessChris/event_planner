import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Event } from '../events/event.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 80, unique: true })
  username: string;

  @Column({ length: 256 })
  passwordHash: string;

  @Column({ default: true })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Event, (event) => event.creator)
  events: Event[];
}
