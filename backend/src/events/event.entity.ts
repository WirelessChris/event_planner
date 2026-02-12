import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time', nullable: true })
  startTime: string | null;

  @Column({ type: 'time', nullable: true })
  endTime: string | null;

  @Column({ type: 'simple-json', default: '[]' })
  volunteers: string[];

  @Column()
  createdBy: number;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  toCalendarFormat() {
    return {
      id: this.id,
      title: this.title,
      description: this.description || '',
      start: `${this.date}T${this.startTime || '00:00'}`,
      end: `${this.date}T${this.endTime || '23:59'}`,
      volunteers: this.volunteers || [],
    };
  }
}
