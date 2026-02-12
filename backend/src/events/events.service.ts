import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async findAll(start?: string, end?: string): Promise<Event[]> {
    const query: any = {};

    if (start && end) {
      return this.eventsRepository.find({
        where: {
          date: Between(start.split('T')[0], end.split('T')[0]),
        },
        order: { date: 'ASC' },
      });
    }

    if (start) {
      query.date = MoreThanOrEqual(start.split('T')[0]);
    }

    if (end) {
      query.date = LessThanOrEqual(end.split('T')[0]);
    }

    return this.eventsRepository.find({
      where: Object.keys(query).length > 0 ? query : undefined,
      order: { date: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async create(createEventDto: CreateEventDto, userId: number): Promise<Event> {
    const event = this.eventsRepository.create({
      title: createEventDto.title,
      description: createEventDto.description || '',
      date: createEventDto.date,
      startTime: createEventDto.start_time || null,
      endTime: createEventDto.end_time || null,
      createdBy: userId,
    });

    return this.eventsRepository.save(event);
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    event.title = updateEventDto.title;
    event.description = updateEventDto.description || '';
    event.date = updateEventDto.date;
    event.startTime = updateEventDto.start_time || null;
    event.endTime = updateEventDto.end_time || null;

    return this.eventsRepository.save(event);
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }

  async addVolunteer(id: number, name: string): Promise<Event> {
    const event = await this.findOne(id);

    if (!event.volunteers) {
      event.volunteers = [];
    }

    if (!event.volunteers.includes(name)) {
      event.volunteers.push(name);
    }

    return this.eventsRepository.save(event);
  }

  async removeVolunteer(id: number, name: string): Promise<Event> {
    const event = await this.findOne(id);

    if (event.volunteers) {
      event.volunteers = event.volunteers.filter((v) => v !== name);
    }

    return this.eventsRepository.save(event);
  }
}
