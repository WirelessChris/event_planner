import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AddVolunteerDto } from './dto/add-volunteer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Query('start') start?: string, @Query('end') end?: string) {
    const events = await this.eventsService.findAll(start, end);
    return events.map((event) => event.toCalendarFormat());
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.findOne(id);
    return {
      id: event.id,
      title: event.title,
      description: event.description || '',
      date: event.date,
      start_time: event.startTime || '',
      end_time: event.endTime || '',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createEventDto: CreateEventDto, @Request() req: any) {
    const event = await this.eventsService.create(createEventDto, req.user.id);
    return event.toCalendarFormat();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventsService.update(id, updateEventDto);
    return event.toCalendarFormat();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.eventsService.remove(id);
    return { message: 'Event deleted successfully' };
  }

  @Post(':id/volunteer')
  async addVolunteer(
    @Param('id', ParseIntPipe) id: number,
    @Body() addVolunteerDto: AddVolunteerDto,
  ) {
    const event = await this.eventsService.addVolunteer(id, addVolunteerDto.name);
    return event.toCalendarFormat();
  }

  @Delete(':id/volunteer')
  async removeVolunteer(
    @Param('id', ParseIntPipe) id: number,
    @Body() addVolunteerDto: AddVolunteerDto,
  ) {
    const event = await this.eventsService.removeVolunteer(id, addVolunteerDto.name);
    return event.toCalendarFormat();
  }
}
